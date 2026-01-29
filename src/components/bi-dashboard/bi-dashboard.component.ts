
import { Component, inject, signal, computed, effect, ViewChild, ElementRef, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Project, Currency, ImpactIndicator } from '../../services/data.service';
import * as d3 from 'd3';

@Component({
   selector: 'app-bi-dashboard',
   standalone: true,
   imports: [CommonModule, FormsModule],
   template: `
    <div class="w-full flex flex-col space-y-6 animate-fade-in pb-20">
      
      <!-- Filters Bar -->
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center z-20 sticky top-0 md:relative">
         <div class="flex items-center gap-2">
            <h2 class="font-bold text-slate-700 text-lg">Dashboard Ejecutivo</h2>
            <span class="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-xs font-bold border border-red-100">BI</span>
            <button (click)="goToManual.emit()" class="text-slate-400 hover:text-blue-600 transition-colors p-1 ml-2 rounded-full hover:bg-slate-50" title="Ayuda sobre Proyectos">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
         </div>
         <div class="flex flex-wrap gap-3 w-full md:w-auto">
            <!-- Area Filter -->
            <select [(ngModel)]="selectedArea" class="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 p-2 outline-none">
              <option value="ALL">Todas las Áreas</option>
              @for(area of areas(); track area.id) {
                <option [value]="area.id">{{ area.name }}</option>
              }
            </select>
            
            <!-- Manager Filter -->
            <select [(ngModel)]="selectedLeader" class="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 p-2 outline-none">
              <option value="ALL">Todos los Líderes</option>
              @for(leader of leaders(); track leader.id) {
                <option [value]="leader.id">{{ leader.name }}</option>
              }
            </select>

            <!-- Date Range (Mock) -->
            <select class="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 p-2 outline-none">
               <option>Últimos 12 Meses</option>
               <option>Este Año (YTD)</option>
               <option>Todo el Histórico</option>
            </select>
         </div>
      </div>

      <!-- KPI Cards Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
         <!-- Active Projects -->
         <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 relative overflow-hidden">
            <div class="absolute right-0 top-0 p-4 opacity-10">
               <svg class="w-20 h-20 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/></svg>
            </div>
            <div>
               <p class="text-xs font-bold text-slate-400 uppercase tracking-wide">Proyectos Activos</p>
               <p class="text-3xl font-bold text-slate-800 mt-2">{{ kpiActiveProjects() }}</p>
            </div>
            <div class="text-xs font-medium text-slate-500">De {{ filteredProjects().length }} en total</div>
         </div>

         <!-- Monthly Savings -->
         <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 relative overflow-hidden">
            <div class="absolute right-0 top-0 p-4 opacity-10">
               <svg class="w-20 h-20 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4s0 0 0 0zm1 2h2v2H7v-2z" clip-rule="evenodd"/></svg>
            </div>
            <div>
               <p class="text-xs font-bold text-slate-400 uppercase tracking-wide">Ahorro Mensual (Est.)</p>
               <p class="text-3xl font-bold text-green-600 mt-2">S/ {{ kpiMonthlySavings() | number:'1.0-0' }}</p>
            </div>
            <div class="text-xs font-medium text-green-600 flex items-center gap-1">
               <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
               Proyección OPEX
            </div>
         </div>

         <!-- Budget Execution -->
         <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 relative overflow-hidden">
             <div class="absolute right-0 top-0 p-4 opacity-10">
               <svg class="w-20 h-20 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>
            </div>
            <div>
               <p class="text-xs font-bold text-slate-400 uppercase tracking-wide">Ejecución Presupuestal</p>
               <p class="text-3xl font-bold text-slate-800 mt-2">{{ kpiBudgetExec() }}%</p>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
               <div class="bg-purple-500 h-full rounded-full" [style.width.%]="kpiBudgetExec()"></div>
            </div>
         </div>

         <!-- Avg Payback -->
         <div class="bg-slate-800 p-5 rounded-2xl shadow-lg shadow-slate-800/20 flex flex-col justify-between h-32 relative overflow-hidden text-white">
            <div class="absolute right-0 top-0 p-4 opacity-10">
               <svg class="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
            </div>
            <div>
               <p class="text-xs font-bold text-slate-400 uppercase tracking-wide">Payback Promedio</p>
               <p class="text-3xl font-bold mt-2">{{ kpiAvgPayback() }} <span class="text-sm font-normal text-slate-400">Meses</span></p>
            </div>
            <div class="text-xs font-medium text-slate-400">Retorno del Portafolio</div>
         </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
         
         <!-- Budget Control Chart -->
         <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[300px]">
            <h3 class="font-bold text-slate-800 mb-6">Control Presupuestario por Área (S/.)</h3>
            <div class="flex-1 relative" #budgetChartContainer></div>
         </div>

         <!-- Real Progress (Simplified Gantt/Bar) -->
         <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[300px]">
             <div class="flex justify-between items-center mb-6">
                <h3 class="font-bold text-slate-800">Top 5 Proyectos - Avance Real</h3>
                <button (click)="goToProjects.emit()" class="text-xs text-blue-600 font-bold hover:underline">Ver Todos</button>
             </div>
             
             <!-- List View for Progress -->
             <div class="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar max-h-[300px]">
                @for(p of topProjectsByBudget(); track p.id) {
                   <div class="group cursor-pointer" (click)="selectProject.emit(p.id)">
                      <div class="flex justify-between items-center mb-1">
                         <span class="text-sm font-bold text-slate-700 truncate max-w-[200px]" [title]="p.name">{{ p.name }}</span>
                         <span class="text-xs font-bold" [class.text-green-600]="p.status === 'FINALIZADO'" [class.text-blue-600]="p.status !== 'FINALIZADO'">
                            {{ p.progress }}%
                         </span>
                      </div>
                      <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                         <div class="h-full rounded-full transition-all duration-1000 relative"
                              [class.bg-green-500]="p.status === 'FINALIZADO'"
                              [class.bg-blue-500]="p.status !== 'FINALIZADO'"
                              [style.width.%]="p.progress">
                            <div class="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>  
                         </div>
                      </div>
                      <div class="flex justify-between mt-1 text-[10px] text-slate-400">
                         <span>Presupuesto: {{ p.currency === 'PEN' ? 'S/' : '$' }} {{ p.budget | number }}</span>
                         <span>{{ p.status.replace('_', ' ') }}</span>
                      </div>
                   </div>
                } @empty {
                   <p class="text-center text-slate-400 text-sm mt-10">No hay proyectos para mostrar.</p>
                }
             </div>
         </div>
      </div>

      <!-- Top Savings Indicators -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col mb-4">
         <div class="p-6 border-b border-slate-50">
            <h3 class="font-bold text-slate-800">Top Indicadores de Ahorro (Impacto)</h3>
         </div>
         <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100">
               <thead class="bg-slate-50">
                  <tr>
                     <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Indicador</th>
                     <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Proyecto Asociado</th>
                     <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Categoría</th>
                     <th class="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Ahorro Mensual (Est.)</th>
                  </tr>
               </thead>
               <tbody class="divide-y divide-slate-100">
                  @for(item of topIndicators(); track item.indicator.id) {
                     <tr class="hover:bg-slate-50 transition-colors">
                        <td class="px-6 py-4">
                           <div class="text-sm font-bold text-slate-700">{{ item.indicator.name }}</div>
                           <div class="text-[10px] text-slate-400">
                              {{ item.indicator.currentValue }} -> {{ item.indicator.projectedValue }} {{ item.indicator.unitLabel }}
                           </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-600 truncate max-w-[200px] cursor-pointer hover:text-blue-600" (click)="selectProject.emit(item.project.id)">
                           {{ item.project.name }}
                        </td>
                        <td class="px-6 py-4">
                           <span class="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              {{ item.indicator.category.replace('_', ' ') }}
                           </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                           <span class="text-sm font-bold text-green-600">S/ {{ item.savingsPEN | number:'1.0-0' }}</span>
                        </td>
                     </tr>
                  } @empty {
                     <tr><td colspan="4" class="px-6 py-8 text-center text-slate-400 italic">No se han registrado indicadores de impacto aún.</td></tr>
                  }
               </tbody>
            </table>
         </div>
      </div>
    </div>
  `,
   styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes shimmer { 100% { transform: translateX(100%); } }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  `]
})
export class BiDashboardComponent {
   dataService = inject(DataService);

   selectProject = output<number>();
   goToProjects = output<void>(); // To switch tab
   goToManual = output<void>(); // New output for help context

   // Filter Signals
   selectedArea = signal<string | number>('ALL');
   selectedLeader = signal<string | number>('ALL');

   @ViewChild('budgetChartContainer') budgetChartContainer!: ElementRef;

   // --- Constants for Currency Conversion (Mock) ---
   readonly EXCHANGE_RATE = 3.75; // USD to PEN

   constructor() {
      // Redraw charts when data changes
      effect(() => {
         const p = this.filteredProjects(); // dependency
         setTimeout(() => this.drawBudgetChart(), 100);
      });
   }

   // --- Data Accessors ---
   areas = computed(() => this.dataService.getAllAreas());
   leaders = computed(() => this.dataService.getAllUsers().filter(u => u.subRole === 'GERENTE' || u.subRole === 'JEFE'));

   filteredProjects = computed(() => {
      let projects = this.dataService.filteredProjects();
      const area = this.selectedArea();
      const leader = this.selectedLeader();

      if (area !== 'ALL') {
         // Filter by checking if any entry in areaConfig matches the selected area
         projects = projects.filter(p => p.areaConfig.some(c => c.areaId === +area));
      }
      if (leader !== 'ALL') {
         // Filter by checking if any entry in areaConfig matches the selected leader
         projects = projects.filter(p => p.areaConfig.some(c => c.leaderId === +leader));
      }
      return projects;
   });

   // --- KPI Calculations ---

   kpiActiveProjects = computed(() => {
      return this.filteredProjects().filter(p => p.status === 'EN_PROGRESO').length;
   });

   kpiMonthlySavings = computed(() => {
      const projects = this.filteredProjects();
      const indicators = this.dataService.getAllIndicators();

      let totalSavingsPEN = 0;

      projects.forEach(p => {
         const projInds = indicators.filter(i => i.projectId === p.id);
         projInds.forEach(ind => {
            const diff = Math.max(0, ind.currentValue - ind.projectedValue);
            let saving = diff * ind.frequency * ind.unitCost;
            // Heuristic: We assume unitCost is in Project Currency
            if (p.currency === 'USD') saving *= this.EXCHANGE_RATE;

            totalSavingsPEN += saving;
         });
      });

      return totalSavingsPEN;
   });

   kpiBudgetExec = computed(() => {
      const projects = this.filteredProjects();
      const expenses = this.dataService.getAllExpenses();

      let totalBudgetPEN = 0;
      let totalSpentPEN = 0;

      projects.forEach(p => {
         // Budget
         let b = p.budget;
         if (p.currency === 'USD') b *= this.EXCHANGE_RATE;
         totalBudgetPEN += b;

         // Expenses
         const projExpenses = expenses.filter(e => e.projectId === p.id);
         const spent = projExpenses.reduce((acc, curr) => {
            let amt = curr.amount;
            if (curr.currency === 'USD') amt *= this.EXCHANGE_RATE;
            return acc + amt;
         }, 0);
         totalSpentPEN += spent;
      });

      if (totalBudgetPEN === 0) return 0;
      return Math.round((totalSpentPEN / totalBudgetPEN) * 100);
   });

   kpiAvgPayback = computed(() => {
      const projects = this.filteredProjects();
      const indicators = this.dataService.getAllIndicators();

      let totalMonths = 0;
      let count = 0;

      projects.forEach(p => {
         // Calculate Savings
         const projInds = indicators.filter(i => i.projectId === p.id);
         const monthlySavings = projInds.reduce((acc, ind) => {
            const diff = Math.max(0, ind.currentValue - ind.projectedValue);
            return acc + (diff * ind.frequency * ind.unitCost);
         }, 0);

         if (monthlySavings > 0) {
            const payback = p.budget / monthlySavings;
            totalMonths += payback;
            count++;
         }
      });

      if (count === 0) return 0;
      return (totalMonths / count).toFixed(1);
   });

   // --- Lists Computations ---

   topProjectsByBudget = computed(() => {
      return [...this.filteredProjects()]
         .sort((a, b) => b.budget - a.budget) // Simplified: not normalizing currency for sorting list order, usually roughly correlated or mostly same currency
         .slice(0, 5);
   });

   topIndicators = computed(() => {
      const projects = this.filteredProjects();
      const allInds = this.dataService.getAllIndicators();

      const result: { indicator: ImpactIndicator, project: Project, savingsPEN: number }[] = [];

      projects.forEach(p => {
         const pInds = allInds.filter(i => i.projectId === p.id);
         pInds.forEach(ind => {
            const diff = Math.max(0, ind.currentValue - ind.projectedValue);
            let saving = diff * ind.frequency * ind.unitCost;
            if (p.currency === 'USD') saving *= this.EXCHANGE_RATE;

            result.push({ indicator: ind, project: p, savingsPEN: saving });
         });
      });

      return result.sort((a, b) => b.savingsPEN - a.savingsPEN).slice(0, 10);
   });

   // --- D3 Charts ---

   drawBudgetChart() {
      if (!this.budgetChartContainer) return;
      const el = this.budgetChartContainer.nativeElement;
      d3.select(el).selectAll('*').remove();

      // Aggregating Data by Area
      const areaData = new Map<string, { budget: number, spent: number }>();
      const projects = this.filteredProjects();
      const expenses = this.dataService.getAllExpenses();

      projects.forEach(p => {
         // FIX: Use the first area in areaConfig as the primary area for this chart
         const primaryAreaId = p.areaConfig.length > 0 ? p.areaConfig[0].areaId : 0;
         const areaName = this.dataService.getAllAreas().find(a => a.id === primaryAreaId)?.name || 'Sin Asignar';

         let budgetPEN = p.budget;
         if (p.currency === 'USD') budgetPEN *= this.EXCHANGE_RATE;

         // Calculate Spent
         const projExp = expenses.filter(e => e.projectId === p.id);
         const spentPEN = projExp.reduce((acc, curr) => {
            let amt = curr.amount;
            if (curr.currency === 'USD') amt *= this.EXCHANGE_RATE;
            return acc + amt;
         }, 0);

         const current = areaData.get(areaName) || { budget: 0, spent: 0 };
         areaData.set(areaName, {
            budget: current.budget + budgetPEN,
            spent: current.spent + spentPEN
         });
      });

      const data = Array.from(areaData.entries()).map(([area, val]) => ({ area, ...val }));

      // Setup Chart Dimensions
      const margin = { top: 20, right: 20, bottom: 40, left: 60 };
      const width = el.clientWidth - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const svg = d3.select(el).append('svg')
         .attr('width', width + margin.left + margin.right)
         .attr('height', height + margin.top + margin.bottom)
         .append('g')
         .attr('transform', `translate(${margin.left},${margin.top})`);

      // X Axis
      const x0 = d3.scaleBand()
         .domain(data.map(d => d.area))
         .rangeRound([0, width])
         .paddingInner(0.1);

      const x1 = d3.scaleBand()
         .domain(['Presupuesto', 'Gasto Real'])
         .rangeRound([0, x0.bandwidth()])
         .padding(0.05);

      const y = d3.scaleLinear()
         .domain([0, d3.max(data, d => Math.max(d.budget, d.spent)) || 1000])
         .rangeRound([height, 0]);

      // Colors
      const z = d3.scaleOrdinal()
         .domain(['Presupuesto', 'Gasto Real'])
         .range(['#cbd5e1', '#3b82f6']); // Slate 300 vs Blue 500

      // Draw Bars
      svg.append('g')
         .selectAll('g')
         .data(data)
         .join('g')
         .attr('transform', d => `translate(${x0(d.area)},0)`)
         .selectAll('rect')
         .data(d => [
            { key: 'Presupuesto', value: d.budget },
            { key: 'Gasto Real', value: d.spent }
         ])
         .join('rect')
         .attr('x', d => x1(d.key)!)
         .attr('y', d => y(d.value))
         .attr('width', x1.bandwidth())
         .attr('height', d => height - y(d.value))
         .attr('fill', d => z(d.key) as string)
         .attr('rx', 4); // Rounded top

      // X Axis
      svg.append('g')
         .attr('transform', `translate(0,${height})`)
         .call(d3.axisBottom(x0))
         .selectAll('text')
         .style('text-anchor', 'middle')
         .style('font-size', '10px')
         .style('fill', '#64748b');

      // Y Axis
      svg.append('g')
         .call(d3.axisLeft(y).ticks(5, 's')) // 's' for SI units (1k, 1M)
         .selectAll('text')
         .style('fill', '#64748b');

      // Legend
      const legend = svg.append('g')
         .attr('font-family', 'sans-serif')
         .attr('font-size', 10)
         .attr('text-anchor', 'end')
         .selectAll('g')
         .data(['Presupuesto', 'Gasto Real'])
         .join('g')
         .attr('transform', (d, i) => `translate(0,${i * 20})`);

      legend.append('rect')
         .attr('x', width - 19)
         .attr('width', 19)
         .attr('height', 19)
         .attr('fill', d => z(d) as string)
         .attr('rx', 4);

      legend.append('text')
         .attr('x', width - 24)
         .attr('y', 9.5)
         .attr('dy', '0.32em')
         .text(d => d)
         .attr('fill', '#64748b');

      if (data.length === 0) {
         svg.append('text')
            .attr('x', width / 2)
            .attr('y', height / 2)
            .attr('text-anchor', 'middle')
            .text('No hay datos disponibles')
            .attr('fill', '#cbd5e1');
      }
   }
}
