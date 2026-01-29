
import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Configuration ---
const SUPABASE_URL = 'https://bedfqfvakcnfemjrztgu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LhZaMW6mITqlC_Z5rPzbZA_ftL8CKQI';

// --- Interfaces ---
export type Role = 'ADMIN' | 'USUARIO';
export type SubRole = 'GERENTE' | 'JEFE' | 'ASISTENTE' | null;
export type Currency = 'PEN' | 'USD';
export type ProjectStatus = 'PLANIFICACION' | 'EN_PROGRESO' | 'FINALIZADO';
export type ActivityStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'REALIZADA';

export type ExpenseCategory = 'MATERIALES' | 'MANO_OBRA' | 'TRANSPORTE' | 'OTROS';
export type FileType = 'PDF' | 'IMG' | 'EXCEL' | 'OTRO';
export type IndicatorCategory = 'HORAS_HOMBRE' | 'INSUMOS' | 'RIESGOS';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: Role;
  subRole: SubRole;
  areaId: number;
  reportsToId: number | null;
  avatar: string;
}

export interface Area {
  id: number;
  name: string;
}

export interface Activity {
  id: number;
  projectId: number;
  description: string;
  responsibleId: number;
  startDate: string;
  estimatedEndDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  status: ActivityStatus;
}

export interface Expense {
  id: number;
  projectId: number;
  description: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  date: string;
  userId: number;
}

export interface ProjectFile {
  id: number;
  projectId: number;
  name: string;
  type: FileType;
  url: string;
  uploadDate: string;
  uploadedBy: number;
}

export interface ImpactIndicator {
  id: number;
  projectId: number;
  name: string;
  category: IndicatorCategory;
  currentValue: number;
  projectedValue: number;
  frequency: number;
  unitCost: number;
  unitLabel: string;
}

// NEW: Config for Multi-Area
export interface AreaLeaderConfig {
  areaId: number;
  leaderId: number;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  areaConfig: AreaLeaderConfig[];
  budget: number;
  currency: Currency;
  startDate: string;
  endDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  teamIds: number[];
  status: ProjectStatus;
  progress: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private supabase: SupabaseClient;

  // --- State Signals (Single Source of Truth) ---
  private _areas = signal<Area[]>([]);
  private _users = signal<User[]>([]);
  private _projects = signal<Project[]>([]);
  private _activities = signal<Activity[]>([]);
  private _expenses = signal<Expense[]>([]);
  private _files = signal<ProjectFile[]>([]);
  private _indicators = signal<ImpactIndicator[]>([]);

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    this.initializeData();
  }

  // --- Initialization ---
  private async initializeData() {
    await this.loadAreas();
    await this.loadUsers();
    await this.loadProjects();
    await this.loadActivities();
    await this.loadExpenses();
    await this.loadFiles();
    await this.loadIndicators();
    this.checkSession();
  }

  private checkSession() {
    try {
      const savedUser = localStorage.getItem('sole_session_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const exists = this._users().find(u => u.id === user.id);
        if (exists) {
          this.currentUser.set(exists);
          this.isAuthenticated.set(true);
        }
      }
    } catch (e) {
      console.warn('Error reviving session:', e);
    }
  }

  // --- Fetch Methods (Mapping Snake_case DB to CamelCase App) ---

  async loadAreas() {
    const { data } = await this.supabase.from('areas').select('*');
    if (data) this._areas.set(data);
  }

  async loadUsers() {
    const { data } = await this.supabase.from('users').select('*');
    if (data) {
      const mapped: User[] = data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        subRole: u.sub_role,
        areaId: u.area_id,
        reportsToId: u.reports_to_id,
        avatar: u.avatar || 'https://i.pravatar.cc/150'
      }));
      this._users.set(mapped);
    }
  }

  async loadProjects() {
    // Join with config and team members
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        project_area_config (area_id, leader_id),
        project_team_members (user_id)
      `)
      .order('id', { ascending: false });

    if (data) {
      const mapped: Project[] = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        budget: p.budget,
        currency: p.currency,
        startDate: p.start_date,
        endDate: p.end_date,
        actualStartDate: p.actual_start_date,
        actualEndDate: p.actual_end_date,
        status: p.status,
        progress: p.progress,
        areaConfig: p.project_area_config.map((c: any) => ({ areaId: c.area_id, leaderId: c.leader_id })),
        teamIds: p.project_team_members.map((m: any) => m.user_id)
      }));
      this._projects.set(mapped);
    }
  }

  async loadActivities() {
    const { data } = await this.supabase.from('activities').select('*').order('id');
    if (data) {
      const mapped: Activity[] = data.map((a: any) => ({
        id: a.id,
        projectId: a.project_id,
        description: a.description,
        responsibleId: a.responsible_id,
        startDate: a.start_date,
        estimatedEndDate: a.estimated_end_date,
        actualStartDate: a.actual_start_date,
        actualEndDate: a.actual_end_date,
        status: a.status
      }));
      this._activities.set(mapped);
    }
  }

  async loadExpenses() {
    const { data } = await this.supabase.from('expenses').select('*');
    if (data) {
      const mapped: Expense[] = data.map((e: any) => ({
        id: e.id,
        projectId: e.project_id,
        description: e.description,
        amount: e.amount,
        currency: e.currency,
        category: e.category,
        date: e.date,
        userId: e.user_id
      }));
      this._expenses.set(mapped);
    }
  }

  async loadFiles() {
    const { data } = await this.supabase.from('files').select('*');
    if (data) {
      const mapped: ProjectFile[] = data.map((f: any) => ({
        id: f.id,
        projectId: f.project_id,
        name: f.name,
        type: f.type,
        url: f.url,
        uploadDate: f.upload_date,
        uploadedBy: f.uploaded_by
      }));
      this._files.set(mapped);
    }
  }

  async loadIndicators() {
    const { data } = await this.supabase.from('impact_indicators').select('*');
    if (data) {
      const mapped: ImpactIndicator[] = data.map((i: any) => ({
        id: i.id,
        projectId: i.project_id,
        name: i.name,
        category: i.category,
        currentValue: i.current_value,
        projectedValue: i.projected_value,
        frequency: i.frequency,
        unitCost: i.unit_cost,
        unitLabel: i.unit_label
      }));
      this._indicators.set(mapped);
    }
  }

  // --- Computed Accessors ---

  mySubordinates = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    const allUsers = this._users();
    if (user.role === 'ADMIN') return allUsers;
    if (user.subRole === 'GERENTE') return allUsers.filter(u => u.areaId === user.areaId && u.id !== user.id);
    if (user.subRole === 'JEFE') return allUsers.filter(u => u.reportsToId === user.id);
    return [];
  });

  filteredProjects = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    const projects = this._projects();
    if (user.role === 'ADMIN') return projects;

    const subordinateIds = this.mySubordinates().map(u => u.id);
    return projects.filter(p => {
      const isLeader = p.areaConfig.some(c => c.leaderId === user.id);
      const isTeam = p.teamIds.includes(user.id);
      const isSubordinateLeader = p.areaConfig.some(c => subordinateIds.includes(c.leaderId));
      const involvesMyArea = p.areaConfig.some(c => c.areaId === user.areaId);
      const isAreaManager = user.subRole === 'GERENTE' && involvesMyArea;
      return isLeader || isTeam || isSubordinateLeader || isAreaManager;
    });
  });

  // --- Auth ---
  async login(email: string, pass: string): Promise<boolean> {
    // For direct DB connection compatibility (as requested), we query the users table directly.
    // In production, use supabase.auth.signInWithPassword
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .eq('password', pass)
      .single();

    if (data) {
      const user: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        subRole: data.sub_role,
        areaId: data.area_id,
        reportsToId: data.reports_to_id,
        avatar: data.avatar || 'https://i.pravatar.cc/150'
      };
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      localStorage.setItem('sole_session_user', JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('sole_session_user');
  }

  // --- CRUD Operations (Writing to DB) ---

  getAllAreas() { return this._areas(); }
  getAllUsers() { return this._users(); }
  getAllActivities() { return this._activities(); }
  getAllExpenses() { return this._expenses(); }
  getAllIndicators() { return this._indicators(); }

  getActivitiesByProject(projectId: number) {
    return this._activities().filter(a => a.projectId === projectId);
  }

  async addActivity(activity: Omit<Activity, 'id' | 'status' | 'actualEndDate' | 'actualStartDate'>) {
    const payload = {
      project_id: activity.projectId,
      description: activity.description,
      responsible_id: activity.responsibleId,
      start_date: activity.startDate,
      estimated_end_date: activity.estimatedEndDate,
      status: 'PENDIENTE'
    };
    await this.supabase.from('activities').insert(payload);
    await this.loadActivities(); // Refresh

    // Trigger logic
    this.checkProjectStatusOnActivityAdded(activity.projectId);
    this.calculateProjectProgress(activity.projectId);
  }

  async updateActivityStatus(activityId: number, newStatus: ActivityStatus) {
    const today = new Date().toISOString().split('T')[0];
    const updatePayload: any = { status: newStatus };

    // Logic for timestamps
    const activity = this._activities().find(a => a.id === activityId);
    if (!activity) return;

    if (newStatus === 'PENDIENTE') {
      updatePayload.actual_start_date = null;
      updatePayload.actual_end_date = null;
    } else if (newStatus === 'EN_PROGRESO') {
      if (!activity.actualStartDate) updatePayload.actual_start_date = today;
      updatePayload.actual_end_date = null;
    } else if (newStatus === 'REALIZADA') {
      if (!activity.actualStartDate) updatePayload.actual_start_date = today;
      if (!activity.actualEndDate) updatePayload.actual_end_date = today;
    }

    await this.supabase.from('activities').update(updatePayload).eq('id', activityId);
    await this.loadActivities();

    // Trigger project updates
    if (newStatus !== 'PENDIENTE') this.ensureProjectInProgress(activity.projectId);
    this.calculateProjectProgress(activity.projectId);
    this.recalculateProjectActualStart(activity.projectId);
  }

  async deleteActivity(activityId: number) {
    const activity = this._activities().find(a => a.id === activityId);
    if (!activity) return;

    await this.supabase.from('activities').delete().eq('id', activityId);
    await this.loadActivities();

    this.calculateProjectProgress(activity.projectId);
    this.recalculateProjectActualStart(activity.projectId);
  }

  getExpensesByProject(projectId: number) { return this._expenses().filter(e => e.projectId === projectId); }

  async addExpense(expense: Omit<Expense, 'id'>) {
    const payload = {
      project_id: expense.projectId,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      date: expense.date,
      user_id: expense.userId
    };
    await this.supabase.from('expenses').insert(payload);
    await this.loadExpenses();
  }

  async deleteExpense(id: number) {
    await this.supabase.from('expenses').delete().eq('id', id);
    await this.loadExpenses();
  }

  getFilesByProject(projectId: number) { return this._files().filter(f => f.projectId === projectId); }

  async addFile(file: Omit<ProjectFile, 'id'>) {
    const payload = {
      project_id: file.projectId,
      name: file.name,
      type: file.type,
      url: file.url,
      uploaded_by: file.uploadedBy,
      upload_date: new Date().toISOString().split('T')[0]
    };
    await this.supabase.from('files').insert(payload);
    await this.loadFiles();
  }

  async deleteFile(id: number) {
    await this.supabase.from('files').delete().eq('id', id);
    await this.loadFiles();
  }

  getIndicatorsByProject(projectId: number) { return this._indicators().filter(i => i.projectId === projectId); }

  async addIndicator(indicator: Omit<ImpactIndicator, 'id'>) {
    const payload = {
      project_id: indicator.projectId,
      name: indicator.name,
      category: indicator.category,
      current_value: indicator.currentValue,
      projected_value: indicator.projectedValue,
      frequency: indicator.frequency,
      unit_cost: indicator.unitCost,
      unit_label: indicator.unitLabel
    };
    await this.supabase.from('impact_indicators').insert(payload);
    await this.loadIndicators();
  }

  async deleteIndicator(id: number) {
    await this.supabase.from('impact_indicators').delete().eq('id', id);
    await this.loadIndicators();
  }

  // --- Project Logic ---

  async addProject(project: Omit<Project, 'id' | 'progress' | 'actualStartDate' | 'actualEndDate'>) {
    // 1. Insert Project
    const { data, error } = await this.supabase.from('projects').insert({
      name: project.name,
      description: project.description,
      budget: project.budget,
      currency: project.currency,
      start_date: project.startDate,
      end_date: project.endDate,
      status: 'PLANIFICACION',
      progress: 0
    }).select().single();

    if (data && !error) {
      const newId = data.id;

      // 2. Insert Area Config
      if (project.areaConfig.length > 0) {
        const areasPayload = project.areaConfig.map(ac => ({
          project_id: newId,
          area_id: ac.areaId,
          leader_id: ac.leaderId
        }));
        await this.supabase.from('project_area_config').insert(areasPayload);
      }

      // 3. Insert Team
      if (project.teamIds.length > 0) {
        const teamPayload = project.teamIds.map(uid => ({
          project_id: newId,
          user_id: uid
        }));
        await this.supabase.from('project_team_members').insert(teamPayload);
      }

      await this.loadProjects();
    }
  }

  async updateProject(p: Project) {
    // Update main table
    await this.supabase.from('projects').update({
      name: p.name,
      description: p.description,
      budget: p.budget,
      currency: p.currency,
      start_date: p.startDate,
      end_date: p.endDate,
      status: p.status,
      progress: p.progress,
      actual_end_date: p.actualEndDate // In case finalized manually
    }).eq('id', p.id);

    // Update Relations (Delete and Re-insert strategy for simplicity)
    await this.supabase.from('project_area_config').delete().eq('project_id', p.id);
    await this.supabase.from('project_team_members').delete().eq('project_id', p.id);

    if (p.areaConfig.length > 0) {
      const areasPayload = p.areaConfig.map(ac => ({
        project_id: p.id,
        area_id: ac.areaId,
        leader_id: ac.leaderId
      }));
      await this.supabase.from('project_area_config').insert(areasPayload);
    }

    if (p.teamIds.length > 0) {
      const teamPayload = p.teamIds.map(uid => ({
        project_id: p.id,
        user_id: uid
      }));
      await this.supabase.from('project_team_members').insert(teamPayload);
    }

    await this.loadProjects();
  }

  async finalizeProject(projectId: number) {
    const today = new Date().toISOString().split('T')[0];
    await this.supabase.from('projects').update({
      status: 'FINALIZADO',
      progress: 100,
      actual_end_date: today
    }).eq('id', projectId);
    await this.loadProjects();
  }

  getProjectById(id: number): Project | undefined {
    return this._projects().find(p => p.id === id);
  }

  // --- Internal Business Logic (Sync back to DB) ---

  private async ensureProjectInProgress(projectId: number) {
    const proj = this._projects().find(p => p.id === projectId);
    if (proj && proj.status === 'PLANIFICACION') {
      await this.supabase.from('projects').update({ status: 'EN_PROGRESO' }).eq('id', projectId);
      this.loadProjects();
    }
  }

  private async checkProjectStatusOnActivityAdded(projectId: number) {
    this.ensureProjectInProgress(projectId);
  }

  private async calculateProjectProgress(projectId: number) {
    const { data } = await this.supabase.from('activities').select('status').eq('project_id', projectId);
    if (!data) return;

    const total = data.length;
    const completed = data.filter((a: any) => a.status === 'REALIZADA').length;
    const newProgress = total === 0 ? 0 : Math.round((completed / total) * 100);

    await this.supabase.from('projects').update({ progress: newProgress }).eq('id', projectId);
    this.loadProjects();
  }

  private recalculateAllProjectsProgress() {
    // Optional: could loop through all projects on init, but expensive. Rely on actions.
  }

  private async recalculateProjectActualStart(projectId: number) {
    const { data } = await this.supabase.from('activities')
      .select('actual_start_date')
      .eq('project_id', projectId)
      .not('actual_start_date', 'is', null)
      .order('actual_start_date', { ascending: true })
      .limit(1);

    let startDate = null;
    if (data && data.length > 0) {
      startDate = data[0].actual_start_date;
    }

    await this.supabase.from('projects').update({ actual_start_date: startDate }).eq('id', projectId);
    this.loadProjects();
  }

  // --- Users & Areas ---

  async addUser(user: Omit<User, 'id'>) {
    await this.supabase.from('users').insert({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      sub_role: user.subRole,
      area_id: user.areaId,
      reports_to_id: user.reportsToId,
      avatar: user.avatar
    });
    await this.loadUsers();
  }

  async updateUser(u: User) {
    await this.supabase.from('users').update({
      name: u.name,
      email: u.email,
      // password: u.password, // Only update if provided logic handled in component
      role: u.role,
      sub_role: u.subRole,
      area_id: u.areaId,
      reports_to_id: u.reportsToId,
      avatar: u.avatar
    }).eq('id', u.id);

    // Special password handling if changed
    if (u.password) {
      await this.supabase.from('users').update({ password: u.password }).eq('id', u.id);
    }

    await this.loadUsers();

    // Update session if self
    const current = this.currentUser();
    if (current && current.id === u.id) {
      this.currentUser.set(u);
      localStorage.setItem('sole_session_user', JSON.stringify(u));
    }
  }

  async deleteUser(userId: number) {
    await this.supabase.from('users').delete().eq('id', userId);
    await this.loadUsers();
  }

  async addArea(name: string) {
    await this.supabase.from('areas').insert({ name });
    await this.loadAreas();
  }

  async updateArea(area: Area) {
    await this.supabase.from('areas').update({ name: area.name }).eq('id', area.id);
    await this.loadAreas();
  }

  async deleteArea(id: number) {
    await this.supabase.from('areas').delete().eq('id', id);
    await this.loadAreas();
  }

  // --- Validation Helpers (Client-side cache is fine for quick check) ---
  isEmailTaken(email: string, excludeUserId?: number): boolean {
    return this._users().some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== excludeUserId);
  }

  isAreaNameTaken(name: string, excludeAreaId?: number): boolean {
    return this._areas().some(a => a.name.toLowerCase() === name.toLowerCase() && a.id !== excludeAreaId);
  }

  canDeleteUser(userId: number): { allowed: boolean, reason?: string } {
    const user = this._users().find(u => u.id === userId);
    if (!user) return { allowed: true };

    const leadingProject = this._projects().find(p => p.areaConfig.some(c => c.leaderId === userId));
    if (leadingProject) return { allowed: false, reason: `Es líder en el proyecto "${leadingProject.name}"` };

    const memberProject = this._projects().find(p => p.teamIds.includes(userId));
    if (memberProject) return { allowed: false, reason: `Es miembro del equipo en el proyecto "${memberProject.name}"` };

    const activity = this._activities().find(a => a.responsibleId === userId);
    if (activity) {
      const proj = this._projects().find(p => p.id === activity.projectId);
      return { allowed: false, reason: `Tiene tareas asignadas en el proyecto "${proj?.name || '...'}"` };
    }
    return { allowed: true };
  }

  hasPendingActivities(projectId: number): boolean {
    return this._activities().some(a => a.projectId === projectId && a.status !== 'REALIZADA');
  }
}
