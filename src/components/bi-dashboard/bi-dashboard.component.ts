
import { Component, inject, signal, computed, effect, ViewChild, ElementRef, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Project, Currency, ImpactIndicator } from '../../services/data.service';
import { DueSoonWidgetComponent } from '../ui/due-soon-widget/due-soon-widget.component';
import * as d3 from 'd3';

@Component({
   selector: 'app-bi-dashboard',
   standalone: true,
   imports: [CommonModule, FormsModule, DueSoonWidgetComponent],
   template: `
    <div class="flex flex-col xl:flex-row h-full gap-6 animate-fade-in pb-20">
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col space-y-6 min-w-0">
      
       <!-- Filters Bar -->
       <div class="bg-card p-4 rounded-lg shadow-sm border flex flex-col md:flex-row gap-4 justify-between items-center z-20 sticky top-0 md:relative">
        <div class="flex items-center gap-3">
            <h2 class="font-bold text-lg tracking-tight">Dashboard Ejecutivo</h2>
            <span class="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 tracking-wider">BI</span>
         </div>
         <div class="flex flex-wrap gap-2 w-full md:w-auto">
            <!-- Area Filter -->
            <div class="relative min-w-[160px]">
               <select [(ngModel)]="selectedArea" class="w-full bg-input/50 border border-input text-foreground text-xs rounded-md focus:ring-2 focus:ring-primary focus:border-primary p-2 outline-none appearance-none pr-8 font-medium">
                 <option value="ALL">Todas las Áreas</option>
                 @for(area of areas(); track area.id) {
                   <option [value]="area.id">{{ area.name }}</option>
                 }
               </select>
               <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
               </div>
            </div>
            
            <!-- Manager Filter -->
            <div class="relative min-w-[160px]">
               <select [(ngModel)]="selectedLeader" class="w-full bg-input/50 border border-input text-foreground text-xs rounded-md focus:ring-2 focus:ring-primary focus:border-primary p-2 outline-none appearance-none pr-8 font-medium">
                 <option value="ALL">Todos los Líderes</option>
                 @for(leader of leaders(); track leader.id) {
                   <option [value]="leader.id">{{ leader.name }}</option>
                 }
               </select>
               <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
               </div>
            </div>

            <!-- Date Range -->
            <div class="relative min-w-[140px]">
               <select class="w-full bg-input/50 border border-input text-foreground text-xs rounded-md focus:ring-2 focus:ring-primary focus:border-primary p-2 outline-none appearance-none pr-8 font-medium">
                  <option>Últimos 12 Meses</option>
                  <option>Este Año (YTD)</option>
                  <option>Todo el Histórico</option>
               </select>
               <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
               </div>
            </div>
         </div>
       </div>

       <!-- KPI Cards Row -->
       <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <!-- Active Projects -->
          <div class="bg-card p-5 rounded-lg shadow-sm border flex flex-col justify-between h-32 relative group overflow-hidden">
             <div class="absolute -right-2 -top-2 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                <svg class="w-24 h-24 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/></svg>
             </div>
             <div>
                <p class="text-[10px] font-bold text-muted-foreground tracking-wider">Proyectos Activos</p>
                <p class="text-3xl font-bold tracking-tight mt-1">{{ kpiActiveProjects() }}</p>
             </div>
             <div class="text-[10px] font-medium text-muted-foreground">De {{ filteredProjects().length }} en total registrados</div>
          </div>

          <!-- Monthly Savings -->
          <div class="bg-card p-5 rounded-lg shadow-sm border flex flex-col justify-between h-32 relative group overflow-hidden">
             <div class="absolute -right-2 -top-2 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                <svg class="w-24 h-24 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4s0 0 0 0zm1 2h2v2H7v-2z" clip-rule="evenodd"/></svg>
             </div>
             <div>
                <p class="text-[10px] font-bold text-muted-foreground tracking-wider">Ahorro Mensual (Est.)</p>
                <p class="text-3xl font-bold text-green-600 tracking-tight mt-1">S/ {{ kpiMonthlySavings() | number:'1.0-0' }}</p>
             </div>
             <div class="text-[10px] font-medium text-green-600 flex items-center gap-1">
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                Proyección OPEX
             </div>
          </div>

          <!-- Budget Execution -->
          <div class="bg-card p-5 rounded-lg shadow-sm border flex flex-col justify-between h-32 relative group overflow-hidden">
              <div class="absolute -right-2 -top-2 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                <svg class="w-24 h-24 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>
             </div>
             <div>
                 <p class="text-[10px] font-bold text-muted-foreground tracking-wider">Ejecución Presupuestal</p>
                <p class="text-3xl font-bold tracking-tight mt-1">{{ kpiBudgetExec() }}%</p>
             </div>
             <div class="w-full bg-muted rounded-full h-1 mt-2 overflow-hidden">
                <div class="bg-primary h-full rounded-full transition-all duration-1000" [style.width.%]="kpiBudgetExec()"></div>
             </div>
          </div>

          <!-- Avg Payback -->
          <div class="bg-slate-900 p-5 rounded-lg shadow-lg flex flex-col justify-between h-32 relative group overflow-hidden text-white">
             <div class="absolute -right-2 -top-2 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity pointer-events-none">
                <svg class="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
             </div>
             <div>
                 <p class="text-[10px] font-bold text-white/60 tracking-wider">Payback Promedio</p>
                <p class="text-3xl font-bold tracking-tight mt-1">{{ kpiAvgPayback() }} <span class="text-sm font-normal text-white/60">Meses</span></p>
             </div>
             <div class="text-[10px] font-medium text-white/60">Tiempo de recuperación de inversión</div>
          </div>
       </div>

       <!-- Charts Grid -->
       <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          
          <!-- Bar Chart Area Spending -->
           <div class="bg-card p-5 rounded-lg shadow-sm border">
               <div class="flex justify-between items-center mb-6">
                  <h3 class="font-bold text-sm">Gasto por Área</h3>
                  <div class="h-8 w-8 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                     <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  </div>
               </div>
               <div #barChart class="w-full h-[300px] relative">
                  <!-- D3 renders here -->
                  @if (filteredProjects().length === 0) {
                     <div class="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm italic">No hay datos suficientes</div>
                  }
               </div>
           </div>

           <!-- Donut Chart Split -->
           <div class="bg-card p-5 rounded-lg shadow-sm border">
               <div class="flex justify-between items-center mb-6">
                  <h3 class="font-bold text-sm">Distribución por Estado</h3>
                  <div class="h-8 w-8 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                  </div>
               </div>
               <div #donutChart class="w-full h-[300px] relative">
                  <!-- D3 renders here -->
                   @if (filteredProjects().length === 0) {
                     <div class="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm italic">No hay datos suficientes</div>
                  }
               </div>
           </div>

           <!-- Project List Table -->
           <div class="lg:col-span-2 bg-card rounded-lg shadow-sm border overflow-hidden">
               <div class="p-4 border-b bg-muted/30 flex justify-between items-center">
                  <h3 class="font-bold text-sm">Detalle de Proyectos</h3>
                  <button (click)="exportToExcel()" class="text-[10px] font-bold text-primary hover:underline">Exportar Excel</button>
               </div>
               <div class="overflow-x-auto">
                 <table class="w-full border-collapse">
                   <thead>
                     <tr class="bg-muted/30 text-left">
                        <th class="px-5 py-3 text-[10px] font-bold text-muted-foreground tracking-wider">Proyecto</th>
                        <th class="px-5 py-3 text-[10px] font-bold text-muted-foreground tracking-wider">Líder</th>
                        <th class="px-5 py-3 text-[10px] font-bold text-muted-foreground tracking-wider">Progreso</th>
                        <th class="px-5 py-3 text-[10px] font-bold text-muted-foreground tracking-wider">Presupuesto</th>
                        <th class="px-5 py-3 text-[10px] font-bold text-muted-foreground tracking-wider">Payback</th>
                        <th class="px-5 py-3 text-[10px] font-bold text-muted-foreground tracking-wider">Estado</th>
                     </tr>
                   </thead>
                   <tbody class="divide-y divide-border/50">
                     @for (p of sortedProjects(); track p.id) {
                       <tr class="hover:bg-muted/20 transition-colors group">
                         <td class="px-5 py-4 whitespace-nowrap">
                            <div class="flex flex-col">
                               <span class="text-sm font-bold truncate max-w-[200px]">{{ p.name }}</span>
                               <span class="text-[10px] text-muted-foreground">ID: #{{ p.id }}</span>
                            </div>
                         </td>
                         <td class="px-5 py-4 whitespace-nowrap">
                            <div class="flex items-center gap-2">
                               <img [src]="getProjectLeader(p)?.avatar" class="h-6 w-6 rounded-full border border-border">
                               <span class="text-xs font-medium">{{ getProjectLeader(p)?.name.split(' ')[0] }}</span>
                            </div>
                         </td>
                         <td class="px-5 py-4 whitespace-nowrap">
                            <div class="flex items-center gap-2">
                               <div class="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                                  <div class="h-full bg-primary rounded-full transition-all" [style.width.%]="p.progress"></div>
                               </div>
                               <span class="text-[10px] font-bold">{{ p.progress }}%</span>
                            </div>
                         </td>
                         <td class="px-5 py-4 whitespace-nowrap text-xs font-bold">
                            {{ p.currency === 'PEN' ? 'S/' : '$' }} {{ p.budget | number:'1.0-0' }}
                         </td>
                         <td class="px-5 py-4 whitespace-nowrap text-xs font-medium">
                            {{ getProjectPayback(p) }} <span class="text-[10px] text-muted-foreground">meses</span>
                         </td>
                         <td class="px-5 py-4 whitespace-nowrap">
                             <span class="px-2 py-1 rounded-md text-[10px] font-bold border tracking-wider"
                               [class.bg-primary/10]="p.status === 'EN_PROCESO'"
                               [class.text-primary]="p.status === 'EN_PROCESO'"
                               [class.border-primary/20]="p.status === 'EN_PROCESO'"
                               [class.bg-green-500/10]="p.status === 'FINALIZADO'"
                               [class.text-green-600]="p.status === 'FINALIZADO'"
                               [class.border-green-600/20]="p.status === 'FINALIZADO'"
                               [class.bg-muted]="p.status === 'PLANIFICACION'"
                               [class.text-muted-foreground]="p.status === 'PLANIFICACION'"
                               [class.border-border]="p.status === 'PLANIFICACION'">
                              {{ p.status.replace('_', ' ') }}
                            </span>
                         </td>
                       </tr>
                     }
                   </tbody>
                 </table>
               </div>
           </div>
       </div>
      </div>

      <!-- Right Sidebar: Widgets (Due Soon etc) -->
      <div class="xl:w-80 flex flex-col space-y-6">
         <!-- Active User Overview -->
         <div class="bg-card p-5 rounded-lg shadow-sm border">
            <h3 class="font-bold text-sm mb-4">Mis Proyectos</h3>
            <div class="space-y-4">
               @for (p of myProjects(); track p.id) {
                  <div class="flex items-center gap-3 group cursor-pointer">
                     <div class="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {{ p.name.substring(0,2).toUpperCase() }}
                     </div>
                     <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold truncate group-hover:text-primary transition-colors">{{ p.name }}</p>
                        <div class="w-full bg-muted rounded-full h-1 mt-1">
                           <div class="bg-primary h-full rounded-full" [style.width.%]="p.progress"></div>
                        </div>
                     </div>
                  </div>
               }
            </div>
         </div>

         <!-- App Widget: Due Soon -->
         <app-due-soon-widget></app-due-soon-widget>
      </div>

    </div>
  `,
  styles: []
})
export class BiDashboardComponent {
  dataService = inject(DataService);
  goToManual = output<void>();

  // D3 Chart Refs
  @ViewChild('barChart') barChartDiv!: ElementRef;
  @ViewChild('donutChart') donutChartDiv!: ElementRef;

  // Filters State
  selectedArea = signal<string>('ALL');
  selectedLeader = signal<string>('ALL');

  constructor() {
    // Re-render charts when filters change
    effect(() => {
       this.selectedArea();
       this.selectedLeader();
       this.dataService.getAllProjects(); // Dependency
       setTimeout(() => this.renderCharts(), 100);
    });
  }

  areas = computed(() => this.dataService.getAllAreas());
  
  leaders = computed(() => {
     // Get all users that lead at least one project
     const allProjects = this.dataService.getAllProjects();
     const leaderIds = new Set<number>();
     allProjects.forEach(p => p.areaConfig.forEach(c => leaderIds.add(c.leaderId)));
     return this.dataService.getAllUsers().filter(u => leaderIds.has(u.id));
  });

  filteredProjects = computed(() => {
     let projects = this.dataService.getAllProjects();
     
     if (this.selectedArea() !== 'ALL') {
        projects = projects.filter(p => p.areaConfig.some(c => c.areaId === +this.selectedArea()));
     }
     
     if (this.selectedLeader() !== 'ALL') {
        projects = projects.filter(p => p.areaConfig.some(c => c.leaderId === +this.selectedLeader()));
     }
     
     return projects;
  });

  sortedProjects = computed(() => {
     return [...this.filteredProjects()].sort((a,b) => b.progress - a.progress);
  });

  myProjects = computed(() => {
     return this.dataService.filteredProjects();
  });

  // KPI Computations
  kpiActiveProjects = computed(() => this.filteredProjects().filter(p => p.status === 'EN_PROCESO').length);
  
  kpiMonthlySavings = computed(() => {
    return this.filteredProjects().reduce((acc, p) => {
       const indicators = this.dataService.getIndicatorsByProject(p.id);
       const monthlySavings = indicators.reduce((sum, ind) => {
          const savings = (ind.currentValue - ind.projectedValue) * ind.frequency * ind.unitCost;
          return sum + savings;
       }, 0);
       return acc + monthlySavings;
    }, 0);
  });

  kpiBudgetExec = computed(() => {
     const proj = this.filteredProjects();
     if (proj.length === 0) return 0;
     const totalBudget = proj.reduce((acc, p) => acc + p.budget, 0);
     const totalSpent = proj.reduce((acc, p) => {
        const expenses = this.dataService.getExpensesByProject(p.id);
        return acc + expenses.reduce((sum, ex) => sum + ex.amount, 0);
     }, 0);
     return Math.round((totalSpent / totalBudget) * 100) || 0;
  });

  kpiAvgPayback = computed(() => {
     const proj = this.filteredProjects();
     if (proj.length === 0) return 0;
     let totalPayback = 0;
     let count = 0;
     
     proj.forEach(p => {
        const indicators = this.dataService.getIndicatorsByProject(p.id);
        const monthlySavings = indicators.reduce((sum, ind) => {
           const savings = (ind.currentValue - ind.projectedValue) * ind.frequency * ind.unitCost;
           return sum + savings;
        }, 0);
        
        if (monthlySavings > 0) {
           totalPayback += (p.budget / monthlySavings);
           count++;
        }
     });
     
     return count > 0 ? (totalPayback / count).toFixed(1) : '...';
  });

  getProjectLeader(p: Project) {
     const leaderId = p.areaConfig[0]?.leaderId;
     return this.dataService.getAllUsers().find(u => u.id === leaderId);
  }

  getProjectPayback(p: Project) {
     const indicators = this.dataService.getIndicatorsByProject(p.id);
     const monthlySavings = indicators.reduce((sum, ind) => {
        const savings = (ind.currentValue - ind.projectedValue) * ind.frequency * ind.unitCost;
        return sum + savings;
     }, 0);
     return monthlySavings > 0 ? (p.budget / monthlySavings).toFixed(1) : '∞';
  }

  // D3 Rendering Logic
  renderCharts() {
     this.renderBarChart();
     this.renderDonutChart();
  }

  renderBarChart() {
     const container = this.barChartDiv.nativeElement;
     d3.select(container).selectAll('*').remove();
     
     const data = this.areas().map(area => {
        const spent = this.dataService.getAllProjects()
           .filter(p => p.areaConfig.some(c => c.areaId === area.id))
           .reduce((acc, p) => {
               const expenses = this.dataService.getExpensesByProject(p.id);
               return acc + expenses.reduce((sum, ex) => sum + ex.amount, 0);
           }, 0);
        return { name: area.name, value: spent };
     }).filter(d => d.value > 0);

     if (data.length === 0) return;

     const margin = {top: 20, right: 20, bottom: 40, left: 60};
     const width = container.clientWidth - margin.left - margin.right;
     const height = container.clientHeight - margin.top - margin.bottom;

     const svg = d3.select(container)
       .append('svg')
       .attr('width', '100%')
       .attr('height', '100%')
       .attr('viewBox', `0 0 ${container.clientWidth} ${container.clientHeight}`)
       .append('g')
       .attr('transform', `translate(${margin.left},${margin.top})`);

     const x = d3.scaleBand()
       .range([0, width])
       .domain(data.map(d => d.name))
       .padding(0.3);

     const y = d3.scaleLinear()
       .domain([0, d3.max(data, d => d.value) || 0])
       .range([height, 0]);

     svg.append('g')
       .attr('transform', `translate(0,${height})`)
       .call(d3.axisBottom(x))
       .selectAll('text')
       .style('font-size', '10px')
       .style('font-family', 'Lato, sans-serif')
       .style('fill', 'currentColor');

     svg.append('g')
       .call(d3.axisLeft(y).ticks(5).tickFormat(d => 'S/' + d))
       .selectAll('text')
       .style('font-size', '10px')
       .style('font-family', 'Lato, sans-serif')
       .style('fill', 'currentColor');

     // Grid lines
     svg.append('g')			
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''));

     svg.selectAll('rect')
       .data(data)
       .enter()
       .append('rect')
       .attr('x', d => x(d.name)!)
       .attr('y', height)
       .attr('width', x.bandwidth())
       .attr('height', 0)
       .attr('fill', 'hsl(var(--primary))')
       .attr('rx', 4)
       .transition()
       .duration(800)
       .attr('y', d => y(d.value))
       .attr('height', d => height - y(d.value));
  }

  renderDonutChart() {
     const container = this.donutChartDiv.nativeElement;
     d3.select(container).selectAll('*').remove();
     
     const raw = this.filteredProjects();
     const stats = [
        { label: 'Planif.', count: raw.filter(p => p.status === 'PLANIFICACION').length, color: '#94a3b8' },
        { label: 'En Progreso', count: raw.filter(p => p.status === 'EN_PROCESO').length, color: 'hsl(var(--primary))' },
        { label: 'Finalizado', count: raw.filter(p => p.status === 'FINALIZADO').length, color: '#10b981' }
     ].filter(s => s.count > 0);

     if (stats.length === 0) return;

     const width = container.clientWidth;
     const height = container.clientHeight;
     const radius = Math.min(width, height) / 2 - 40;

     const svg = d3.select(container)
       .append('svg')
       .attr('width', '100%')
       .attr('height', '100%')
       .attr('viewBox', `0 0 ${width} ${height}`)
       .append('g')
       .attr('transform', `translate(${width / 2},${height / 2})`);

     const pie = d3.pie<any>().value(d => d.count);
     const arc = d3.arc<any>().innerRadius(radius * 0.6).outerRadius(radius);
     
     const arcs = svg.selectAll('arc')
        .data(pie(stats))
        .enter()
        .append('g');

     arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => d.data.color)
        .attr('stroke', 'var(--background)')
        .style('stroke-width', '2px')
        .transition()
        .duration(800)
        .attrTween('d', (d: any) => {
           const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
           return (t: any) => arc(interpolate(t));
        });

     // Legend
     const legend = svg.append('g')
        .attr('transform', `translate(${-radius * 0.5}, ${radius + 20})`);

     stats.forEach((s, i) => {
        const item = legend.append('g').attr('transform', `translate(${i * 80}, 0)`);
        item.append('circle').attr('r', 4).attr('fill', s.color);
        item.append('text')
           .attr('x', 10)
           .attr('y', 4)
           .text(s.label)
           .style('font-size', '10px')
           .style('font-family', 'Lato, sans-serif')
           .style('fill', 'currentColor');
     });
  }

  exportToExcel() {
    const projects = this.sortedProjects();
    if (projects.length === 0) return;

    const headers = [
      'ID', 
      'Nombre del Proyecto', 
      'Líder', 
      'Estado', 
      'Progreso (%)', 
      'Presupuesto', 
      'Moneda', 
      'Payback (Meses)',
      'Ahorro Mensual Est.'
    ];

    const rows = projects.map(p => {
      const leader = this.getProjectLeader(p)?.name || 'N/A';
      const payback = this.getProjectPayback(p);
      
      const indicators = this.dataService.getIndicatorsByProject(p.id);
      const monthlySavings = indicators.reduce((sum, ind) => {
          const savings = (ind.currentValue - ind.projectedValue) * ind.frequency * ind.unitCost;
          return sum + savings;
      }, 0);

      return [
        p.id,
        p.name,
        leader,
        p.status,
        p.progress,
        p.budget,
        p.currency,
        payback,
        monthlySavings.toFixed(2)
      ];
    });

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.map(field => {
        const stringField = String(field).replace(/"/g, '""');
        return `"${stringField}"`;
      }).join(';'))
    ].join('\r\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_bi_proyectos_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
