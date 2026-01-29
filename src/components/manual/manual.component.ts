
import { Component, input, signal, effect, ElementRef, ViewChildren, QueryList, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
   selector: 'app-manual',
   standalone: true,
   imports: [CommonModule],
   template: `
    <div class="flex h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
            <!-- Sidenav Menu -->
      <div class="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        <div class="p-6 border-b border-slate-200">
           <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
             <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
             Manual de Uso
           </h3>
           <p class="text-xs text-slate-500 mt-1">Versión 1.1.0 QAS</p>
        </div>
        <nav class="flex-1 overflow-y-auto p-4 space-y-1">
           @for(chapter of chapters; track chapter.id) {
             <button (click)="scrollTo(chapter.id)" 
                class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group"
                [class.bg-red-100]="activeChapter() === chapter.id"
                [class.text-red-700]="activeChapter() === chapter.id"
                [class.text-slate-600]="activeChapter() !== chapter.id"
                [class.hover:bg-slate-100]="activeChapter() !== chapter.id">
                {{ chapter.title }}
                @if(activeChapter() === chapter.id) {
                   <div class="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                }
             </button>
           }
        </nav>
      </div>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto bg-white p-8 sm:p-12 scroll-smooth" #contentContainer (scroll)="onScroll()">
         <div class="max-w-4xl mx-auto space-y-16">
            
            <!-- Intro -->
            <section id="intro" class="scroll-mt-8">
               <h1 class="text-4xl font-bold text-slate-900 mb-4">Bienvenido a Sproject QAS</h1>
               <p class="text-lg text-slate-600 leading-relaxed">
                  Esta plataforma ha sido diseñada para centralizar la gestión de proyectos corporativos de SOLE, integrando control presupuestario, gestión de tareas y análisis de impacto financiero.
               </p>
            </section>

            <!-- Projects Section -->
            <section id="projects" class="scroll-mt-8 border-t border-slate-100 pt-10">
               <div class="flex items-center gap-3 mb-6">
                  <div class="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </div>
                  <h2 class="text-2xl font-bold text-slate-800">Gestión de Proyectos</h2>
               </div>
               
               <div class="prose prose-slate max-w-none text-slate-600">
                  <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">Creación de Proyectos Multi-Área</h3>
                  <p class="mb-4">
                     Sproject QAS permite la colaboración entre departamentos. Al crear un nuevo proyecto, debes configurar:
                  </p>
                  <ul class="list-disc pl-5 space-y-2 mb-6">
                     <li><strong>Áreas Participantes:</strong> Selecciona todas las unidades de negocio involucradas.</li>
                     <li><strong>Líderes por Área:</strong> Para cada área seleccionada, es obligatorio asignar un Líder (Gerente o Jefe). Este líder será responsable de aprobar tareas y gastos de su departamento.</li>
                     <li><strong>Presupuesto y Moneda:</strong> Define el CAPEX inicial. Nota: La moneda no se puede cambiar una vez iniciadas las transacciones.</li>
                  </ul>

                  <!-- Screenshot Placeholder -->
                   <div class="my-8 bg-slate-50 rounded-xl border border-slate-200 p-2 relative group/container">
                     <!-- Admin Edit Button -->
                     @if(isAdmin()) {
                        <button (click)="projInput.click()" class="absolute top-4 right-4 z-10 p-2 bg-white text-slate-700 hover:text-red-600 rounded-lg shadow-md border border-slate-100 opacity-0 group-hover/container:opacity-100 transition-opacity transform hover:scale-105" title="Cambiar imagen (Admin)">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <input #projInput type="file" class="hidden" accept="image/*" (change)="onFileSelected($event, 'PROJECT')">
                     }

                     <div class="bg-slate-200 rounded-lg min-h-[16rem] flex items-center justify-center relative overflow-hidden group">
                        @if (projectImage()) {
                           <img [src]="projectImage()" class="w-full h-auto object-contain">
                        } @else {
                           <img src="assets/manual/projects.png" class="w-full h-auto object-contain">
                           <div class="absolute inset-0 bg-black/5 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span class="text-xs font-bold text-slate-600 uppercase tracking-wide bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">Vista del Formulario de Creación</span>
                           </div>
                        }
                     </div>
                     <p class="text-center text-xs text-slate-500 font-medium mt-2 italic">Fig 1. Formulario de configuración multi-área y asignación de líderes.</p>
                  </div>

                  <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                     <p class="text-sm text-amber-800 font-medium">
                        <strong>Nota Importante sobre Asignaciones:</strong> Por políticas de jerarquía, un Líder de Área solo podrá asignar como "Responsables" de tareas a miembros de su <u>propia área</u> o a sí mismo. Esto garantiza la integridad de la cadena de mando.
                     </p>
                  </div>
               </div>
            </section>

            <!-- Tasks Section -->
            <section id="tasks" class="scroll-mt-8 border-t border-slate-100 pt-10">
               <div class="flex items-center gap-3 mb-6">
                  <div class="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                  </div>
                  <h2 class="text-2xl font-bold text-slate-800">Kanban y Actividades</h2>
               </div>
               
               <div class="prose prose-slate max-w-none text-slate-600">
                  <p class="mb-4">
                     El tablero Kanban es el corazón de la ejecución. Permite visualizar el flujo de trabajo en tres estados: <strong>Pendiente</strong>, <strong>En Proceso</strong> y <strong>Realizada</strong>.
                  </p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h4 class="font-bold text-slate-800 mb-2">Movimiento de Tarjetas</h4>
                        <p class="text-sm">Arrastra y suelta las tarjetas para cambiar su estado. El sistema registrará automáticamente las fechas reales de inicio y fin.</p>
                     </div>
                     <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h4 class="font-bold text-slate-800 mb-2">Cálculo de Progreso</h4>
                        <p class="text-sm">El % de avance del proyecto se calcula automáticamente: <code>(Tareas Realizadas / Total Tareas) * 100</code>.</p>
                     </div>
                  </div>
                  
                  <!-- Screenshot Placeholder -->
                   <div class="my-8 bg-slate-50 rounded-xl border border-slate-200 p-2 relative group/container">
                     <!-- Admin Edit Button -->
                     @if(isAdmin()) {
                        <button (click)="kanbanInput.click()" class="absolute top-4 right-4 z-10 p-2 bg-white text-slate-700 hover:text-red-600 rounded-lg shadow-md border border-slate-100 opacity-0 group-hover/container:opacity-100 transition-opacity transform hover:scale-105" title="Cambiar imagen (Admin)">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <input #kanbanInput type="file" class="hidden" accept="image/*" (change)="onFileSelected($event, 'KANBAN')">
                     }

                     <div class="bg-slate-200 rounded-lg min-h-[16rem] flex items-center justify-center relative overflow-hidden group">
                        @if (kanbanImage()) {
                           <img [src]="kanbanImage()" class="w-full h-auto object-contain">
                        } @else {
                           <img src="assets/manual/kanban.png" class="w-full h-auto object-contain">
                        }
                     </div>
                     <p class="text-center text-xs text-slate-500 font-medium mt-2 italic">Fig 3. Tablero Kanban interactivo con indicadores de vencimiento.</p>
                  </div>
               </div>
            </section>

            <!-- Finance Section -->
            <section id="finance" class="scroll-mt-8 border-t border-slate-100 pt-10">
               <div class="flex items-center gap-3 mb-6">
                  <div class="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h2 class="text-2xl font-bold text-slate-800">Finanzas y Retorno (Payback)</h2>
               </div>
               
               <div class="prose prose-slate max-w-none text-slate-600">
                  <p class="mb-4">
                     La pestaña de Análisis de Retorno es crucial para justificar la inversión del proyecto. Aquí diferenciamos dos conceptos clave:
                  </p>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                     <div class="bg-red-50/50 p-5 rounded-xl border border-blue-100">
                        <h4 class="font-bold text-red-800 mb-2">CAPEX (Inversión)</h4>
                        <p class="text-sm">Es el presupuesto asignado para ejecutar el proyecto (Capital Expenditure). Incluye licencias, desarrollo, hardware inicial, etc. Se define al crear el proyecto.</p>
                     </div>
                     <div class="bg-green-50/50 p-5 rounded-xl border border-green-100">
                        <h4 class="font-bold text-green-800 mb-2">OPEX (Ahorro Operativo)</h4>
                        <p class="text-sm">Es el ahorro mensual estimado que generará el proyecto una vez finalizado (Operational Expenditure saving). Se calcula mediante "Indicadores de Impacto".</p>
                     </div>
                  </div>

                  <h3 class="text-lg font-bold text-slate-800 mt-6 mb-2">Cálculo de Indicadores</h3>
                  <p class="mb-4">El sistema calcula el ahorro mensual sumando el impacto de cada indicador registrado:</p>
                  <code class="block bg-slate-900 text-slate-200 p-4 rounded-lg text-sm font-mono mb-6">
                     Ahorro = (Valor Actual - Valor Proyectado) * Frecuencia * Costo Unitario
                  </code>
                  
                  <div class="space-y-3">
                     <div class="flex items-start gap-3">
                        <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold uppercase mt-0.5">Horas Hombre</span>
                        <p class="text-sm">Reducción de tiempo del personal. <em>Ej: De 40 horas/mes a 5 horas/mes.</em></p>
                     </div>
                     <div class="flex items-start gap-3">
                        <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold uppercase mt-0.5">Insumos</span>
                        <p class="text-sm">Reducción de materiales o servicios. <em>Ej: Menor consumo eléctrico o licencias.</em></p>
                     </div>
                     <div class="flex items-start gap-3">
                        <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold uppercase mt-0.5">Riesgos</span>
                        <p class="text-sm">Valor monetario de mitigar un riesgo potencial. <em>Ej: Multas evitadas.</em></p>
                     </div>
                  </div>
               </div>
            </section>

            <!-- FAQ Section (Custom Accordion) -->
            <section id="faq" class="scroll-mt-8 border-t border-slate-100 pt-10 pb-20">
               <div class="flex items-center gap-3 mb-6">
                  <div class="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h2 class="text-2xl font-bold text-slate-800">Preguntas Frecuentes</h2>
               </div>

               <div class="space-y-4">
                  <!-- FAQ Item 1 -->
                  <div class="border border-slate-200 rounded-xl overflow-hidden">
                     <button (click)="toggleFaq(1)" class="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
                        <span class="font-bold text-slate-700 text-sm">¿Cómo elimino un proyecto finalizado?</span>
                        <svg class="w-5 h-5 text-slate-400 transition-transform duration-200" [class.rotate-180]="isFaqOpen(1)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                     </button>
                     @if(isFaqOpen(1)) {
                        <div class="p-4 bg-white text-sm text-slate-600 border-t border-slate-100 animate-slide-down">
                           Los proyectos finalizados no se eliminan para mantener el histórico financiero y de auditoría. Solo un Administrador puede archivarlos o eliminarlos permanentemente desde la base de datos si es estrictamente necesario.
                        </div>
                     }
                  </div>

                  <!-- FAQ Item 2 -->
                  <div class="border border-slate-200 rounded-xl overflow-hidden">
                     <button (click)="toggleFaq(2)" class="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
                        <span class="font-bold text-slate-700 text-sm">¿Por qué no puedo editar una tarea?</span>
                        <svg class="w-5 h-5 text-slate-400 transition-transform duration-200" [class.rotate-180]="isFaqOpen(2)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                     </button>
                     @if(isFaqOpen(2)) {
                        <div class="p-4 bg-white text-sm text-slate-600 border-t border-slate-100 animate-slide-down">
                           La edición de tareas está restringida. Solo el <strong>Responsable</strong> asignado, el <strong>Líder de su Área</strong> o un <strong>Administrador</strong> pueden modificar o mover una tarea. Si la tarea ya está en estado "Finalizada", solo un administrador puede revertirla.
                        </div>
                     }
                  </div>

                   <!-- FAQ Item 3 -->
                  <div class="border border-slate-200 rounded-xl overflow-hidden">
                     <button (click)="toggleFaq(3)" class="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
                        <span class="font-bold text-slate-700 text-sm">¿Qué formato de archivos soporta la plataforma?</span>
                        <svg class="w-5 h-5 text-slate-400 transition-transform duration-200" [class.rotate-180]="isFaqOpen(3)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                     </button>
                     @if(isFaqOpen(3)) {
                        <div class="p-4 bg-white text-sm text-slate-600 border-t border-slate-100 animate-slide-down">
                           Sproject QAS soporta oficialmente PDF, Imágenes (JPG, PNG) y Archivos Excel. El tamaño máximo recomendado por archivo es de 5MB para no saturar el servidor.
                        </div>
                     }
                  </div>
               </div>
            </section>

         </div>
      </div>
    </div>
  `,
   styles: [`
    .animate-slide-down { animation: slideDown 0.2s ease-out; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
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
