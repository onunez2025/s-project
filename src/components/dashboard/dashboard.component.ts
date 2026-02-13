
import { Component, inject, signal, computed, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Project } from '../../services/data.service';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { GanttChartComponent } from '../gantt-chart/gantt-chart.component';

type ViewMode = 'CARDS' | 'GANTT';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProjectFormComponent, GanttChartComponent],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header / Filters -->
      <div class="flex flex-col xl:flex-row justify-between items-end xl:items-center gap-4 mb-8">
        <div class="flex items-center gap-3">
          <div>
            <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Proyectos</h2>
            <p class="text-slate-500 dark:text-slate-400 mt-1">Gestiona y supervisa tus proyectos activos</p>
          </div>
          <button (click)="goToManual.emit()" class="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-red-50 mt-1" title="Ayuda">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </button>
        </div>
        
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          
          <!-- Filters -->
           <div class="relative w-full sm:w-48 animate-fade-in">
              <select 
                class="appearance-none w-full bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm font-medium text-sm transition-all"
                (change)="filterStatus.set($any($event.target).value)"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="PLANIFICACION">Planificación</option>
                <option value="EN_PROCESO">En Progreso</option>
                <option value="FINALIZADO">Finalizado</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                 <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

          <!-- View Switcher -->
          <div class="bg-slate-200 p-1 rounded-xl flex items-center shadow-inner">
             <button (click)="viewMode.set('CARDS')" 
               class="p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 px-3"
               [class.bg-white]="viewMode() === 'CARDS'"
               [class.text-blue-600]="viewMode() === 'CARDS'"
               [class.shadow-sm]="viewMode() === 'CARDS'"
               [class.text-slate-500]="viewMode() !== 'CARDS'"
               [class.hover:text-slate-700]="viewMode() !== 'CARDS'"
               title="Vista de Tarjetas">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
               </svg>
               <span class="text-xs font-bold hidden sm:inline">Tarjetas</span>
             </button>
             <button (click)="viewMode.set('GANTT')" 
               class="p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 px-3"
               [class.bg-white]="viewMode() === 'GANTT'"
               [class.text-blue-600]="viewMode() === 'GANTT'"
               [class.shadow-sm]="viewMode() === 'GANTT'"
               [class.text-slate-500]="viewMode() !== 'GANTT'"
               [class.hover:text-slate-700]="viewMode() !== 'GANTT'"
               title="Vista de Cronograma (Gantt)">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4v4m8-4v4m-12 8v4m8-4v4" stroke-opacity="0.5" />
               </svg>
               <span class="text-xs font-bold hidden sm:inline">Gantt</span>
             </button>
          </div>
          
          <!-- Create Button -->
          @if (canCreateProject()) {
            <button (click)="openCreate()" class="w-full sm:w-auto bg-blue-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Proyecto
            </button>
          }
        </div>
      </div>

      <!-- Content Area -->
      @if (viewMode() === 'CARDS') {
        <!-- Card Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10 animate-fade-in">
          @for (proj of displayProjects(); track proj.id) {
            <!-- Card Component -->
            <div (click)="onSelect.emit(proj.id)" class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl hover:shadow-red-900/5 border border-slate-100 dark:border-slate-700 transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden">
              
              <!-- Top Status Bar (Color Coded) -->
              <div class="absolute top-0 left-0 w-full h-1"
                [class.bg-red-500]="proj.status === 'EN_PROCESO'"
                [class.bg-green-500]="proj.status === 'FINALIZADO'"
                [class.bg-slate-300]="proj.status === 'PLANIFICACION'"
              ></div>

              <!-- Header -->
              <div class="flex justify-between items-start mb-4">
                 <div class="h-12 w-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm"
                      [class.bg-red-50]="proj.status === 'EN_PROCESO'"
                      [class.text-red-600]="proj.status === 'EN_PROCESO'"
                      [class.bg-green-50]="proj.status === 'FINALIZADO'"
                      [class.text-green-600]="proj.status === 'FINALIZADO'"
                      [class.bg-slate-50]="proj.status === 'PLANIFICACION'"
                      [class.text-slate-600]="proj.status === 'PLANIFICACION'">
                   {{ proj.name.charAt(0) }}
                 </div>
                 
                 <div class="flex items-center gap-2">
                   <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border"
                      [class.bg-red-50]="proj.status === 'EN_PROCESO'"
                      [class.text-red-700]="proj.status === 'EN_PROCESO'"
                      [class.border-red-100]="proj.status === 'EN_PROCESO'"
                      [class.bg-green-50]="proj.status === 'FINALIZADO'"
                      [class.text-green-700]="proj.status === 'FINALIZADO'"
                      [class.border-green-100]="proj.status === 'FINALIZADO'"
                      [class.bg-slate-50]="proj.status === 'PLANIFICACION'"
                      [class.text-slate-600]="proj.status === 'PLANIFICACION'"
                      [class.border-slate-100]="proj.status === 'PLANIFICACION'">
                     {{ proj.status.replace('_', ' ') }}
                   </span>
                   
                   <!-- Edit Button (Contextual) -->
                   @if (canEditProject(proj)) {
                     <button (click)="$event.stopPropagation(); openEdit(proj)" class="text-slate-300 hover:text-blue-600 p-1 transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                       </svg>
                     </button>
                   }
                 </div>
              </div>

              <!-- Content -->
              <div class="mb-6 flex-1">
                <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors" [attr.title]="proj.name">{{ proj.name }}</h3>
                <!-- Display Joined Area Names -->
                <p class="text-slate-500 text-sm mb-3 font-medium">{{ getProjectAreas(proj) }}</p>
                <p class="text-slate-400 text-sm line-clamp-2 leading-relaxed h-10">{{ proj.description || 'Sin descripción.' }}</p>
              </div>

              <!-- Metrics -->
              <div class="space-y-4">
                <!-- Progress -->
                <div>
                  <div class="flex justify-between text-xs font-semibold mb-1.5">
                     <span class="text-slate-500">Progreso</span>
                     <span class="text-slate-800">{{ proj.progress }}%</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div class="h-2 rounded-full transition-all duration-700"
                         [class.bg-blue-500]="proj.status !== 'FINALIZADO'"
                         [class.bg-green-500]="proj.status === 'FINALIZADO'"
                         [style.width.%]="proj.progress"></div>
                  </div>
                </div>

                <!-- Footer Info: Budget & Team -->
                <div class="flex justify-between items-center border-t border-slate-50 pt-4">
                   <div class="flex flex-col">
                     <span class="text-[10px] text-slate-400 font-bold uppercase">Presupuesto</span>
                     <span class="text-sm font-bold text-slate-700">{{ proj.currency === 'PEN' ? 'S/' : '$' }} {{ proj.budget | number }}</span>
                   </div>

                   <!-- Avatars (Leaders) -->
                   <div class="flex -space-x-2 overflow-hidden pl-2 py-1">
                      @for(leaderId of getLeaderIds(proj); track leaderId) {
                          <img [src]="getUserAvatar(leaderId)" class="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover z-10" title="Líder">
                      }
                      
                      <!-- Team Members -->
                      @for(memberId of proj.teamIds.slice(0, 2); track memberId) {
                         <img [src]="getUserAvatar(memberId)" class="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover bg-slate-200">
                      }
                      @if(proj.teamIds.length > 2) {
                         <div class="h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                           +{{ proj.teamIds.length - 2 }}
                         </div>
                      }
                   </div>
                </div>
              </div>

            </div>
          } @empty {
             <div class="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
               <div class="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
               </div>
               <p class="text-slate-500 font-medium">No se encontraron proyectos.</p>
             </div>
          }
        </div>
      } @else {
        <!-- Gantt Chart View -->
        <div class="h-[600px] animate-fade-in pb-10">
           <app-gantt-chart 
              [projects]="displayProjects()"
              (projectSelected)="onSelect.emit($event)">
           </app-gantt-chart>
        </div>
      }

      <!-- Create/Edit Project Slide-over -->
      @if (showForm()) {
        <app-project-form
          [projectToEdit]="editingProject()"
          (cancel)="closeForm()"
          (save)="closeForm()"
        ></app-project-form>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashboardComponent {
  dataService = inject(DataService);

  onSelect = output<number>();
  goToManual = output<void>();

  showForm = signal(false);
  editingProject = signal<Project | null>(null);

  filterStatus = signal<string>('ALL');
  viewMode = signal<ViewMode>('CARDS');

  constructor() {
    const savedMode = localStorage.getItem('sole_project_view_mode_dash');
    if (savedMode === 'GANTT' || savedMode === 'CARDS') {
      this.viewMode.set(savedMode as ViewMode);
    }
    effect(() => {
      localStorage.setItem('sole_project_view_mode_dash', this.viewMode());
    });
  }

  displayProjects = computed(() => {
    const projects = this.dataService.filteredProjects();
    const status = this.filterStatus();
    if (status === 'ALL') return projects;
    return projects.filter(p => p.status === status);
  });

  getProjectAreas(proj: Project) {
    const names = proj.areaConfig.map(c =>
      this.dataService.getAllAreas().find(a => a.id === c.areaId)?.name
    ).filter(Boolean);
    return names.join(', ') || 'N/A';
  }

  getLeaderIds(proj: Project) {
    return proj.areaConfig.map(c => c.leaderId);
  }

  getUserAvatar(id: number) {
    return this.dataService.getAllUsers().find(u => u.id === id)?.avatar || 'https://i.pravatar.cc/150';
  }

  // --- Permission Logic ---
  canCreateProject(): boolean {
    const user = this.dataService.currentUser();
    return user.role === 'ADMIN' || user.subRole === 'GERENTE' || user.subRole === 'JEFE';
  }

  canEditProject(proj: Project): boolean {
    const user = this.dataService.currentUser();
    if (proj.status === 'FINALIZADO') return false;

    if (user.role === 'ADMIN' || user.subRole === 'GERENTE' || user.subRole === 'JEFE') return true;

    // Check if user is one of the leaders OR a team member
    if (proj.areaConfig.some(c => c.leaderId === user.id)) return true;
    if (proj.teamIds.includes(user.id)) return true;

    return false;
  }

  openCreate() {
    this.editingProject.set(null);
    this.showForm.set(true);
  }

  openEdit(project: Project) {
    this.editingProject.set(project);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingProject.set(null);
  }
}
