
import { Component, ElementRef, ViewChild, input, output, effect, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project, DataService } from '../../services/data.service';
import * as d3 from 'd3';

type TimeScale = 'Day' | 'Week' | 'Month';

@Component({
  selector: 'app-gantt-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans">
      
      <!-- Toolbar -->
      <div class="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0 z-20">
          <div class="flex items-center gap-4">
             <div>
                <h3 class="font-bold text-slate-800 text-lg leading-tight">Cronograma</h3>
                <span class="text-xs text-slate-500 font-medium">{{ projects().length }} Proyectos Activos</span>
             </div>
             
             <!-- View Mode Switcher (New) -->
             <div class="bg-slate-100 p-1 rounded-lg flex items-center ml-4">
                <button (click)="changeViewMode('Day')" 
                   class="px-3 py-1 text-xs font-bold rounded-md transition-all duration-200"
                   [class.bg-white]="viewMode() === 'Day'"
                   [class.shadow-sm]="viewMode() === 'Day'"
                   [class.text-slate-800]="viewMode() === 'Day'"
                   [class.text-slate-500]="viewMode() !== 'Day'"
                   [class.hover:text-slate-700]="viewMode() !== 'Day'">
                   Día
                </button>
                <button (click)="changeViewMode('Week')" 
                   class="px-3 py-1 text-xs font-bold rounded-md transition-all duration-200"
                   [class.bg-white]="viewMode() === 'Week'"
                   [class.shadow-sm]="viewMode() === 'Week'"
                   [class.text-slate-800]="viewMode() === 'Week'"
                   [class.text-slate-500]="viewMode() !== 'Week'"
                   [class.hover:text-slate-700]="viewMode() !== 'Week'">
                   Semana
                </button>
                <button (click)="changeViewMode('Month')" 
                   class="px-3 py-1 text-xs font-bold rounded-md transition-all duration-200"
                   [class.bg-white]="viewMode() === 'Month'"
                   [class.shadow-sm]="viewMode() === 'Month'"
                   [class.text-slate-800]="viewMode() === 'Month'"
                   [class.text-slate-500]="viewMode() !== 'Month'"
                   [class.hover:text-slate-700]="viewMode() !== 'Month'">
                   Mes
                </button>
             </div>
          </div>

          <div class="flex gap-2">
              <button (click)="scrollToToday()" class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 Hoy
              </button>
          </div>
      </div>

      <div class="flex flex-1 overflow-hidden relative">
         
         <!-- LEFT PANEL: Table Info (Fixed Width) -->
         <div class="w-[420px] flex-shrink-0 border-r border-slate-200 flex flex-col bg-white z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            
            <!-- Table Header -->
            <div class="h-[50px] border-b border-slate-100 flex items-center px-6 bg-slate-50/80 shrink-0">
               <div class="flex-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Proyecto</div>
               <div class="w-16 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Líder</div>
            </div>

            <!-- Table Rows (Scrolls synced with Chart) -->
            <div class="flex-1 overflow-hidden relative bg-white">
               <div class="overflow-hidden h-full" #leftSideContainer>
                  <div [style.height.px]="totalContentHeight()" class="relative">
                    @for (p of projects(); track p.id; let i = $index) {
                       <div class="absolute w-full border-b border-slate-50 hover:bg-slate-50/80 transition-colors group flex items-center px-6 cursor-pointer"
                            (click)="projectSelected.emit(p.id)"
                            [style.top.px]="i * rowHeight"
                            [style.height.px]="rowHeight">
                          
                          <!-- Name -->
                          <div class="flex-1 min-w-0 pr-4">
                             <div class="flex items-center gap-2 mb-0.5">
                               @if(p.status === 'FINALIZADO') {
                                 <div class="h-2 w-2 rounded-full bg-green-500 shrink-0"></div>
                               } @else if (p.status === 'EN_PROCESO') {
                                 <div class="h-2 w-2 rounded-full bg-red-500 shrink-0 animate-pulse"></div>
                               } @else {
                                 <div class="h-2 w-2 rounded-full bg-slate-300 shrink-0"></div>
                               }
                               <span class="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors cursor-pointer leading-tight" [title]="p.name">{{ p.name }}</span>
                             </div>
                             <div class="text-[10px] text-slate-400 truncate pl-4 flex gap-2">
                                <span>{{ p.status.replace('_', ' ') }}</span>
                                <span class="text-slate-300">•</span>
                                <span>{{ getDuration(p) }} días</span>
                             </div>
                          </div>

                          <!-- Leaders -->
                          <div class="w-16 flex justify-end">
                            <div class="flex items-center -space-x-2 overflow-hidden">
                              @for(c of p.areaConfig; track c.areaId) {
                                <img [src]="getUser(c.leaderId)?.avatar" 
                                     class="h-7 w-7 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100" 
                                     [title]="getUser(c.leaderId)?.name">
                              }
                            </div>
                          </div>
                       </div>
                    }
                  </div>
               </div>
            </div>
         </div>

         <!-- RIGHT PANEL: Gantt Chart (Scrollable) -->
         <div class="flex-1 flex flex-col min-w-0 bg-white relative">
            
            <!-- Timeline Header (Sticky Top) -->
            <div class="h-[50px] border-b border-slate-100 bg-slate-50/80 overflow-hidden relative shrink-0" #timelineHeader>
                <div #svgHeaderContainer></div>
            </div>

            <!-- Bars Container (Scrollable X & Y) -->
            <div class="flex-1 overflow-auto custom-scrollbar relative scroll-smooth" #chartContainer (scroll)="syncScroll($event)">
                 <div #svgBodyContainer [style.height.px]="totalContentHeight()"></div>
            </div>
         </div>

      </div>
      
      <!-- Hover Tooltip -->
      <div #tooltip class="fixed pointer-events-none opacity-0 bg-slate-800/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-xl z-50 text-xs transition-opacity duration-200 pointer-events-none border border-slate-700">
         <div class="font-bold mb-0.5" id="tt-dates"></div>
         <div class="text-slate-300" id="tt-progress"></div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 5px; border: 2px solid #f8fafc; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `]
})
export class GanttChartComponent implements OnDestroy {
  projects = input.required<Project[]>();
  projectSelected = output<number>(); // Output for navigation
  viewMode = signal<TimeScale>('Day');

  @ViewChild('leftSideContainer') leftSideContainer!: ElementRef;
  @ViewChild('timelineHeader') timelineHeader!: ElementRef;
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @ViewChild('svgHeaderContainer') svgHeaderContainer!: ElementRef;
  @ViewChild('svgBodyContainer') svgBodyContainer!: ElementRef;
  @ViewChild('tooltip') tooltip!: ElementRef;

  dataService = inject(DataService);

  // Config
  rowHeight = 60;
  headerHeight = 50;

  totalContentHeight = signal(0);

  private resizeObserver: ResizeObserver | null = null;
  private todayX = 0;

  constructor() {
    effect(() => {
      const data = this.projects();
      const mode = this.viewMode(); // Trigger effect on mode change
      if (data.length > 0) {
        this.totalContentHeight.set(data.length * this.rowHeight);
        // Wait for render
        setTimeout(() => this.drawGantt(), 50);
      }
    });
  }

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(() => {
      // Prevent "ResizeObserver loop completed with undelivered notifications"
      window.requestAnimationFrame(() => {
        this.drawGantt();
      });
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  changeViewMode(mode: TimeScale) {
    this.viewMode.set(mode);
  }

  getUser(id: number) {
    return this.dataService.getAllUsers().find(u => u.id === id);
  }

  getDuration(p: Project) {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  syncScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (this.leftSideContainer) this.leftSideContainer.nativeElement.scrollTop = target.scrollTop;
    if (this.timelineHeader) this.timelineHeader.nativeElement.scrollLeft = target.scrollLeft;
  }

  scrollToToday() {
    if (this.chartContainer && this.todayX > 0) {
      const containerWidth = this.chartContainer.nativeElement.clientWidth;
      this.chartContainer.nativeElement.scrollTo({
        left: this.todayX - (containerWidth / 2),
        behavior: 'smooth'
      });
    }
  }

  // --- Core Drawing Logic ---

  private getDayWidth(): number {
    switch (this.viewMode()) {
      case 'Day': return 40;
      case 'Week': return 10; // Approx 70px per week
      case 'Month': return 3; // Approx 90px per month
    }
  }

  private drawGantt() {
    if (!this.svgBodyContainer || !this.svgHeaderContainer) return;

    const data = this.projects();
    if (data.length === 0) return;

    const dayWidth = this.getDayWidth();

    // 1. Calculate Time Domain
    const dates = data.flatMap(d => [new Date(d.startDate), new Date(d.endDate)]);
    let minDate = d3.min(dates) || new Date();
    let maxDate = d3.max(dates) || new Date();

    // Add Buffer
    minDate = new Date(minDate);
    minDate.setDate(minDate.getDate() - 15);
    maxDate = new Date(maxDate);
    maxDate.setDate(maxDate.getDate() + 60);

    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24));
    const totalWidth = totalDays * dayWidth;

    // Scale
    const x = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, totalWidth]);

    // --- DRAW HEADER ---
    const headerEl = this.svgHeaderContainer.nativeElement;
    d3.select(headerEl).selectAll('*').remove();

    const svgHeader = d3.select(headerEl)
      .append('svg')
      .attr('width', totalWidth)
      .attr('height', this.headerHeight);

    // Dynamic Axis Generation based on View Mode
    if (this.viewMode() === 'Day') {
      this.drawDayViewHeader(svgHeader, x, minDate, maxDate);
    } else if (this.viewMode() === 'Week') {
      this.drawWeekViewHeader(svgHeader, x, minDate, maxDate);
    } else {
      this.drawMonthViewHeader(svgHeader, x, minDate, maxDate);
    }

    // Divider Line
    svgHeader.append('line')
      .attr('x1', 0).attr('x2', totalWidth)
      .attr('y1', 25).attr('y2', 25)
      .attr('stroke', '#e2e8f0');


    // --- DRAW BODY ---
    const bodyEl = this.svgBodyContainer.nativeElement;
    d3.select(bodyEl).selectAll('*').remove();
    const totalHeight = data.length * this.rowHeight;

    const svgBody = d3.select(bodyEl)
      .append('svg')
      .attr('width', totalWidth)
      .attr('height', totalHeight);

    // 1. Grid Lines
    this.drawGridLines(svgBody, x, minDate, maxDate, totalHeight);

    // 2. Row Separators
    data.forEach((_, i) => {
      const yPos = (i + 1) * this.rowHeight;
      svgBody.append('line')
        .attr('x1', 0).attr('x2', totalWidth)
        .attr('y1', yPos).attr('y2', yPos)
        .attr('stroke', '#f8fafc');
    });

    // 3. Project Bars
    const barHeight = 24;
    data.forEach((d, i) => {
      const yCenter = (i * this.rowHeight) + (this.rowHeight / 2);
      const xStart = x(new Date(d.startDate));
      const xEnd = x(new Date(d.endDate));
      const width = Math.max(xEnd - xStart, 8);

      const group = svgBody.append('g')
        .attr('class', 'bar-group'); // Class for selection if needed

      let color = '#cbd5e1';
      if (d.status === 'FINALIZADO') color = '#10b981';
      else if (d.status === 'EN_PROCESO') color = '#ef4444'; // Red-500

      // Bar
      const rect = group.append('rect')
        .attr('x', xStart)
        .attr('y', yCenter - (barHeight / 2))
        .attr('width', width)
        .attr('height', barHeight)
        .attr('rx', 6)
        .attr('fill', color)
        .style('filter', 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))')
        .style('cursor', 'grab');

      // Drag Behavior
      const drag = d3.drag<SVGRectElement, unknown>()
        .on('start', function () {
          d3.select(this).style('cursor', 'grabbing').style('opacity', 0.7);
        })
        .on('drag', (event) => {
          // Move the rect visually
          const newX = event.x;
          d3.select(event.sourceEvent.target).attr('x', newX);

          // Update Tooltip with Shadow Dates
          const newDate = x.invert(newX);
          const duration = (new Date(d.endDate).getTime() - new Date(d.startDate).getTime());
          const newEndDate = new Date(newDate.getTime() + duration);

          const tt = this.tooltip.nativeElement;
          document.getElementById('tt-dates')!.textContent =
            `${d3.timeFormat('%Y-%m-%d')(newDate)} - ${d3.timeFormat('%Y-%m-%d')(newEndDate)}`;
          document.getElementById('tt-progress')!.textContent = 'Soltar para guardar';

          tt.style.opacity = '1';
          tt.style.left = (event.sourceEvent.clientX + 10) + 'px';
          tt.style.top = (event.sourceEvent.clientY + 10) + 'px';
        })
        .on('end', (event) => {
          d3.select(event.sourceEvent.target).style('cursor', 'grab').style('opacity', 1);
          this.tooltip.nativeElement.style.opacity = '0';

          const finalX = parseFloat(d3.select(event.sourceEvent.target).attr('x'));
          const newStartDate = x.invert(finalX);

          // Snap to Day
          newStartDate.setHours(0, 0, 0, 0);

          // Calculate End Date keeping duration
          const originalDuration = new Date(d.endDate).getTime() - new Date(d.startDate).getTime();
          const newEndDate = new Date(newStartDate.getTime() + originalDuration);

          // Format strings
          const startStr = d3.timeFormat('%Y-%m-%d')(newStartDate);
          const endStr = d3.timeFormat('%Y-%m-%d')(newEndDate);

          if (startStr !== d.startDate) {
            this.dataService.updateProjectDates(d.id, startStr, endStr);
          } else {
            // If moved but mapped to same day (jitter), redraw to snap back
            this.drawGantt();
          }
        });

      rect.call(drag);

      rect.on('mousemove', (evt) => {
        // Only show tooltip if NOT dragging (d3.drag prevents click/hover propagation issues usually, but good check)
        if (evt.buttons === 0) {
          const tt = this.tooltip.nativeElement;
          document.getElementById('tt-dates')!.textContent = `${d.startDate} - ${d.endDate}`;
          document.getElementById('tt-progress')!.textContent = `Progreso: ${d.progress}%`;

          tt.style.opacity = '1';
          tt.style.left = (evt.clientX + 10) + 'px';
          tt.style.top = (evt.clientY + 10) + 'px';
        }
      })
        .on('mouseleave', () => {
          if (d3.event && d3.event.buttons === 0) {
            this.tooltip.nativeElement.style.opacity = '0';
          }
        })
        .on('click', () => {
          this.projectSelected.emit(d.id);
        });

      // Label (Only if enough space)
      if (width > 30) {
        let labelText = '';
        let labelClass = '';

        if (d.status === 'EN_PROCESO') {
          labelText = 'En Curso';
          labelClass = 'text-[10px] font-bold fill-red-700 uppercase tracking-wide';
        } else if (d.status === 'PLANIFICACION') {
          labelText = 'Plan';
          labelClass = 'text-[10px] font-bold fill-slate-400 uppercase tracking-wide';
        } else if (d.status === 'FINALIZADO') {
          labelText = 'Completado';
          labelClass = 'text-[10px] font-bold fill-green-600 uppercase tracking-wide';
        }

        group.append('text')
          .attr('x', xEnd + 8)
          .attr('y', yCenter)
          .attr('dy', '0.35em')
          .text(labelText)
          .attr('class', labelClass)
          .style('cursor', 'pointer')
          .on('click', () => this.projectSelected.emit(d.id));
      }
    });

    // 4. Dependencies (Arrows)
    this.drawDependencies(svgBody, x, data);

    // 5. Today Line
    const today = new Date();
    if (today >= minDate && today <= maxDate) {
      this.todayX = x(today);

      // Body Line
      svgBody.append('line')
        .attr('x1', this.todayX).attr('x2', this.todayX)
        .attr('y1', 0).attr('y2', totalHeight)
        .attr('stroke', '#3b82f6').attr('stroke-width', 1.5);

      // Header Indicator
      d3.select(headerEl).select('svg').append('line')
        .attr('x1', this.todayX).attr('x2', this.todayX)
        .attr('y1', 25).attr('y2', this.headerHeight)
        .attr('stroke', '#3b82f6').attr('stroke-width', 1.5);

      d3.select(headerEl).select('svg').append('circle')
        .attr('cx', this.todayX).attr('cy', 25)
        .attr('r', 3).attr('fill', '#3b82f6');
    }
  }

  private drawDependencies(svg: any, x: any, projects: Project[]) {
    // Define Arrow Marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 8) // Offset to not overlap with rect slightly
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#94a3b8');

    const dependencies = this.dataService.getAllDependencies();
    const barHeight = 24;

    dependencies.forEach(dep => {
      const source = projects.find(p => p.id === dep.sourceProjectId);
      const target = projects.find(p => p.id === dep.targetProjectId);

      if (!source || !target) return;

      const sourceIdx = projects.findIndex(p => p.id === source.id);
      const targetIdx = projects.findIndex(p => p.id === target.id);

      if (sourceIdx === -1 || targetIdx === -1) return;

      // Coordinates
      const x1 = x(new Date(source.endDate));
      const y1 = (sourceIdx * this.rowHeight) + (this.rowHeight / 2);

      const x2 = x(new Date(target.startDate));
      const y2 = (targetIdx * this.rowHeight) + (this.rowHeight / 2);

      // Path Logic
      // If target is after source (visually right), draw simple curve
      // If target is before (visually left), needs loop

      const path = d3.path();
      path.moveTo(x1, y1);

      const deltaX = x2 - x1;
      const deltaY = y2 - y1;

      if (deltaX > 20) {
        // Simple S-curve
        const cp1x = x1 + (deltaX / 2);
        const cp2x = x1 + (deltaX / 2);
        path.bezierCurveTo(cp1x, y1, cp2x, y2, x2, y2);
      } else {
        // Loop back or tight S
        path.lineTo(x1 + 10, y1);
        path.lineTo(x1 + 10, y2 - (deltaY > 0 ? 10 : -10)); // Go visually towards Y
        path.lineTo(x2 - 10, y2);
        path.lineTo(x2, y2);
      }

      svg.append('path')
        .attr('d', path.toString())
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.5)
        .attr('fill', 'none')
        .attr('marker-end', 'url(#arrowhead)')
        .style('pointer-events', 'none'); // Don't block interactions
    });
  }

  // --- Header Helpers ---

  private drawDayViewHeader(svg: any, x: any, minDate: Date, maxDate: Date) {
    // Top: Months
    const months = d3.timeMonth.range(minDate, maxDate);
    months.forEach(month => {
      const xPos = x(month);
      svg.append('text').attr('x', xPos + 10).attr('y', 20)
        .text(d3.timeFormat('%B %Y')(month).toUpperCase())
        .attr('class', 'text-[10px] font-bold fill-slate-500 tracking-widest');
      svg.append('line').attr('x1', xPos).attr('x2', xPos).attr('y1', 0).attr('y2', 25).attr('stroke', '#e2e8f0');
    });

    // Bottom: Days
    const days = d3.timeDay.range(minDate, maxDate);
    days.forEach(day => {
      svg.append('text')
        .attr('x', x(day) + (this.getDayWidth() / 2))
        .attr('y', 42).attr('text-anchor', 'middle')
        .text(day.getDate())
        .attr('class', 'text-[10px] font-medium fill-slate-400');
    });
  }

  private drawWeekViewHeader(svg: any, x: any, minDate: Date, maxDate: Date) {
    // Top: Months
    const months = d3.timeMonth.range(minDate, maxDate);
    months.forEach(month => {
      const xPos = x(month);
      svg.append('text').attr('x', xPos + 10).attr('y', 20)
        .text(d3.timeFormat('%B %Y')(month).toUpperCase())
        .attr('class', 'text-[10px] font-bold fill-slate-500 tracking-widest');
      svg.append('line').attr('x1', xPos).attr('x2', xPos).attr('y1', 0).attr('y2', 25).attr('stroke', '#e2e8f0');
    });

    // Bottom: Week Starts (Mondays)
    const weeks = d3.timeMonday.range(minDate, maxDate);
    weeks.forEach(week => {
      const xPos = x(week);
      svg.append('text')
        .attr('x', xPos + 5)
        .attr('y', 42)
        .text(d3.timeFormat('%d %b')(week)) // "02 Oct"
        .attr('class', 'text-[10px] font-medium fill-slate-400');
      svg.append('line').attr('x1', xPos).attr('x2', xPos).attr('y1', 25).attr('y2', 50).attr('stroke', '#f1f5f9');
    });
  }

  private drawMonthViewHeader(svg: any, x: any, minDate: Date, maxDate: Date) {
    // Top: Years
    const years = d3.timeYear.range(minDate, maxDate);
    years.forEach(year => {
      const xPos = x(year);
      svg.append('text').attr('x', xPos + 10).attr('y', 20)
        .text(d3.timeFormat('%Y')(year))
        .attr('class', 'text-[10px] font-bold fill-slate-500 tracking-widest');
      svg.append('line').attr('x1', xPos).attr('x2', xPos).attr('y1', 0).attr('y2', 25).attr('stroke', '#e2e8f0');
    });

    // Bottom: Months
    const months = d3.timeMonth.range(minDate, maxDate);
    months.forEach(month => {
      const xPos = x(month);
      const nextMonth = new Date(month); nextMonth.setMonth(month.getMonth() + 1);
      const width = x(nextMonth) - xPos;

      svg.append('text')
        .attr('x', xPos + (width / 2))
        .attr('y', 42).attr('text-anchor', 'middle')
        .text(d3.timeFormat('%b')(month)) // "Jan"
        .attr('class', 'text-[10px] font-medium fill-slate-400');
      svg.append('line').attr('x1', xPos).attr('x2', xPos).attr('y1', 25).attr('y2', 50).attr('stroke', '#f1f5f9');
    });
  }

  private drawGridLines(svg: any, x: any, minDate: Date, maxDate: Date, height: number) {
    let ticks;
    if (this.viewMode() === 'Day') ticks = d3.timeDay.range(minDate, maxDate);
    else if (this.viewMode() === 'Week') ticks = d3.timeMonday.range(minDate, maxDate);
    else ticks = d3.timeMonth.range(minDate, maxDate);

    ticks.forEach(t => {
      const xPos = x(t);
      // For Day view, draw at end of day. For others, draw at start.
      const lineX = this.viewMode() === 'Day' ? xPos + this.getDayWidth() : xPos;

      svg.append('line')
        .attr('x1', lineX).attr('x2', lineX)
        .attr('y1', 0).attr('y2', height)
        .attr('stroke', '#f8fafc') // very subtle
        .attr('stroke-dasharray', this.viewMode() === 'Day' ? '0' : '4,4'); // Dashed for week/month separators
    });
  }
}
