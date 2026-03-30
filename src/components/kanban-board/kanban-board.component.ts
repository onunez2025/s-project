
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Activity, ActivityStatus, Project } from '../../services/data.service';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full overflow-hidden animate-fade-in pb-4">
      <!-- Header / Filters -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
         <div>
           <h2 class="text-2xl font-bold tracking-tight">Mis Tareas</h2>
           <p class="text-muted-foreground text-xs font-medium">Organiza y completa tus actividades pendientes</p>
         </div>
         
         <div class="relative w-full sm:w-72">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"></path></svg>
            </div>
            <select 
              [(ngModel)]="selectedProjectId"
              class="w-full bg-input/50 border border-input text-foreground py-2 pl-9 pr-10 rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none text-xs font-bold transition-all appearance-none"
            >
              <option [value]="0">Todos los Proyectos</option>
              @for (proj of myProjects(); track proj.id) {
                <option [value]="proj.id">{{ proj.name }}</option>
              }
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
               <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
         </div>
      </div>

      <!-- Kanban Columns -->
      <div class="flex-1 flex gap-4 overflow-x-auto pb-2 min-h-0">
        
        <!-- PENDIENTE -->
        <div class="flex-1 min-w-[320px] bg-muted/30 rounded-lg flex flex-col border border-border/50"
             (dragover)="onDragOver($event)"
             (drop)="onDrop($event, 'PENDIENTE')">
           <div class="p-3 border-b border-border/50 flex items-center justify-between">
             <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-muted-foreground/40"></div>
                <h3 class="font-bold text-xs uppercase tracking-wider text-muted-foreground">Pendientes</h3>
             </div>
             <span class="bg-card text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-bold border border-border shadow-sm">{{ pendingActivities().length }}</span>
           </div>
           
           <div class="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
             @for (act of pendingActivities(); track act.id) {
                <div class="bg-card p-3.5 rounded-lg shadow-sm border hover:shadow-md transition-all active:cursor-grabbing group relative cursor-pointer"
                     draggable="true"
                     (dragstart)="onDragStart($event, act)"
                     (click)="onCardClick(act)"
                     [class.border-l-4]="getUrgencyColor(act) !== ''"
                     [ngClass]="getUrgencyColor(act)">
                   
                   <div class="flex justify-between items-start mb-2">
                       <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border truncate max-w-[140px]">
                         {{ getProjectName(act.projectId) }}
                       </span>
                       <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         @if (canEdit(act)) {
                             <button (click)="$event.stopPropagation(); openEditModal(act)" class="p-1 text-muted-foreground hover:text-primary transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                             </button>
                             <button (click)="$event.stopPropagation(); deleteActivity(act.id)" class="p-1 text-muted-foreground hover:text-destructive transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                             </button>
                         }
                       </div>
                   </div>
                   
                   <p class="text-sm font-medium mb-3 leading-snug">{{ act.description }}</p>
                   
                   <div class="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                      <div class="flex items-center gap-2">
                         <img [src]="getUser(act.responsibleId)?.avatar" class="w-5 h-5 rounded-full bg-muted object-cover border border-border">
                         <span class="text-[10px] text-muted-foreground font-medium">{{ getUser(act.responsibleId)?.name.split(' ')[0] }}</span>
                      </div>
                      <div class="flex items-center gap-1">
                         <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" [ngClass]="getUrgencyTextClass(act)">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                         </svg>
                         <span class="text-[10px] font-bold" [ngClass]="getUrgencyTextClass(act)">
                            {{ getUrgencyLabel(act) }}
                         </span>
                      </div>
                   </div>
                </div>
             }
           </div>
        </div>

        <!-- EN PROCESO -->
        <div class="flex-1 min-w-[320px] bg-muted/30 rounded-lg flex flex-col border border-border/50"
             (dragover)="onDragOver($event)"
             (drop)="onDrop($event, 'EN_PROCESO')">
           <div class="p-3 border-b border-border/50 flex items-center justify-between">
             <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <h3 class="font-bold text-xs uppercase tracking-wider text-muted-foreground">En Proceso</h3>
             </div>
             <span class="bg-card text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-bold border border-border shadow-sm">{{ progressActivities().length }}</span>
           </div>

           <div class="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
             @for (act of progressActivities(); track act.id) {
                <div class="bg-card p-3.5 rounded-lg shadow-sm border border-l-4 border-l-primary cursor-pointer hover:shadow-md transition-all active:cursor-grabbing group relative overflow-hidden"
                     draggable="true"
                     (dragstart)="onDragStart($event, act)"
                     (click)="onCardClick(act)">
                   
                   <div class="flex justify-between items-start mb-2">
                       <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 truncate max-w-[140px]">
                         {{ getProjectName(act.projectId) }}
                       </span>
                       <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           @if (canEdit(act)) {
                             <button (click)="$event.stopPropagation(); openEditModal(act)" class="p-1 text-muted-foreground hover:text-primary transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                             </button>
                             <button (click)="$event.stopPropagation(); deleteActivity(act.id)" class="p-1 text-muted-foreground hover:text-destructive transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                             </button>
                           }
                       </div>
                   </div>
                   
                   <p class="text-sm font-medium mb-3 leading-snug">{{ act.description }}</p>
                   
                   <div class="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                      <div class="flex items-center gap-2">
                         <img [src]="getUser(act.responsibleId)?.avatar" class="w-5 h-5 rounded-full bg-muted object-cover border border-border">
                         <span class="text-[10px] text-muted-foreground font-medium">{{ getUser(act.responsibleId)?.name.split(' ')[0] }}</span>
                      </div>
                      <div class="flex items-center gap-1">
                         <span class="text-[10px] text-primary font-bold">En curso</span>
                      </div>
                   </div>
                </div>
             }
           </div>
        </div>

        <!-- REALIZADA -->
        <div class="flex-1 min-w-[320px] bg-muted/30 rounded-lg flex flex-col border border-border/50"
             (dragover)="onDragOver($event)"
             (drop)="onDrop($event, 'REALIZADA')">
           <div class="p-3 border-b border-border/50 flex items-center justify-between">
             <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <h3 class="font-bold text-xs uppercase tracking-wider text-muted-foreground">Realizadas</h3>
             </div>
             <span class="bg-card text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-bold border border-border shadow-sm">{{ doneActivities().length }}</span>
           </div>

           <div class="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
             @for (act of doneActivities(); track act.id) {
                <div class="bg-card p-3.5 rounded-lg border border-border transition-all opacity-80 group relative cursor-pointer"
                     (click)="onCardClick(act)">
                   
                   <div class="flex justify-between items-start mb-2">
                       <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border truncate max-w-[140px]">
                         {{ getProjectName(act.projectId) }}
                       </span>
                       <div class="h-4 w-4 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
                          <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                       </div>
                   </div>
                   
                   <p class="text-sm font-medium text-muted-foreground line-through mb-3 leading-snug">{{ act.description }}</p>
                   
                   <div class="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                      <div class="flex items-center gap-2 grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100">
                         <img [src]="getUser(act.responsibleId)?.avatar" class="w-5 h-5 rounded-full bg-muted object-cover border border-border">
                         <span class="text-[10px] text-muted-foreground font-medium">{{ getUser(act.responsibleId)?.name.split(' ')[0] }}</span>
                      </div>
                      <span class="text-[10px] text-green-600 font-bold">{{ act.actualEndDate }}</span>
                   </div>
                </div>
             }
           </div>
        </div>
      </div>
      
      <!-- Edit Modal - Using EBM/Shadcn style centered modal -->
      @if (isEditing()) {
          <div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in px-4">
             <div class="bg-card rounded-lg p-6 w-full max-w-md shadow-lg border border-border animate-in fade-in zoom-in-95">
                <div class="flex justify-between items-start mb-4">
                   <div>
                      <h3 class="text-lg font-bold">Editar Actividad</h3>
                      <p class="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-tighter">Modifica los detalles de la tarea asignada.</p>
                   </div>
                   <button (click)="closeEditModal()" class="p-1 rounded-md hover:bg-accent text-muted-foreground transition-colors">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                   </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                      <label class="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 ml-0.5">Descripción</label>
                      <input type="text" [(ngModel)]="editDesc" class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                       <div>
                         <label class="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 ml-0.5">Inicio</label>
                         <input type="date" [(ngModel)]="editStart" class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium">
                       </div>
                       <div>
                         <label class="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 ml-0.5">Fin Est.</label>
                         <input type="date" [(ngModel)]="editEnd" class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium">
                       </div>
                    </div>

                    <div>
                      <label class="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 ml-0.5">Responsable</label>
                      <select [(ngModel)]="editResp" class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium">
                        @for (user of getAllUsers(); track user.id) {
                            <option [value]="user.id">{{ user.name }} ({{ user.subRole || user.role }})</option>
                        }
                      </select>
                    </div>

                    <div class="flex items-center gap-3 pt-4 border-t border-border mt-6">
                       <button (click)="closeEditModal()" class="flex-1 px-4 py-2 border border-border rounded-md text-xs font-bold hover:bg-accent transition-colors">Cancelar</button>
                       <button (click)="saveEdit()" class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm">Guardar Cambios</button>
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

    // STRICTLY 'MY TASKS'
    activities = activities.filter(a => a.responsibleId === user.id);

    // Filter by Selected Project
    if (this.selectedProjectId() !== 0) {
      activities = activities.filter(a => a.projectId === +this.selectedProjectId());
    }

    return activities;
  });

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

  deleteActivity(id: number) {
    if (confirm('¿Eliminar actividad?')) {
      this.dataService.deleteActivity(id);
    }
  }

  canEdit(act: Activity): boolean {
    if (act.status === 'REALIZADA') return false;
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'ADMIN' || user.subRole === 'GERENTE' || user.subRole === 'JEFE') return true;
    return act.responsibleId === user.id;
  }

  onDragStart(event: DragEvent, activity: Activity) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify(activity.id));
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, newStatus: ActivityStatus) {
    event.preventDefault();
    if (event.dataTransfer) {
      const id = +event.dataTransfer.getData('text/plain');
      if (id) {
        const activity = this.dataService.getAllActivities().find(a => a.id === id);
        if (activity) {
          const user = this.currentUser();
          const canMove = (user.role === 'ADMIN' || user.subRole === 'GERENTE' || user.subRole === 'JEFE') || (activity.responsibleId === user.id);
          if (canMove) {
            this.dataService.updateActivityStatus(id, newStatus);
          } else {
            alert('No tienes permisos para mover esta actividad.');
          }
        }
      }
    }
  }

  onCardClick(act: Activity) {
    // Optional: navigate to project detail
  }

  getProjectName(id: number) {
    return this.dataService.getProjectById(id)?.name || '...';
  }

  getUser(id: number) {
    return this.dataService.getAllUsers().find(u => u.id === id);
  }

  getAllUsers() {
    return this.dataService.getAllUsers();
  }

  getUrgencyColor(act: Activity): string {
    if (act.status === 'REALIZADA' || !act.estimatedEndDate) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = act.estimatedEndDate.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'border-l-red-500';
    if (diffDays <= 3) return 'border-l-yellow-500';
    if (diffDays <= 7) return 'border-l-green-500';
    return '';
  }

  getUrgencyTextClass(act: Activity): string {
    const colorClass = this.getUrgencyColor(act);
    if (colorClass === 'border-l-red-500') return 'text-red-500';
    if (colorClass === 'border-l-yellow-500') return 'text-yellow-600';
    if (colorClass === 'border-l-green-500') return 'text-green-600';
    return 'text-muted-foreground';
  }

  getUrgencyLabel(act: Activity): string {
    const colorClass = this.getUrgencyColor(act);
    if (colorClass === 'border-l-red-500') return 'Vencida';
    if (colorClass === 'border-l-yellow-500') return 'Próxima';
    if (colorClass === 'border-l-green-500') return 'Esta semana';
    return act.estimatedEndDate || '';
  }
}
