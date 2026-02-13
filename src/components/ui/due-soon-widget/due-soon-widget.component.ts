import { Component, computed, input, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project, Activity, DataService } from '../../../services/data.service';

interface UrgentTask {
    id: number;
    description: string;
    projectName: string;
    projectId: number;
    endDate: string; // ISO date
    daysLeft: number;
    statusColor: 'bg-red-500' | 'bg-yellow-500' | 'bg-green-500';
    statusText: string;
}

@Component({
    selector: 'app-due-soon-widget',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bg-white border-b xl:border-b-0 xl:border-r border-slate-200 h-full flex flex-col w-full xl:w-80 shrink-0 overflow-hidden animate-fade-in">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
          <svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Próximos Vencimientos
        </h3>
        <span class="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{{ urgentTasks().length }}</span>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div *ngIf="urgentTasks().length === 0" class="flex flex-col items-center justify-center h-48 text-slate-400 text-center">
            <svg class="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm">Todo al día.<br>No hay tareas urgentes.</p>
        </div>

        <div *ngFor="let task of urgentTasks()" 
             (click)="onTaskClick(task.projectId)"
             class="group bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden">
             
             <!-- Indicator Bar -->
             <div class="absolute left-0 top-0 bottom-0 w-1" [ngClass]="task.statusColor"></div>

             <div class="pl-2">
                <div class="flex justify-between items-start mb-1">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider truncate w-2/3" title="{{task.projectName}}">{{ task.projectName }}</span>
                    <span class="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 whitespace-nowrap">
                        {{ task.daysLeft <= 0 ? (task.daysLeft === 0 ? 'Hoy' : 'Hace ' + (task.daysLeft * -1) + 'd') : 'En ' + task.daysLeft + 'd' }}
                    </span>
                </div>
                <h4 class="text-sm font-semibold text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{{ task.description }}</h4>
                <div class="flex items-center justify-between text-xs text-slate-500">
                    <span>{{ task.endDate | date:'dd MMM' }}</span>
                    <span [ngClass]="task.statusColor" class="w-2 h-2 rounded-full inline-block"></span>
                </div>
             </div>
        </div>
      </div>
      
      <!-- Footer / Legend -->
      <div class="px-4 py-2 bg-slate-50 border-t border-slate-100 flex justify-between text-[10px] text-slate-500">
        <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> Vencido</div>
        <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-500"></span> < 3 días</div>
        <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> < 7 días</div>
      </div>
    </div>
  `
        `
})
export class DueSoonWidgetComponent {
    dataService = inject(DataService);

    selectTask = output<number>();

    projects = this.dataService.projects;

    urgentTasks = computed(() => {
        const allProjects = this.projects();
        const projects = this.dataService.filteredProjects();
        const allActivities = this.dataService.activities();
        const tasks: UrgentTask[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter activities belonging to visible projects
        const visibleProjectIds = new Set(projects.map(p => p.id));

        for (const act of allActivities) {
            if (!visibleProjectIds.has(act.projectId)) continue;
            if (act.status === 'REALIZADA') continue;
            if (!act.estimatedEndDate && !act.startDate) continue;

            const project = projects.find(p => p.id === act.projectId);
            if (!project || project.status === 'FINALIZADO') continue;

            // Use estimated end date, fall back to start date
            const targetDateStr = act.estimatedEndDate || act.startDate;
            const targetDate = new Date(targetDateStr);
            targetDate.setHours(0, 0, 0, 0);

            const diffTime = targetDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Filter: Only show if due within next 7 days or overdue
            if (diffDays <= 7) {
                let color: 'bg-red-500' | 'bg-yellow-500' | 'bg-green-500' = 'bg-green-500';
                let text = 'En tiempo';

                if (diffDays < 0) {
                    color = 'bg-red-500';
                    text = 'Vencido';
                } else if (diffDays <= 3) {
                    color = 'bg-yellow-500';
                    text = 'Próximo';
                }

                tasks.push({
                    id: act.id,
                    description: act.description,
                    projectName: project.name,
                    projectId: project.id,
                    endDate: targetDateStr,
                    daysLeft: diffDays,
                    statusColor: color,
                    statusText: text
                });
            }
        }

        return tasks.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 10); // Top 10
    });

    onTaskClick(projectId: number) {
        this.selectTask.emit(projectId);
    }
}
