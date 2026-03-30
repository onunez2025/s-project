
import { Component, input, signal, effect, ElementRef, ViewChildren, QueryList, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
   selector: 'app-manual',
   standalone: true,
   imports: [CommonModule],
   template: `
    <div class="flex h-full bg-card rounded-lg shadow-sm border border-border overflow-hidden relative animate-fade-in font-sans">
            <!-- Sidenav Menu -->
      <div class="w-64 bg-muted/30 border-r border-border flex flex-col shrink-0">
        <div class="p-6 border-b border-border">
           <h3 class="font-black text-foreground text-[11px] uppercase tracking-widest flex items-center gap-2">
             <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
             Manual de Uso
           </h3>
           <p class="text-[9px] text-muted-foreground mt-1 uppercase tracking-tighter">Versión 1.1.0 QAS</p>
        </div>
        <nav class="flex-1 overflow-y-auto p-4 space-y-1">
           @for(chapter of chapters; track chapter.id) {
             <button (click)="scrollTo(chapter.id)" 
                class="w-full text-left px-3 py-2 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all flex items-center justify-between group"
                [class.bg-primary]="activeChapter() === chapter.id"
                [class.text-primary-foreground]="activeChapter() === chapter.id"
                [class.text-muted-foreground]="activeChapter() !== chapter.id"
                [class.hover:bg-muted]="activeChapter() !== chapter.id">
                {{ chapter.title }}
                @if(activeChapter() === chapter.id) {
                   <div class="w-1 h-1 rounded-full bg-primary-foreground"></div>
                }
             </button>
           }
        </nav>
      </div>
 
      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto bg-background p-8 sm:p-12 scroll-smooth custom-scrollbar" #contentContainer (scroll)="onScroll()">
         <div class="max-w-3xl mx-auto space-y-20">
            
            <!-- Intro -->
            <section id="intro" class="scroll-mt-8">
               <h1 class="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter">Bienvenido a Sproject QAS</h1>
               <p class="text-xs text-muted-foreground leading-relaxed font-medium">
                  Esta plataforma ha sido diseñada para centralizar la gestión de proyectos corporativos de SOLE, integrando control presupuestario, gestión de tareas y análisis de impacto financiero.
               </p>
            </section>
 
            <!-- Projects Section -->
            <section id="projects" class="scroll-mt-8 border-t border-border pt-12">
               <div class="flex items-center gap-3 mb-8">
                  <div class="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </div>
                  <h2 class="text-lg font-black text-foreground uppercase tracking-widest">Gestión de Proyectos</h2>
               </div>
               
               <div class="space-y-6 text-xs text-muted-foreground font-medium">
                  <h3 class="text-[11px] font-black text-foreground uppercase tracking-widest mt-4">Creación de Proyectos Multi-Área</h3>
                  <p>
                     Sproject QAS permite la colaboración entre departamentos. Al crear un nuevo proyecto, debes configurar:
                  </p>
                  <ul class="list-none space-y-3 mb-8 pl-4 border-l-2 border-primary/20">
                     <li><strong class="text-foreground uppercase tracking-tighter">Áreas Participantes:</strong> Selecciona todas las unidades de negocio involucradas.</li>
                     <li><strong class="text-foreground uppercase tracking-tighter">Líderes por Área:</strong> Para cada área seleccionada, es obligatorio asignar un Líder.</li>
                     <li><strong class="text-foreground uppercase tracking-tighter">Presupuesto y Moneda:</strong> Define el CAPEX inicial.</li>
                  </ul>
 
                  <!-- Screenshot Placeholder -->
                   <div class="my-10 bg-card rounded-lg border border-border p-1.5 relative group/container shadow-sm">
                     <!-- Admin Edit Button -->
                     @if(isAdmin()) {
                        <button (click)="projInput.click()" class="absolute top-4 right-4 z-10 p-2 bg-background/80 backdrop-blur-sm text-foreground hover:text-primary rounded-md shadow-lg border border-border opacity-0 group-hover/container:opacity-100 transition-all transform hover:scale-110" title="Cambiar imagen (Admin)">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <input #projInput type="file" class="hidden" accept="image/*" (change)="onFileSelected($event, 'PROJECT')">
                     }
 
                     <div class="bg-muted/20 rounded-md min-h-[16rem] flex items-center justify-center relative overflow-hidden group">
                        @if (projectImage()) {
                           <img [src]="projectImage()" class="w-full h-auto object-contain">
                        } @else {
                           <img src="assets/manual/projects.png" class="w-full h-auto object-contain">
                        }
                        <div class="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                           <span class="text-[10px] font-black text-foreground uppercase tracking-widest bg-card px-4 py-1.5 rounded-full border border-border shadow-2xl">Visualización del Sistema</span>
                        </div>
                     </div>
                     <p class="text-center text-[9px] text-muted-foreground font-bold mt-2 uppercase tracking-tighter italic">Fig 1. Configuración de parámetros iniciales del proyecto.</p>
                  </div>
 
                  <div class="bg-primary/5 border-l-2 border-primary p-5 rounded-r-md">
                     <p class="text-[11px] text-foreground font-bold leading-relaxed">
                        <strong class="uppercase tracking-widest text-[9px] block mb-1">Nota de Jerarquía:</strong> Un Líder de Área solo podrá asignar como "Responsables" a miembros de su propia área o a sí mismo, garantizando la integridad de la cadena de mando.
                     </p>
                  </div>
               </div>
            </section>
 
            <!-- Tasks Section -->
            <section id="tasks" class="scroll-mt-8 border-t border-border pt-12">
               <div class="flex items-center gap-3 mb-8">
                  <div class="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                  </div>
                  <h2 class="text-lg font-black text-foreground uppercase tracking-widest">Kanban y Actividades</h2>
               </div>
               
               <div class="space-y-6 text-xs text-muted-foreground font-medium">
                  <p>
                     El tablero Kanban es el motor de ejecución, diseñado para una visualización rápida del flujo de trabajo en tres estados fundamentales.
                  </p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div class="bg-card p-5 rounded-lg border border-border shadow-sm">
                        <h4 class="font-black text-foreground text-[10px] uppercase tracking-widest mb-2">Flujo Interactivo</h4>
                        <p class="text-[11px] leading-relaxed">Arrastre las tarjetas para actualizar estados. El sistema automatiza el registro de tiempos de ejecución.</p>
                     </div>
                     <div class="bg-card p-5 rounded-lg border border-border shadow-sm">
                        <h4 class="font-black text-foreground text-[10px] uppercase tracking-widest mb-2">Métricas de Avance</h4>
                        <p class="text-[11px] leading-relaxed">El porcentaje de completitud se deriva directamente de la relación entre tareas realizadas y totales.</p>
                     </div>
                  </div>
                  
                  <!-- Screenshot Placeholder -->
                   <div class="my-10 bg-card rounded-lg border border-border p-1.5 relative group/container shadow-sm">
                     <!-- Admin Edit Button -->
                     @if(isAdmin()) {
                        <button (click)="kanbanInput.click()" class="absolute top-4 right-4 z-10 p-2 bg-background/80 backdrop-blur-sm text-foreground hover:text-primary rounded-md shadow-lg border border-border opacity-0 group-hover/container:opacity-100 transition-all transform hover:scale-110" title="Cambiar imagen (Admin)">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <input #kanbanInput type="file" class="hidden" accept="image/*" (change)="onFileSelected($event, 'KANBAN')">
                     }
 
                     <div class="bg-muted/20 rounded-md min-h-[16rem] flex items-center justify-center relative overflow-hidden group">
                        @if (kanbanImage()) {
                           <img [src]="kanbanImage()" class="w-full h-auto object-contain">
                        } @else {
                           <img src="assets/manual/kanban.png" class="w-full h-auto object-contain">
                        }
                     </div>
                     <p class="text-center text-[9px] text-muted-foreground font-bold mt-2 uppercase tracking-tighter italic">Fig 2. Interfaz del Tablero Kanban con indicadores de prioridad.</p>
                  </div>
               </div>
            </section>
 
            <!-- Finance Section -->
            <section id="finance" class="scroll-mt-8 border-t border-border pt-12">
               <div class="flex items-center gap-3 mb-8">
                  <div class="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h2 class="text-lg font-black text-foreground uppercase tracking-widest">Finanzas y Retorno</h2>
               </div>
               
               <div class="space-y-6 text-xs text-muted-foreground font-medium">
                  <p>
                     El Análisis de Retorno centraliza la justificación financiera del proyecto mediante la diferenciación de CAPEX y OPEX.
                  </p>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div class="bg-destructive/5 p-5 rounded-lg border border-destructive/20">
                        <h4 class="font-black text-destructive text-[10px] uppercase tracking-widest mb-2">CAPEX (Inversión)</h4>
                        <p class="text-[11px] leading-relaxed">Presupuesto de capital asignado. Incluye licencias, hardware y desarrollos iniciales.</p>
                     </div>
                     <div class="bg-primary/5 p-5 rounded-lg border border-primary/20">
                        <h4 class="font-black text-primary text-[10px] uppercase tracking-widest mb-2">OPEX (Ahorro)</h4>
                        <p class="text-[11px] leading-relaxed">Eficiencia operativa mensual proyectada tras la implementación del proyecto.</p>
                     </div>
                  </div>
 
                  <h3 class="text-[11px] font-black text-foreground uppercase tracking-widest mt-10 mb-4 text-center">Metodología de Cálculo</h3>
                  <div class="bg-muted/30 p-6 rounded-md border border-border font-mono text-[11px] text-center text-foreground flex items-center justify-center">
                     Ahorro = (Δ Valor) &times; Frecuencia &times; Costo Unitario
                  </div>
                  
                  <div class="grid grid-cols-3 gap-2 mt-8">
                     <div class="text-center p-3">
                        <span class="text-[9px] font-black text-foreground uppercase tracking-widest underline decoration-primary/50 decoration-2 underline-offset-4 block mb-2">Horas Hombre</span>
                        <p class="text-[10px] leading-tight">Optimización del tiempo laboral.</p>
                     </div>
                     <div class="text-center p-3">
                        <span class="text-[9px] font-black text-foreground uppercase tracking-widest underline decoration-primary/50 decoration-2 underline-offset-4 block mb-2">Insumos</span>
                        <p class="text-[10px] leading-tight">Reducción de gastos variables.</p>
                     </div>
                     <div class="text-center p-3">
                        <span class="text-[9px] font-black text-foreground uppercase tracking-widest underline decoration-primary/50 decoration-2 underline-offset-4 block mb-2">Riesgos</span>
                        <p class="text-[10px] leading-tight">Mitigación de costos imprevistos.</p>
                     </div>
                  </div>
               </div>
            </section>
 
            <!-- FAQ Section (Custom Accordion) -->
            <section id="faq" class="scroll-mt-8 border-t border-border pt-12 pb-24">
               <div class="flex items-center gap-3 mb-10">
                  <div class="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h2 class="text-lg font-black text-foreground uppercase tracking-widest">Preguntas Frecuentes</h2>
               </div>
 
               <div class="space-y-3">
                  @for(f of [1,2,3]; track f) {
                     <div class="border border-border rounded-lg overflow-hidden transition-all bg-card shadow-sm">
                        <button (click)="toggleFaq(f)" class="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left group">
                           <span class="font-bold text-foreground text-[11px] uppercase tracking-wide">
                              {{ f === 1 ? '¿Cómo elimino un proyecto finalizado?' : 
                                 f === 2 ? '¿Por qué no puedo editar una tarea?' : 
                                 '¿Qué formato de archivos soporta la plataforma?' }}
                           </span>
                           <svg class="w-4 h-4 text-muted-foreground transition-transform duration-300 group-hover:text-primary" [class.rotate-180]="isFaqOpen(f)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        @if(isFaqOpen(f)) {
                           <div class="px-5 py-4 text-xs text-muted-foreground border-t border-border animate-fade-in leading-relaxed font-medium">
                              {{ f === 1 ? 'Los proyectos finalizados se archivan para auditoría. Solo administradores pueden eliminarlos permanentemente.' : 
                                 f === 2 ? 'La edición está restringida al Responsable, Líder de Área o Administrador. Tareas finalizadas requieren intervención de admin.' : 
                                 'Se soportan PDF, Imágenes (JPG, PNG) y Excel. El límite recomendado es de 5MB por archivo.' }}
                           </div>
                        }
                     </div>
                  }
               </div>
            </section>
 
         </div>
      </div>
    </div>
  `,
    styles: [`
     .custom-scrollbar::-webkit-scrollbar { width: 5px; }
     .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
     .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
     .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary) / 0.5); }
   `]
})
export class ManualComponent {
   dataService = inject(DataService);
   section = input<string | null>(null); // Input for deep linking

   activeChapter = signal('intro');
   openFaqs = signal<number[]>([]);

   // Database-backed images
   manualAssets = this.dataService.manualAssets;
   projectImage = computed(() => this.manualAssets().find(a => a.sectionKey === 'PROJECT')?.imageUrl || 'assets/manual/projects.png');
   kanbanImage = computed(() => this.manualAssets().find(a => a.sectionKey === 'KANBAN')?.imageUrl || 'assets/manual/kanban.png');

   @ViewChildren('contentContainer') contentContainer!: QueryList<ElementRef>;

   chapters = [
      { id: 'intro', title: 'Introducción' },
      { id: 'projects', title: 'Proyectos & Áreas' },
      { id: 'tasks', title: 'Kanban & Tareas' },
      { id: 'finance', title: 'Finanzas (Payback)' },
      { id: 'faq', title: 'Preguntas Frecuentes' }
   ];

   isAdmin = computed(() => this.dataService.currentUser()?.role === 'ADMIN');

   constructor() {
      effect(() => {
         const sec = this.section();
         if (sec) {
            this.scrollTo(sec.toLowerCase());
         }
      });
   }

   scrollTo(id: string) {
      this.activeChapter.set(id);
      const element = document.getElementById(id);
      if (element) {
         element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
   }

   onScroll() {
      // Simple intersection logic could be added here to update activeChapter on scroll
   }

   toggleFaq(id: number) {
      this.openFaqs.update(ids => {
         if (ids.includes(id)) return ids.filter(x => x !== id);
         return [...ids, id];
      });
   }

   isFaqOpen(id: number) {
      return this.openFaqs().includes(id);
   }

   onFileSelected(event: any, type: string) {
      const file = event.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = (e: any) => {
            const result = e.target.result;
            this.dataService.updateManualAsset(type, result);
         };
         reader.readAsDataURL(file);
      }
   }
}
