
import { Component, inject, signal, computed, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Project } from '../../services/data.service';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { GanttChartComponent } from '../gantt-chart/gantt-chart.component';
import { FilterBarComponent, FilterState } from '../ui/filter-bar/filter-bar.component';

type ViewMode = 'CARDS' | 'GANTT';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProjectFormComponent, GanttChartComponent, FilterBarComponent],
  template: `
    <div class="h-full flex flex-col animate-fade-in">
      <!-- Header / Filters -->
      <div class="flex flex-col xl:flex-row justify-between items-end xl:items-center gap-4 mb-6 relative z-30">
        <div class="flex items-center gap-3">
          <div>
            <h2 class="text-2xl font-bold tracking-tight">Proyectos</h2>
            <p class="text-muted-foreground text-xs font-medium">Gestiona y supervisa tus proyectos activos</p>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          
            <!-- Filters -->
            <app-filter-bar 
               class="w-full xl:w-auto"
               [areas]="dataService.getAllAreas()"
               [users]="dataService.getAllUsers()"
               (filtersChanged)="onFiltersChanged($event)">
            </app-filter-bar>

          <!-- View Switcher -->
          <div class="bg-muted p-1 rounded-md flex items-center">
             <button (click)="viewMode.set('CARDS')" 
               class="p-2 rounded text-sm transition-all duration-200 flex items-center justify-center gap-2 px-3"
               [class.bg-card]="viewMode() === 'CARDS'"
               [class.text-primary]="viewMode() === 'CARDS'"
               [class.shadow-sm]="viewMode() === 'CARDS'"
               [class.text-muted-foreground]="viewMode() !== 'CARDS'"
               title="Vista de Tarjetas">
               <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
               </svg>
               <span class="text-xs font-medium hidden sm:inline">Tarjetas</span>
             </button>
             <button (click)="viewMode.set('GANTT')" 
               class="p-2 rounded text-sm transition-all duration-200 flex items-center justify-center gap-2 px-3"
               [class.bg-card]="viewMode() === 'GANTT'"
               [class.text-primary]="viewMode() === 'GANTT'"
               [class.shadow-sm]="viewMode() === 'GANTT'"
               [class.text-muted-foreground]="viewMode() !== 'GANTT'"
               title="Vista de Cronograma (Gantt)">
               <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
               </svg>
               <span class="text-xs font-medium hidden sm:inline">Gantt</span>
             </button>
          </div>
          
          <!-- Create Button -->
          @if (canCreateProject()) {
            <button (click)="openCreate()" class="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium shadow-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nuevo Proyecto
            </button>
          }
        </div>
      </div>

      <!-- Content Area -->
      @if (viewMode() === 'CARDS') {
        <!-- Card Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-10 animate-fade-in">
          @for (proj of displayProjects(); track proj.id) {
            <!-- Card Component -->
            <div (click)="onSelect.emit(proj.id)" class="bg-card rounded-lg p-5 shadow-sm border hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden">
              
              <!-- Top Status Bar -->
              <div class="absolute top-0 left-0 w-full h-1"
                [class.bg-blue-500]="proj.status === 'EN_PROCESO'"
                [class.bg-green-500]="proj.status === 'FINALIZADO'"
                [class.bg-muted-foreground/30]="proj.status === 'PLANIFICACION'"
              ></div>

              <!-- Header -->
              <div class="flex justify-between items-start mb-3 mt-1">
                 <div class="h-10 w-10 rounded-lg flex items-center justify-center text-lg font-bold"
                      [class.bg-blue-50]="proj.status === 'EN_PROCESO'"
                      [class.text-blue-600]="proj.status === 'EN_PROCESO'"
                      [class.dark:bg-blue-900/20]="proj.status === 'EN_PROCESO'"
                      [class.bg-green-50]="proj.status === 'FINALIZADO'"
                      [class.text-green-600]="proj.status === 'FINALIZADO'"
                      [class.dark:bg-green-900/20]="proj.status === 'FINALIZADO'"
                      [class.bg-muted]="proj.status === 'PLANIFICACION'"
                      [class.text-muted-foreground]="proj.status === 'PLANIFICACION'">
                   {{ proj.name.charAt(0) }}
                 </div>
                 
                 <div class="flex items-center gap-2">
                   <span class="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border"
                      [class.bg-blue-50]="proj.status === 'EN_PROCESO'"
                      [class.text-blue-700]="proj.status === 'EN_PROCESO'"
                      [class.border-blue-100]="proj.status === 'EN_PROCESO'"
                      [class.dark:bg-blue-900/30]="proj.status === 'EN_PROCESO'"
                      [class.dark:text-blue-400]="proj.status === 'EN_PROCESO'"
                      [class.dark:border-blue-800]="proj.status === 'EN_PROCESO'"
                      [class.bg-green-50]="proj.status === 'FINALIZADO'"
                      [class.text-green-700]="proj.status === 'FINALIZADO'"
                      [class.border-green-100]="proj.status === 'FINALIZADO'"
                      [class.dark:bg-green-900/30]="proj.status === 'FINALIZADO'"
                      [class.dark:text-green-400]="proj.status === 'FINALIZADO'"
                      [class.dark:border-green-800]="proj.status === 'FINALIZADO'"
                      [class.bg-muted]="proj.status === 'PLANIFICACION'"
                      [class.text-muted-foreground]="proj.status === 'PLANIFICACION'"
                      [class.border-border]="proj.status === 'PLANIFICACION'">
                     {{ proj.status.replace('_', ' ') }}
                   </span>
                   
                   @if (canEditProject(proj)) {
                     <button (click)="$event.stopPropagation(); openEdit(proj)" class="text-muted-foreground hover:text-primary p-1 transition-colors">
                       <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                       </svg>
                     </button>
                   }
                 </div>
              </div>

              <!-- Content -->
              <div class="mb-4 flex-1">
                <h3 class="text-sm font-bold mb-1 group-hover:text-primary transition-colors" [attr.title]="proj.name">{{ proj.name }}</h3>
                <p class="text-muted-foreground text-xs mb-2 font-medium">{{ getProjectAreas(proj) }}</p>
                <p class="text-muted-foreground/70 text-xs line-clamp-2 leading-relaxed">{{ proj.description || 'Sin descripción.' }}</p>
              </div>

              <!-- Metrics -->
              <div class="space-y-3">
                <!-- Progress -->
                <div>
                  <div class="flex justify-between text-xs font-medium mb-1">
                     <span class="text-muted-foreground">Progreso</span>
                     <span class="font-bold">{{ proj.progress }}%</span>
                  </div>
                  <div class="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                    <div class="h-2 rounded-full transition-all duration-700"
                         [class.bg-primary]="proj.status !== 'FINALIZADO'"
                         [class.bg-green-500]="proj.status === 'FINALIZADO'"
                         [style.width.%]="proj.progress"></div>
                  </div>
                </div>

                <!-- Footer Info -->
                <div class="flex justify-between items-center border-t border-border pt-3">
                   <div class="flex flex-col">
                     <span class="text-[10px] text-muted-foreground font-bold">Presupuesto</span>
                     <span class="text-xs font-bold">{{ proj.currency === 'PEN' ? 'S/' : '$' }} {{ proj.budget | number }}</span>
                   </div>
                   <div class="flex -space-x-2 overflow-hidden pl-2 py-1">
                      @for(leaderId of getLeaderIds(proj); track leaderId) {
                          <img [src]="getUserAvatar(leaderId)" class="inline-block h-7 w-7 rounded-full ring-2 ring-card object-cover z-10" title="Líder">
                      }
                      @for(memberId of proj.teamIds.slice(0, 2); track memberId) {
                         <img [src]="getUserAvatar(memberId)" class="inline-block h-7 w-7 rounded-full ring-2 ring-card object-cover bg-muted">
                      }
                      @if(proj.teamIds.length > 2) {
                         <div class="h-7 w-7 rounded-full ring-2 ring-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                           +{{ proj.teamIds.length - 2 }}
                         </div>
                      }
                   </div>
                </div>
              </div>

            </div>
          } @empty {
             <div class="col-span-full flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-dashed border-border">
               <div class="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
               </div>
               <p class="text-muted-foreground font-medium">No se encontraron proyectos.</p>
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
  styles: []
})
export class DashboardComponent {
  dataService = inject(DataService);

  onSelect = output<number>();
  goToManual = output<void>();

  showForm = signal(false);
  editingProject = signal<Project | null>(null);

  activeFilters = signal<FilterState>({
    searchText: '',
    status: [],
    areaId: null,
    userId: null
  });

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

  onFiltersChanged(filters: FilterState) {
    this.activeFilters.set(filters);
  }

  displayProjects = computed(() => {
    let projects = this.dataService.filteredProjects();
    const filters = this.activeFilters();

    if (filters.searchText) {
      const lower = filters.searchText.toLowerCase();
      projects = projects.filter(p => p.name.toLowerCase().includes(lower));
    }

    if (filters.status.length > 0) {
      projects = projects.filter(p => filters.status.includes(p.status));
    }

    if (filters.areaId) {
      projects = projects.filter(p => p.areaConfig.some(c => c.areaId === filters.areaId));
    }

    if (filters.userId) {
      projects = projects.filter(p =>
        p.areaConfig.some(c => c.leaderId === filters.userId) ||
        p.teamIds.includes(filters.userId!)
      );
    }

    projects.sort((a, b) => {
      const dateA = new Date(a.endDate).getTime();
      const dateB = new Date(b.endDate).getTime();
      return dateA - dateB;
    });

    return projects;
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

  canCreateProject(): boolean {
    const user = this.dataService.currentUser();
    return user.role === 'ADMIN' || user.subRole === 'GERENTE' || user.subRole === 'JEFE';
  }

  canEditProject(proj: Project): boolean {
    const user = this.dataService.currentUser();
    if (proj.status === 'FINALIZADO') return false;
    if (user.role === 'ADMIN' || user.subRole === 'GERENTE' || user.subRole === 'JEFE') return true;
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
