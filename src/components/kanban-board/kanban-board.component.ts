
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Activity, ActivityStatus, Project } from '../../services/data.service';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full overflow-hidden animate-fade-in">
      <!-- Header / Filters -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
         <div>
           <h2 class="text-3xl font-bold text-slate-800">Mis Tareas</h2>
           <p class="text-slate-500 mt-1">Gestión visual de actividades (Kanban)</p>
         </div>
         
         <div class="relative w-full sm:w-64 animate-fade-in">
           <select 
             [(ngModel)]="selectedProjectId"
             class="appearance-none w-full bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm font-medium text-sm transition-all"
           >
             <option [value]="0">Todos los Proyectos</option>
             @for (proj of myProjects(); track proj.id) {
               <option [value]="proj.id">{{ proj.name }}</option>
             }
           </select>
           <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
           </div>
         </div>
      </div>

      <!-- Kanban Columns -->
      <div class="flex-1 flex gap-6 overflow-x-auto pb-4">
        
        <!-- PENDIENTE -->
        <div class="flex-1 min-w-[300px] bg-slate-100/50 rounded-2xl flex flex-col border border-slate-200/60"
             (dragover)="onDragOver($event)"
             (drop)="onDrop($event, 'PENDIENTE')">
           <div class="p-4 border-b border-slate-200/60 flex items-center gap-2">
             <div class="w-3 h-3 rounded-full bg-slate-400"></div>
             <h3 class="font-bold text-red-900 uppercase tracking-wide text-sm">Pendiente</h3>
             <span class="ml-auto bg-white px-2 py-0.5 rounded-md text-xs font-bold text-slate-500 border border-slate-200">{{ pendingActivities().length }}</span>
           </div>
           
           <div class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
             @for (act of pendingActivities(); track act.id) {
                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-move hover:shadow-md transition-all active:cursor-grabbing group relative"
                     draggable="true"
                     (dragstart)="onDragStart($event, act)"
                     [class.border-l-4]="getUrgencyColor(act) !== ''"
                     [ngClass]="getUrgencyColor(act)">
                   
                   <div class="flex justify-between items-start mb-2">
                      <span class="text-[10px] font-bold px-2 py-1 rounded bg-slate-50 text-slate-600 border border-slate-200 truncate max-w-[120px]">
                        {{ getProjectName(act.projectId) }}
                      </span>
                      <div class="flex items-center gap-2">
                        @if (canEdit(act)) {
                            <button (click)="openEditModal(act)" class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-blue-500 transition-all">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                        }
                        @if (hasFiles(act.projectId)) {
                            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        }
                      </div>
                   </div>
                   
                   <p class="text-sm font-bold text-slate-700 mb-3 leading-snug">{{ act.description }}</p>
                   
                   <div class="flex items-center justify-between mt-auto">
                     <div class="flex items-center gap-2">
                        <img [src]="getUser(act.responsibleId)?.avatar" class="w-6 h-6 rounded-full bg-slate-200" title="Responsable">
                        <span class="text-xs text-slate-500 font-medium">{{ getUser(act.responsibleId)?.name.split(' ')[0] }}</span>
                     </div>
                     <span class="text-[10px] font-bold select-none" [ngClass]="getUrgencyTextClass(act)">
                        {{ getUrgencyLabel(act) }}
                     </span>
                   </div>
                </div>
             }
           </div>
        </div>

        <!-- EN PROCESO -->
        <div class="flex-1 min-w-[300px] bg-slate-100/50 rounded-2xl flex flex-col border border-slate-200/60"
             (dragover)="onDragOver($event)"
             (drop)="onDrop($event, 'EN_PROCESO')">
           <div class="p-4 border-b border-slate-200/60 flex items-center gap-2">
             <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
             <h3 class="font-bold text-red-900 uppercase tracking-wide text-sm">En Proceso</h3>
             <span class="ml-auto bg-white px-2 py-0.5 rounded-md text-xs font-bold text-slate-500 border border-slate-200">{{ progressActivities().length }}</span>
           </div>

           <div class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
             @for (act of progressActivities(); track act.id) {
                <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-move hover:shadow-md transition-all active:cursor-grabbing group relative overflow-hidden"
                     draggable="true"
                     (dragstart)="onDragStart($event, act)">
                   <div class="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                   
                   <div class="flex justify-between items-start mb-2 pl-2">
                      <span class="text-[10px] font-bold px-2 py-1 rounded bg-red-50 text-red-700 border border-red-100 truncate max-w-[120px]">
                        {{ getProjectName(act.projectId) }}
                      </span>
                      <div class="flex items-center gap-2">
                          @if (canEdit(act)) {
                            <button (click)="openEditModal(act)" class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-blue-500 transition-all z-10 relative">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                          }
                          @if (hasFiles(act.projectId)) {
                            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                          }
                      </div>
                   </div>
                   
                   <p class="text-sm font-bold text-slate-700 mb-3 leading-snug pl-2">{{ act.description }}</p>
                   
                   <div class="flex items-center justify-between mt-auto pl-2">
                     <div class="flex items-center gap-2">
                        <img [src]="getUser(act.responsibleId)?.avatar" class="w-6 h-6 rounded-full bg-slate-200">
                        <span class="text-xs text-slate-500 font-medium">{{ getUser(act.responsibleId)?.name.split(' ')[0] }}</span>
                     </div>
                     <span class="text-[10px] text-red-600 font-bold">En curso</span>
                   </div>
                </div>
             }
           </div>
        </div>

        <!-- REALIZADA -->
        <div class="flex-1 min-w-[300px] bg-slate-100/50 rounded-2xl flex flex-col border border-slate-200/60"
             (dragover)="onDragOver($event)"
             (drop)="onDrop($event, 'REALIZADA')">
           <div class="p-4 border-b border-slate-200/60 flex items-center gap-2">
             <div class="w-3 h-3 rounded-full bg-green-500"></div>
             <h3 class="font-bold text-red-900 uppercase tracking-wide text-sm">Realizada</h3>
             <span class="ml-auto bg-white px-2 py-0.5 rounded-md text-xs font-bold text-slate-500 border border-slate-200">{{ doneActivities().length }}</span>
           </div>

           <div class="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
             @for (act of doneActivities(); track act.id) {
                <!-- Removed draggable="true" and (dragstart) to prevent moving completed items -->
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 cursor-default transition-all opacity-80 hover:opacity-100 group relative">
                   
                   <div class="flex justify-between items-start mb-2">
                      <span class="text-[10px] font-bold px-2 py-1 rounded bg-slate-200 text-slate-600 border border-slate-300 truncate max-w-[120px]">
                        {{ getProjectName(act.projectId) }}
                      </span>
                      <div class="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                         <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                   </div>
                   
                   <p class="text-sm font-medium text-slate-500 line-through mb-3 leading-snug">{{ act.description }}</p>
                   
                   <div class="flex items-center justify-between mt-auto">
                     <div class="flex items-center gap-2 grayscale opacity-70">
                        <img [src]="getUser(act.responsibleId)?.avatar" class="w-6 h-6 rounded-full bg-slate-200">
                        <span class="text-xs text-slate-500 font-medium">{{ getUser(act.responsibleId)?.name.split(' ')[0] }}</span>
                     </div>
                     <span class="text-[10px] text-green-700 font-bold">{{ act.actualEndDate }}</span>
                   </div>

                   <!-- Optional Lock Icon to indicate fixed state -->
                   <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                   </div>
                </div>
             }
           </div>
        </div>
      </div>
      
      <!-- Edit Modal -->
      @if (isEditing()) {
          <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
             <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
                <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    Editar Tarea
                </h3>
                
                <div class="space-y-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1">Descripción</label>
                      <input type="text" [(ngModel)]="editDesc" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                       <div>
                         <label class="block text-xs font-bold text-slate-500 mb-1">Inicio</label>
                         <input type="date" [(ngModel)]="editStart" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none text-slate-900">
                       </div>
                       <div>
                         <label class="block text-xs font-bold text-slate-500 mb-1">Fin Estimado</label>
                         <input type="date" [(ngModel)]="editEnd" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none text-slate-900">
                       </div>
                    </div>

                    <div>
                      <label class="block text-xs font-bold text-slate-500 mb-1">Responsable</label>
                      <select [(ngModel)]="editResp" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none text-slate-900">
                        @for (user of getAllUsers(); track user.id) {
                            <option [value]="user.id">{{ user.name }} ({{ user.subRole || user.role }})</option>
                        }
                      </select>
                    </div>

                    <div class="flex items-center gap-3 pt-4">
                       <button (click)="closeEditModal()" class="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
                       <button (click)="saveEdit()" class="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">Guardar Cambios</button>
                    </div>
                </div>
             </div>
          </div>
      }

    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class KanbanBoardComponent {
  dataService = inject(DataService);

  selectedProjectId = signal<number>(0);

  constructor() { }

  currentUser = this.dataService.currentUser;

  myProjects = computed(() => {
    return this.dataService.filteredProjects();
  });

  filteredActivities = computed(() => {
    const user = this.currentUser();
    let activities = this.dataService.getAllActivities();

    // 1. Filter by User Hierarchy logic
    if (user.role === 'ADMIN' || user.subRole === 'GERENTE' || user.subRole === 'JEFE') {
      // Managers see everything in their scope (filteredProjects logic already handles scope mostly, but let's be safe)
      const visibleProjectIds = this.dataService.filteredProjects().map(p => p.id);
      activities = activities.filter(a => visibleProjectIds.includes(a.projectId));
    } else {
      // Assistants only see THEIR tasks
      activities = activities.filter(a => a.responsibleId === user.id);
    }

    // 2. Filter by Selected Project Dropdown
    if (this.selectedProjectId() !== 0) {
      activities = activities.filter(a => a.projectId === +this.selectedProjectId());
    }

    return activities;
  });

  // Columns derived from filtered activities, SORTED by estimatedEndDate
  pendingActivities = computed(() => {
    return this.filteredActivities()
      .filter(a => a.status === 'PENDIENTE')
      .sort((a, b) => this.sortByDate(a, b));
  });

  progressActivities = computed(() => {
    return this.filteredActivities()
      .filter(a => a.status === 'EN_PROCESO')
      .sort((a, b) => this.sortByDate(a, b));
  });

  doneActivities = computed(() => {
    return this.filteredActivities()
      .filter(a => a.status === 'REALIZADA')
      .sort((a, b) => this.sortByDate(a, b, true));
  });

  sortByDate(a: Activity, b: Activity, descending = false): number {
    const dateA = a.estimatedEndDate || '9999-12-31';
    const dateB = b.estimatedEndDate || '9999-12-31';
    return descending ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
  }

  // --- Edit Modal Logic ---
  isEditing = signal(false);
  editingActivity = signal<Activity | null>(null);

  // Edit Form Signals
  editDesc = signal('');
  editStart = signal('');
  editEnd = signal('');
  editResp = signal<number>(0);

  openEditModal(act: Activity) {
    this.editingActivity.set(act);
    this.editDesc.set(act.description);
    this.editStart.set(act.startDate);
    this.editEnd.set(act.estimatedEndDate);
    this.editResp.set(act.responsibleId);
    this.isEditing.set(true);
  }

  closeEditModal() {
    this.isEditing.set(false);
    this.editingActivity.set(null);
  }

  async saveEdit() {
    const act = this.editingActivity();
    if (!act) return;

    await this.dataService.updateActivity({
      id: act.id,
      description: this.editDesc(),
      startDate: this.editStart(),
      estimatedEndDate: this.editEnd(),
      responsibleId: this.editResp()
    });

    this.closeEditModal();
  }

  canEdit(act: Activity): boolean {
    if (act.status === 'REALIZADA') return false;
    const user = this.currentUser();
    if (!user) return false;

    // Admin, Boss, Manager OR Responsible can edit
    if (user.role === 'ADMIN' || user.subRole === 'GERENTE' || user.subRole === 'JEFE') return true;
    return act.responsibleId === user.id;
  }

  // --- Helpers ---

  getProjectName(id: number) {
    return this.dataService.getProjectById(id)?.name || '...';
  }

  getUser(id: number) {
    return this.dataService.getAllUsers().find(u => u.id === id);
  }

  getAllUsers() {
    return this.dataService.getAllUsers();
  }

  hasFiles(projectId: number): boolean {
    return this.dataService.getFilesByProject(projectId).length > 0;
  }

  getUrgencyColor(act: Activity): 'border-l-red-500' | 'border-l-yellow-500' | 'border-l-green-500' | '' {
    if (act.status === 'REALIZADA' || !act.estimatedEndDate) return '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse estimatedEndDate (assuming YYYY-MM-DD string)
    // We append 'T00:00:00' to ensure local time or treat as UTC? 
    // Standard practice here: assume string is YYYY-MM-DD
    const [year, month, day] = act.estimatedEndDate.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'border-l-red-500'; // Overdue
    if (diffDays <= 3) return 'border-l-yellow-500'; // Due Soon (<= 3 days)
    if (diffDays <= 7) return 'border-l-green-500'; // Upcoming (<= 7 days)

    return ''; // Normal
  }

  getUrgencyTextClass(act: Activity): string {
    const colorClass = this.getUrgencyColor(act);
    if (colorClass === 'border-l-red-500') return 'text-red-500';
    if (colorClass === 'border-l-yellow-500') return 'text-yellow-600';
    if (colorClass === 'border-l-green-500') return 'text-green-600';
    return 'text-slate-400';
  }

  getUrgencyLabel(act: Activity): string {
    const colorClass = this.getUrgencyColor(act);
    if (colorClass === 'border-l-red-500') return 'Vencida';
    if (colorClass === 'border-l-yellow-500') return 'Próxima';
    if (colorClass === 'border-l-green-500') return 'Esta semana';
    return act.estimatedEndDate || '';
  }

  // --- Drag & Drop Logic ---

  onDragStart(event: DragEvent, activity: Activity) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify(activity.id));
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Necessary to allow dropping
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, newStatus: ActivityStatus) {
    event.preventDefault();
    if (event.dataTransfer) {
      const id = +event.dataTransfer.getData('text/plain');
      if (id) {
        // Security Check: Can this user move this task?
        // Logic: Assistants can move their own tasks. Managers can move any visible task.
        const activity = this.dataService.getAllActivities().find(a => a.id === id);
        if (activity) {
          const user = this.currentUser();
          const canMove = (user.role === 'ADMIN' || user.subRole === 'GERENTE' || user.subRole === 'JEFE') || (activity.responsibleId === user.id);

          if (canMove) {
            // Call service to update state + cascade logic
            this.dataService.updateActivityStatus(id, newStatus);
          } else {
            alert('No tienes permisos para mover esta actividad.');
          }
        }
      }
    }
  }
}
