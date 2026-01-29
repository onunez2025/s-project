

import { Component, inject, input, output, computed, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Project, User, Activity, Expense, ProjectFile, ExpenseCategory, FileType, Currency, ImpactIndicator, IndicatorCategory } from '../../services/data.service';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { ProjectChatComponent } from '../project-chat/project-chat.component';
import * as d3 from 'd3';

type DetailTab = 'BOARD' | 'EXPENSES' | 'FILES' | 'PAYBACK' | 'CONVERSATIONS';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ProjectFormComponent, ProjectChatComponent],
  template: `
    @if (project(); as p) {
      <div class="flex flex-col h-full animate-fade-in gap-6 pb-10">
        
        <!-- Modern Header -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div class="flex items-start gap-4">
             <button (click)="back.emit()" class="group mt-1 p-2 rounded-lg hover:bg-slate-100 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-400 group-hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
               </svg>
             </button>
             <div>
               <div class="flex items-center gap-3">
                 <h1 class="text-2xl font-bold text-slate-900" [attr.title]="p.name">{{ p.name }}</h1>
                 <span class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border"
                    [class.bg-blue-50]="p.status === 'EN_PROGRESO'"
                    [class.text-blue-700]="p.status === 'EN_PROGRESO'"
                    [class.border-blue-100]="p.status === 'EN_PROGRESO'"
                    [class.bg-green-50]="p.status === 'FINALIZADO'"
                    [class.text-green-700]="p.status === 'FINALIZADO'"
                    [class.border-green-100]="p.status === 'FINALIZADO'"
                    [class.bg-slate-50]="p.status === 'PLANIFICACION'"
                    [class.text-slate-600]="p.status === 'PLANIFICACION'"
                    [class.border-slate-100]="p.status === 'PLANIFICACION'">
                   {{ p.status.replace('_', ' ') }}
                 </span>
               </div>
               <p class="text-slate-600 mt-1 max-w-2xl">{{ p.description }}</p>
             </div>
          </div>

          <!-- Header Actions -->
          <div class="flex items-center gap-3">
             @if (p.status === 'FINALIZADO') {
                <div class="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100 font-bold text-sm">
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                   Proyecto Cerrado
                </div>
             }

             @if (canManageActivities()) {
                <button (click)="openEditForm()" class="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                   </svg>
                   Editar
                </button>

                <button (click)="finishProject()" 
                        [disabled]="!isProjectReadyToFinish()"
                        class="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
                        [class.bg-red-600]="isProjectReadyToFinish()"
                        [class.text-white]="isProjectReadyToFinish()"
                        [class.hover:bg-red-700]="isProjectReadyToFinish()"
                        [class.shadow-red-600/20]="isProjectReadyToFinish()"
                        [class.bg-slate-100]="!isProjectReadyToFinish()"
                        [class.text-slate-400]="!isProjectReadyToFinish()"
                        [class.cursor-not-allowed]="!isProjectReadyToFinish()"
                        [title]="isProjectReadyToFinish() ? 'Finalizar Proyecto' : 'Completa todas las actividades para finalizar'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Finalizar
                </button>
             }
          </div>
        </div>

        <!-- TABS Navigation (Redesigned for visibility) -->
        <div class="flex items-center justify-between">
           <div class="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex flex-wrap gap-2">
              <button (click)="activeTab.set('BOARD')" 
                      class="px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                      [class.bg-blue-50]="activeTab() === 'BOARD'"
                      [class.text-blue-700]="activeTab() === 'BOARD'"
                      [class.text-slate-600]="activeTab() !== 'BOARD'"
                      [class.hover:bg-slate-50]="activeTab() !== 'BOARD'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                Tablero
              </button>
              <button (click)="activeTab.set('EXPENSES')" 
                      class="px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                      [class.bg-blue-50]="activeTab() === 'EXPENSES'"
                      [class.text-blue-700]="activeTab() === 'EXPENSES'"
                      [class.text-slate-600]="activeTab() !== 'EXPENSES'"
                      [class.hover:bg-slate-50]="activeTab() !== 'EXPENSES'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Control de Gastos
              </button>
              <button (click)="activeTab.set('PAYBACK')" 
                      class="px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                      [class.bg-blue-50]="activeTab() === 'PAYBACK'"
                      [class.text-blue-700]="activeTab() === 'PAYBACK'"
                      [class.text-slate-600]="activeTab() !== 'PAYBACK'"
                      [class.hover:bg-slate-50]="activeTab() !== 'PAYBACK'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                Análisis de Retorno
              </button>
              <button (click)="activeTab.set('FILES')" 
                      class="px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                      [class.bg-blue-50]="activeTab() === 'FILES'"
                      [class.text-blue-700]="activeTab() === 'FILES'"
                      [class.text-slate-600]="activeTab() !== 'FILES'"
                      [class.hover:bg-slate-50]="activeTab() !== 'FILES'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                Archivos
              </button>
              <button (click)="activeTab.set('CONVERSATIONS')" 
                      class="px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                      [class.bg-blue-50]="activeTab() === 'CONVERSATIONS'"
                      [class.text-blue-700]="activeTab() === 'CONVERSATIONS'"
                      [class.text-slate-600]="activeTab() !== 'CONVERSATIONS'"
                      [class.hover:bg-slate-50]="activeTab() !== 'CONVERSATIONS'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                Conversaciones
              </button>
           </div>
           
           @if (activeTab() === 'PAYBACK') {
              <button (click)="goToManual.emit('finance')" class="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-white" title="Ayuda sobre Payback">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </button>
           }
        </div>

        @if (activeTab() === 'BOARD') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <!-- Left Column: Activities (Takes 2/3) -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Quick Stats -->
              <div class="grid grid-cols-3 gap-4">
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                   <p class="text-xs font-bold text-slate-400 uppercase">Actividades</p>
                   <p class="text-xl font-bold text-slate-800">{{ activities().length }}</p>
                </div>
                 <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                   <p class="text-xs font-bold text-slate-400 uppercase">Progreso</p>
                   <div class="flex items-center gap-2">
                     <p class="text-xl font-bold text-blue-600">{{ p.progress }}%</p>
                     <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-500 rounded-full" [style.width.%]="p.progress"></div>
                     </div>
                   </div>
                </div>
                 <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                   <p class="text-xs font-bold text-slate-400 uppercase">Líderes</p>
                   <div class="flex items-center gap-1 mt-1">
                      @for(c of p.areaConfig; track c.areaId) {
                         <img [src]="getUser(c.leaderId)?.avatar" class="h-6 w-6 rounded-full border border-white -ml-2 first:ml-0" [title]="getUser(c.leaderId)?.name">
                      }
                   </div>
                </div>
              </div>

              <!-- Tasks Card -->
              <div class="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[400px]">
                 <div class="p-5 border-b border-slate-50 flex justify-between items-center">
                   <h3 class="font-bold text-slate-800 text-lg">Mis Tareas</h3>
                   @if (canAddActivities()) {
                     <button (click)="isAddingActivity.set(!isAddingActivity())" class="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg transition-colors border border-blue-200">
                       {{ isAddingActivity() ? 'Cancelar' : '+ Nueva Tarea' }}
                     </button>
                   }
                 </div>

                 <div class="p-5 flex-1 bg-slate-50/30">
                   @if (isAddingActivity()) {
                     <div class="bg-white p-4 rounded-xl mb-4 border border-blue-100 shadow-sm animate-fade-in">
                       <div class="mb-3">
                          <label class="block text-xs font-bold text-slate-500 mb-1">Descripción</label>
                          <input type="text" [(ngModel)]="newActivityDesc" placeholder="¿Qué hay que hacer?" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900">
                       </div>
                       <div class="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label class="block text-xs font-bold text-slate-500 mb-1">Inicio Plan</label>
                            <input type="date" [(ngModel)]="newActivityStart" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none text-slate-900">
                          </div>
                          <div>
                            <label class="block text-xs font-bold text-slate-500 mb-1">Fin Plan</label>
                            <input type="date" [(ngModel)]="newActivityEnd" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none text-slate-900">
                          </div>
                       </div>
                       <div class="mb-4">
                         <label class="block text-xs font-bold text-slate-500 mb-1">Responsable</label>
                         <select [(ngModel)]="newActivityResp" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none text-slate-900">
                           <option [value]="0">Asignar a...</option>
                           <!-- Leaders -->
                           @for(c of p.areaConfig; track c.areaId) {
                              <option [value]="c.leaderId">{{ getUser(c.leaderId)?.name }} (Líder {{ getAreaName(c.areaId) }})</option>
                           }
                           <!-- Team -->
                           @for (memberId of p.teamIds; track memberId) {
                             <option [value]="memberId">{{ getUser(memberId)?.name }}</option>
                           }
                         </select>
                       </div>
                       <button (click)="addActivity()" [disabled]="!newActivityDesc() || !newActivityStart() || !newActivityEnd() || !newActivityResp()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm shadow-md shadow-blue-500/20 transition-all">Guardar Tarea</button>
                     </div>
                   }

                   <div class="space-y-3">
                     @for (act of activities(); track act.id) {
                       <div class="group flex items-center justify-between p-4 rounded-xl border transition-all duration-200"
                            [class.bg-white]="true"
                            [class.border-slate-100]="act.status !== 'REALIZADA'"
                            [class.border-green-100]="act.status === 'REALIZADA'"
                            [class.shadow-sm]="true"
                            [class.hover:shadow-md]="true">
                          <div class="flex items-center gap-4 flex-1">
                            <div class="flex-shrink-0">
                               @if (act.status === 'PENDIENTE') {
                                 <button (click)="startActivity(act)" [disabled]="!canEditActivity(act)" 
                                    class="w-8 h-8 rounded-full border-2 border-slate-300 text-slate-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Iniciar Tarea">
                                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                 </button>
                               } @else if (act.status === 'EN_PROGRESO') {
                                 <button (click)="completeActivity(act)" [disabled]="!canEditActivity(act)"
                                    class="w-8 h-8 rounded-full border-2 border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all animate-pulse disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Terminar Tarea">
                                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                 </button>
                               } @else {
                                 <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-green-500/30 shadow-md">
                                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                 </div>
                               }
                            </div>
                            <div class="flex flex-col">
                               <span class="text-sm font-semibold text-slate-900 transition-all" 
                                 [class.line-through]="act.status === 'REALIZADA'" 
                                 [class.text-slate-400]="act.status === 'REALIZADA'">
                                 {{ act.description }}
                               </span>
                               <div class="flex items-center gap-2 mt-1">
                                  <div class="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md">
                                    <img [src]="getUser(act.responsibleId)?.avatar" class="h-3.5 w-3.5 rounded-full">
                                    <span class="text-[10px] text-slate-600 font-medium">{{ getUser(act.responsibleId)?.name }}</span>
                                  </div>
                                  <span class="text-[10px] text-slate-400">
                                     @if(act.status === 'REALIZADA') { Finalizado: {{act.actualEndDate}} }
                                     @else if(act.status === 'EN_PROGRESO') { En Curso desde: {{act.actualStartDate}} }
                                     @else { Vence: {{act.estimatedEndDate}} }
                                  </span>
                               </div>
                            </div>
                          </div>
                          <!-- Only show delete if user has permission AND activity is NOT done -->
                          @if (canEditActivity(act) && act.status !== 'REALIZADA') {
                            <button (click)="deleteActivity(act.id)" class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-2 transition-all">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          }
                       </div>
                     } @empty {
                       <div class="text-center py-10">
                          <div class="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                             <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          </div>
                          <p class="text-slate-500 font-medium">No hay tareas pendientes</p>
                          <p class="text-sm text-slate-400">Comienza agregando una nueva actividad</p>
                       </div>
                     }
                   </div>
                 </div>
              </div>
            </div>

            <!-- Right Column: Info & Team -->
            <div class="space-y-6">
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                 <h3 class="font-bold text-slate-800 text-lg mb-4 border-b border-slate-50 pb-2">Detalles</h3>
                 <div class="space-y-4">
                   <div class="flex justify-between items-center">
                     <span class="text-sm text-slate-500 font-medium">Áreas Participantes</span>
                     <span class="text-sm font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-md">{{ p.areaConfig.length }}</span>
                   </div>
                   <div class="flex justify-between items-center">
                     <span class="text-sm text-slate-500 font-medium">Presupuesto</span>
                     <span class="text-sm font-bold text-slate-800">{{ p.currency === 'PEN' ? 'S/' : '$' }} {{ p.budget | number }}</span>
                   </div>
                   <div class="space-y-2 pt-2">
                     <div class="flex justify-between text-xs">
                       <span class="text-slate-400">Inicio Plan</span>
                       <span class="text-slate-600 font-medium">{{ p.startDate }}</span>
                     </div>
                     <div class="flex justify-between text-xs">
                       <span class="text-slate-400">Fin Plan</span>
                       <span class="text-slate-600 font-medium">{{ p.endDate }}</span>
                     </div>
                     <div class="h-px bg-slate-100 my-2"></div>
                     <div class="flex justify-between text-xs">
                       <span class="text-slate-400">Inicio Real</span>
                       <span class="font-bold" [class.text-blue-600]="p.actualStartDate" [class.text-slate-300]="!p.actualStartDate">{{ p.actualStartDate || '--' }}</span>
                     </div>
                      <div class="flex justify-between text-xs">
                       <span class="text-slate-400">Fin Real</span>
                       <span class="font-bold" [class.text-green-600]="p.actualEndDate" [class.text-slate-300]="!p.actualEndDate">{{ p.actualEndDate || '--' }}</span>
                     </div>
                   </div>
                 </div>
              </div>

              <!-- Lideres y Equipo -->
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                 <h3 class="font-bold text-slate-800 text-lg mb-4 border-b border-slate-50 pb-2">Liderazgo y Equipo</h3>
                 
                 <!-- Leaders Loop -->
                 <div class="space-y-4 mb-6">
                    @for(config of p.areaConfig; track config.areaId) {
                       <div class="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                         <img [src]="getUser(config.leaderId)?.avatar" class="h-10 w-10 rounded-full object-cover">
                         <div>
                            <p class="text-sm font-bold text-slate-800">{{ getUser(config.leaderId)?.name }}</p>
                            <p class="text-xs text-blue-600 font-medium">Líder {{ getAreaName(config.areaId) }}</p>
                         </div>
                       </div>
                    }
                 </div>

                 <!-- Team Members -->
                 <div>
                   <p class="text-xs font-bold text-slate-400 uppercase mb-2">Miembros ({{ p.teamIds.length }})</p>
                   <div class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                     @for (memberId of p.teamIds; track memberId) {
                       <div class="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <img [src]="getUser(memberId)?.avatar" class="h-8 w-8 rounded-full bg-slate-200">
                          <div>
                             <p class="text-sm font-medium text-slate-700">{{ getUser(memberId)?.name }}</p>
                             <p class="text-[10px] text-slate-400">{{ getUser(memberId)?.subRole }} - {{ getJoinedAreaNames(getUser(memberId)) }}</p>
                          </div>
                       </div>
                     } @empty {
                        <p class="text-xs text-slate-400 italic p-2">No hay miembros adicionales asignados.</p>
                     }
                   </div>
                 </div>
              </div>
            </div>
          </div>
        }

        @if (activeTab() === 'EXPENSES') {
           <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
             
             <!-- Expense Summary Cards -->
             <div class="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               <div class="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-600 flex justify-between items-center">
                 <div>
                   <p class="text-xs font-bold text-slate-400 uppercase">Presupuesto Inicial</p>
                   <p class="text-xl font-bold text-slate-800">{{ p.currency === 'PEN' ? 'S/' : '$' }} {{ p.budget | number:'1.2-2' }}</p>
                 </div>
                 <div class="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                   <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
               </div>

               <div class="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-600 flex justify-between items-center">
                 <div>
                   <p class="text-xs font-bold text-slate-400 uppercase">Gasto Acumulado (Est.)</p>
                   <p class="text-xl font-bold text-slate-800">{{ p.currency === 'PEN' ? 'S/' : '$' }} {{ totalSpent() | number:'1.2-2' }}</p>
                 </div>
                 <div class="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                 </div>
               </div>

               <div class="bg-white p-5 rounded-xl shadow-sm border-l-4 flex justify-between items-center"
                    [class.border-green-500]="remainingBudget() >= 0"
                    [class.border-red-500]="remainingBudget() < 0">
                 <div>
                   <p class="text-xs font-bold text-slate-400 uppercase">Presupuesto Restante</p>
                   <p class="text-xl font-bold" 
                      [class.text-green-600]="remainingBudget() >= 0"
                      [class.text-red-600]="remainingBudget() < 0">
                     {{ p.currency === 'PEN' ? 'S/' : '$' }} {{ remainingBudget() | number:'1.2-2' }}
                   </p>
                 </div>
                 <div class="h-10 w-10 rounded-full flex items-center justify-center"
                      [class.bg-green-50]="remainingBudget() >= 0"
                      [class.text-green-600]="remainingBudget() >= 0"
                      [class.bg-red-50]="remainingBudget() < 0"
                      [class.text-red-600]="remainingBudget() < 0">
                     @if(remainingBudget() >= 0) {
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     } @else {
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                     }
                 </div>
               </div>
             </div>
             
              <div class="lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-fit">
                  <h3 class="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Registrar Gasto</h3>
                  <div class="space-y-4">
                     <div>
                       <label class="block text-xs font-bold text-slate-500 mb-1">Descripción</label>
                       <input type="text" [(ngModel)]="newExpenseDesc" 
                              class="block w-full rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 text-sm font-medium outline-none"
                              placeholder="Ej. Pago Proveedor X">
                     </div>
                     <div>
                       <label class="block text-xs font-bold text-slate-500 mb-1">Monto y Moneda</label>
                       <div class="flex rounded-xl shadow-sm">
                         <select [(ngModel)]="newExpenseCurrency" class="rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs px-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                            <option value="PEN">S/</option>
                            <option value="USD">$</option>
                         </select>
                         <input type="number" [(ngModel)]="newExpenseAmount" 
                                class="flex-1 min-w-0 block w-full rounded-r-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 text-sm font-bold outline-none"
                                placeholder="0.00">
                       </div>
                     </div>
                     <div>
                       <label class="block text-xs font-bold text-slate-500 mb-1">Categoría</label>
                       <div class="relative">
                          <select [(ngModel)]="newExpenseCat" 
                                  class="block w-full appearance-none rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 text-sm font-medium outline-none">
                              <option value="MATERIALES">Materiales</option>
                              <option value="MANO_OBRA">Mano de Obra</option>
                              <option value="TRANSPORTE">Transporte</option>
                              <option value="OTROS">Otros</option>
                          </select>
                       </div>
                     </div>
                     <div>
                       <label class="block text-xs font-bold text-slate-500 mb-1">Fecha</label>
                       <input type="date" [(ngModel)]="newExpenseDate" 
                              class="block w-full rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 text-sm font-medium outline-none">
                     </div>
                     <button (click)="addExpense()" [disabled]="!newExpenseDesc() || !newExpenseAmount() || !newExpenseDate()" 
                             class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:shadow-none mt-2">
                        Guardar Gasto
                     </button>
                  </div>
               </div>

             <div class="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-slate-100">
                    <thead class="bg-slate-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                        <th class="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Monto</th>
                        <th class="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-slate-100">
                       @for (exp of expenses(); track exp.id) {
                         <tr class="hover:bg-slate-50 transition-colors">
                           <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{{ exp.description }}</td>
                           <td class="px-6 py-4 whitespace-nowrap text-xs">
                              <span class="px-2 py-1 rounded-full font-bold bg-slate-100 text-slate-600">{{ exp.category }}</span>
                           </td>
                           <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 text-right">
                              {{ exp.currency === 'PEN' ? 'S/' : '$' }} {{ exp.amount | number:'1.2-2' }}
                           </td>
                           @if (canManageActivities()) {
                             <td class="px-6 py-4 text-right">
                               <button (click)="deleteExpense(exp.id)" class="text-red-400 hover:text-red-600">
                                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                 </svg>
                               </button>
                             </td>
                           }
                         </tr>
                       }
                    </tbody>
                  </table>
                </div>
             </div>
           </div>
        }

        @if (activeTab() === 'FILES') {
           <div class="grid grid-cols-1 gap-6 animate-fade-in">
             <!-- Drag & Drop Zone -->
             @if (canManageFilesAndExpenses()) {
                <div class="border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/50 p-10 flex flex-col items-center justify-center text-center hover:bg-blue-50 transition-all cursor-pointer group"
                     (click)="fileInput.click()">
                   <div class="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                   </div>
                   <h4 class="text-lg font-bold text-slate-700">Arrastra archivos aquí o haz clic para subir</h4>
                   <p class="text-slate-500 text-sm mt-1">Soporta PDF, Imágenes y Excel (Simulado)</p>
                   <input #fileInput type="file" class="hidden" (change)="onFileSelected($event)">
                </div>
             }
             <!-- File Grid -->
             <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                @for (file of files(); track file.id) {
                  <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                     <!-- Icon based on type -->
                     <div class="h-12 w-12 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                          [class.bg-red-500]="file.type === 'PDF'"
                          [class.bg-blue-500]="file.type === 'IMG'"
                          [class.bg-green-600]="file.type === 'EXCEL'"
                          [class.bg-slate-500]="file.type === 'OTRO'">
                        {{ file.type }}
                     </div>
                     <div class="flex-1 min-w-0">
                        <h5 class="text-sm font-bold text-slate-800 truncate">{{ file.name }}</h5>
                        <p class="text-xs text-slate-500">Subido por {{ getUser(file.uploadedBy)?.name }}</p>
                        <p class="text-[10px] text-slate-400">{{ file.uploadDate }}</p>
                     </div>
                     <div class="flex flex-col gap-1">
                        <button class="text-slate-400 hover:text-blue-600 p-1" title="Descargar">
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4 4m4 4V4"></path></svg>
                        </button>
                        @if (canManageActivities()) {
                           <button (click)="deleteFile(file.id)" class="text-slate-400 hover:text-red-500 p-1" title="Eliminar">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                           </button>
                        }
                     </div>
                  </div>
                }
             </div>
           </div>
        }

        @if (activeTab() === 'PAYBACK') {
           <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
              <div class="xl:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div>
                      <p class="text-xs font-bold text-slate-400 uppercase tracking-wide">Inversión Total (CAPEX)</p>
                      <p class="text-2xl font-bold text-slate-800 mt-1">{{ p.currency === 'PEN' ? 'S/' : '$' }} {{ p.budget | number:'1.0-0' }}</p>
                    </div>
                 </div>
                 <div class="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div>
                      <p class="text-xs font-bold text-blue-500 uppercase tracking-wide">Ahorro Mensual (OPEX)</p>
                      <p class="text-2xl font-bold text-blue-700 mt-1">{{ p.currency === 'PEN' ? 'S/' : '$' }} {{ totalMonthlySavings() | number:'1.0-0' }}</p>
                    </div>
                 </div>
                 <div class="bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div>
                      <p class="text-xs font-bold text-green-600 uppercase tracking-wide">Ahorro Anual Est.</p>
                      <p class="text-2xl font-bold text-green-700 mt-1">{{ p.currency === 'PEN' ? 'S/' : '$' }} {{ roiAnnual() | number:'1.0-0' }}</p>
                    </div>
                 </div>
                 <div class="bg-slate-800 p-5 rounded-2xl shadow-lg shadow-slate-800/20 flex flex-col justify-between h-32 relative overflow-hidden text-white">
                    <div>
                      <p class="text-xs font-bold text-slate-400 uppercase tracking-wide">Payback (Retorno)</p>
                      <p class="text-2xl font-bold mt-1">
                        {{ paybackMonths() === Infinity ? '∞' : (paybackMonths() | number:'1.1-1') }} <span class="text-sm font-normal text-slate-400">Meses</span>
                      </p>
                    </div>
                 </div>
              </div>
              
               <div class="xl:col-span-2 space-y-6">
                 <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 class="font-bold text-slate-800 mb-4">Proyección</h3>
                    <div #paybackChart class="w-full h-[300px] bg-slate-50 rounded-xl relative overflow-hidden"></div>
                 </div>
               </div>

              <div class="xl:col-span-1">
                 <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky top-6">
                    <h3 class="font-bold text-slate-800 text-sm uppercase tracking-wide mb-4">Agregar Indicador</h3>
                     <div class="space-y-4">
                       <div>
                          <label class="block text-xs font-bold text-slate-500 mb-1">Nombre</label>
                          <input type="text" [(ngModel)]="newIndName" class="w-full rounded-xl border border-slate-200 p-2 text-sm outline-none text-slate-900">
                       </div>
                       <div>
                          <label class="block text-xs font-bold text-slate-500 mb-1">Categoría</label>
                          <select [(ngModel)]="newIndCategory" (change)="updateUnitLabel()" class="w-full rounded-xl border border-slate-200 p-2 text-sm outline-none text-slate-900">
                               <option value="HORAS_HOMBRE">Horas Hombre</option>
                               <option value="INSUMOS">Insumos</option>
                               <option value="RIESGOS">Riesgos</option>
                          </select>
                       </div>
                        <div class="grid grid-cols-2 gap-2">
                          <input type="number" [(ngModel)]="newIndCurrent" placeholder="Actual" class="w-full rounded-xl border border-slate-200 p-2 text-sm outline-none text-slate-900">
                          <input type="number" [(ngModel)]="newIndProjected" placeholder="Proy" class="w-full rounded-xl border border-slate-200 p-2 text-sm outline-none text-slate-900">
                       </div>
                        <div class="grid grid-cols-2 gap-2">
                          <input type="number" [(ngModel)]="newIndFreq" placeholder="Freq" class="w-full rounded-xl border border-slate-200 p-2 text-sm outline-none text-slate-900">
                          <input type="number" [(ngModel)]="newIndCost" placeholder="Costo Unit" class="w-full rounded-xl border border-slate-200 p-2 text-sm outline-none text-slate-900">
                       </div>
                       <button (click)="addIndicator()" class="w-full bg-slate-800 text-white font-bold py-2 rounded-xl">Agregar</button>
                    </div>
                 </div>
              </div>
           </div>
        }

        @if (activeTab() === 'CONVERSATIONS') {
            <div class="max-w-3xl mx-auto w-full animate-fade-in">
               <app-project-chat [projectId]="projectId()"></app-project-chat>
            </div>
         }

         @if (showEditForm()) {
           <app-project-form 
              [projectToEdit]="p"
              (cancel)="closeEditForm()"
              (save)="closeEditForm()">
           </app-project-form>
        }
      </div>
    }
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { transform: translateX(0); opacity: 1; }
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  `]
})
export class ProjectDetailComponent {
  projectId = input.required<number>();
  back = output<void>();
  goToManual = output<string>(); // New output for help

  dataService = inject(DataService);

  // D3 Chart Ref
  @ViewChild('paybackChart') paybackChart!: ElementRef;

  activeTab = signal<DetailTab>('BOARD');
  showEditForm = signal(false);

  // Local state for Adding Activity
  isAddingActivity = signal(false);
  newActivityDesc = signal('');
  newActivityStart = signal('');
  newActivityEnd = signal('');
  newActivityResp = signal<number>(0);

  // Local state for Adding Expense
  newExpenseDesc = signal('');
  newExpenseAmount = signal<number | null>(null);
  newExpenseCurrency = signal<Currency>('PEN');
  newExpenseCat = signal<ExpenseCategory>('OTROS');
  newExpenseDate = signal(new Date().toISOString().split('T')[0]);

  // Local State for Payback Indicators
  newIndName = signal('');
  newIndCategory = signal<IndicatorCategory>('HORAS_HOMBRE');
  newIndCurrent = signal<number | null>(null);
  newIndProjected = signal<number | null>(null);
  newIndFreq = signal<number>(1);
  newIndCost = signal<number | null>(null);
  newIndUnitLabel = signal('Horas');

  constructor() {
    effect(() => {
      const p = this.project();
      if (p) {
        this.newExpenseCurrency.set(p.currency);
      }
    });

    effect(() => {
      if (this.activeTab() === 'PAYBACK') {
        setTimeout(() => this.generatePaybackChart(), 100);
      }
    });
  }

  project = computed(() => {
    return this.dataService.getProjectById(this.projectId());
  });

  activities = computed(() => {
    return this.dataService.getActivitiesByProject(this.projectId());
  });

  expenses = computed(() => {
    return this.dataService.getExpensesByProject(this.projectId());
  });

  files = computed(() => {
    return this.dataService.getFilesByProject(this.projectId());
  });

  indicators = computed(() => {
    return this.dataService.getIndicatorsByProject(this.projectId());
  });

  totalSpent = computed(() => {
    const proj = this.project();
    if (!proj) return 0;

    return this.expenses().reduce((acc, curr) => {
      const RATE = 3.75;
      if (curr.currency === proj.currency) {
        return acc + curr.amount;
      } else if (proj.currency === 'PEN' && curr.currency === 'USD') {
        return acc + (curr.amount * RATE);
      } else if (proj.currency === 'USD' && curr.currency === 'PEN') {
        return acc + (curr.amount / RATE);
      }
      return acc + curr.amount;
    }, 0);
  });

  remainingBudget = computed(() => {
    const proj = this.project();
    if (!proj) return 0;
    return proj.budget - this.totalSpent();
  });

  // --- Payback Computed Logic ---
  totalMonthlySavings = computed(() => {
    return this.indicators().reduce((acc, ind) => acc + this.calculateMonthlySavings(ind), 0);
  });

  roiAnnual = computed(() => this.totalMonthlySavings() * 12);

  paybackMonths = computed(() => {
    const savings = this.totalMonthlySavings();
    const budget = this.project()?.budget || 0;
    if (savings <= 0) return Infinity;
    return budget / savings;
  });

  calculateMonthlySavings(ind: ImpactIndicator): number {
    const diff = Math.max(0, ind.currentValue - ind.projectedValue);
    return diff * ind.frequency * ind.unitCost;
  }

  // --- Logic for Permissions ---
  currentUser = this.dataService.currentUser;

  // Rule: Everyone involved can ADD activities if project is open
  canAddActivities = computed(() => {
    const project = this.project();
    return project && project.status !== 'FINALIZADO';
  });

  // Rule: General Management Rights (Delete, Finish Project, Edit Project)
  // Admins or ANY leader of the project can finish/delete high level items.
  canManageActivities = computed(() => {
    const user = this.currentUser();
    const project = this.project();
    if (!project || project.status === 'FINALIZADO') return false;

    if (user.role === 'ADMIN' || user.subRole === 'GERENTE' || user.subRole === 'JEFE') return true;

    // Am I a leader of any area in this project OR a team member?
    if (project.areaConfig.some(c => c.leaderId === user.id)) return true;
    if (project.teamIds.includes(user.id)) return true;

    return false;
  });

  // Rule: Assistants, Bosses, Managers in the project can UPLOAD/ADD
  canManageFilesAndExpenses = computed(() => {
    const project = this.project();
    if (!project || project.status === 'FINALIZADO') return false;
    const user = this.currentUser();

    if (user.role === 'ADMIN') return true;
    if (project.areaConfig.some(c => c.leaderId === user.id)) return true;
    if (project.teamIds.includes(user.id)) return true;
    return false;
  });

  isProjectReadyToFinish = computed(() => {
    const acts = this.activities();
    return acts.length > 0 && acts.every(a => a.status === 'REALIZADA');
  });

  // SECURITY: Can only edit activity if I am the responsible user OR the leader of the specific area of the responsible user
  canEditActivity(act: Activity): boolean {
    const project = this.project();
    if (!project || project.status === 'FINALIZADO') return false;

    const user = this.currentUser();
    if (user.role === 'ADMIN') return true;
    if (act.responsibleId === user.id) return true;

    const responsibleUser = this.dataService.getUserById(act.responsibleId);
    if (!responsibleUser) return false;

    // Is current user the leader of ANY area that the responsible user belongs to (within this project)?
    const involvesMyArea = project.areaConfig.some(c =>
      c.leaderId === user.id && (responsibleUser.areaIds || []).includes(c.areaId)
    );
    return involvesMyArea;
  }

  getJoinedAreaNames(user: User | undefined | null): string {
    if (!user) return 'N/A';
    const names = (user.areaIds || []).map(id => this.dataService.getAreaName(id));
    return names.join(', ') || 'N/A';
  }

  // --- Actions ---

  openEditForm() {
    this.showEditForm.set(true);
  }

  closeEditForm() {
    this.showEditForm.set(false);
  }

  startActivity(act: Activity) {
    if (this.canEditActivity(act)) {
      this.dataService.updateActivityStatus(act.id, 'EN_PROGRESO');
    }
  }

  completeActivity(act: Activity) {
    if (this.canEditActivity(act)) {
      this.dataService.updateActivityStatus(act.id, 'REALIZADA');
    }
  }

  addActivity() {
    if (this.newActivityDesc() && this.newActivityResp() && this.newActivityStart() && this.newActivityEnd()) {
      // Validate: End >= Start
      if (new Date(this.newActivityEnd()) < new Date(this.newActivityStart())) {
        alert('La fecha de fin planificada no puede ser anterior a la fecha de inicio.');
        return;
      }

      this.dataService.addActivity({
        projectId: this.projectId(),
        description: this.newActivityDesc(),
        responsibleId: +this.newActivityResp(),
        startDate: this.newActivityStart(),
        estimatedEndDate: this.newActivityEnd(),
      });
      this.newActivityDesc.set('');
      this.newActivityStart.set('');
      this.newActivityEnd.set('');
      this.newActivityResp.set(0);
      this.isAddingActivity.set(false);
    }
  }

  deleteActivity(id: number) {
    if (confirm('¿Eliminar actividad?')) {
      this.dataService.deleteActivity(id);
    }
  }

  // --- Expenses & Files Logic ---

  addExpense() {
    if (this.newExpenseDesc() && this.newExpenseAmount() && this.newExpenseDate()) {

      // Validation: Amount
      if (this.newExpenseAmount()! <= 0) {
        alert('El monto debe ser mayor a 0.');
        return;
      }

      // Validation: Future Date
      const today = new Date().toISOString().split('T')[0];
      if (this.newExpenseDate() > today) {
        alert('No se pueden registrar gastos con fecha futura.');
        return;
      }

      this.dataService.addExpense({
        projectId: this.projectId(),
        description: this.newExpenseDesc(),
        amount: +this.newExpenseAmount()!,
        category: this.newExpenseCat(),
        currency: this.newExpenseCurrency(),
        date: this.newExpenseDate(),
        userId: this.currentUser().id
      });
      this.newExpenseDesc.set('');
      this.newExpenseAmount.set(null);
      alert('Gasto registrado correctamente');
    }
  }

  deleteExpense(id: number) {
    if (confirm('¿Eliminar registro de gasto?')) {
      this.dataService.deleteExpense(id);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      let type: FileType = 'OTRO';
      if (file.type.includes('pdf')) type = 'PDF';
      else if (file.type.includes('image')) type = 'IMG';
      else if (file.type.includes('sheet') || file.type.includes('excel')) type = 'EXCEL';

      this.dataService.addFile({
        projectId: this.projectId(),
        name: file.name,
        type: type,
        url: '#', // Mock
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: this.currentUser().id
      });
      alert('Archivo subido con éxito');
    }
  }

  deleteFile(id: number) {
    if (confirm('¿Eliminar archivo?')) {
      this.dataService.deleteFile(id);
    }
  }

  // --- Payback Actions ---

  addIndicator() {
    if (this.newIndName() && this.newIndCurrent() !== null && this.newIndProjected() !== null) {
      this.dataService.addIndicator({
        projectId: this.projectId(),
        name: this.newIndName(),
        category: this.newIndCategory(),
        currentValue: +this.newIndCurrent()!,
        projectedValue: +this.newIndProjected()!,
        frequency: +this.newIndFreq(),
        unitCost: +this.newIndCost()!,
        unitLabel: this.newIndUnitLabel()
      });
      this.newIndName.set('');
      this.newIndCurrent.set(null);
      this.newIndProjected.set(null);
      this.newIndCost.set(null);

      setTimeout(() => this.generatePaybackChart(), 50);
    }
  }

  deleteIndicator(id: number) {
    this.dataService.deleteIndicator(id);
    setTimeout(() => this.generatePaybackChart(), 50);
  }

  updateUnitLabel() {
    const cat = this.newIndCategory();
    if (cat === 'HORAS_HOMBRE') this.newIndUnitLabel.set('Horas');
    else if (cat === 'INSUMOS') this.newIndUnitLabel.set('Unidades');
    else if (cat === 'RIESGOS') this.newIndUnitLabel.set('Eventos');
  }

  generatePaybackChart() {
    if (!this.paybackChart) return;
    const el = this.paybackChart.nativeElement;
    d3.select(el).selectAll('*').remove();

    const budget = this.project()?.budget || 0;
    const monthlySavings = this.totalMonthlySavings();

    if (budget === 0 || monthlySavings === 0) {
      d3.select(el).append('div').attr('class', 'flex h-full items-center justify-center text-slate-400 text-sm italic').text('Agrega indicadores y presupuesto para ver la proyección.');
      return;
    }

    const paybackMonth = budget / monthlySavings;
    const maxMonths = Math.max(12, Math.ceil(paybackMonth * 1.2));

    const margin = { top: 30, right: 30, bottom: 30, left: 60 };
    const width = el.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(el).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const dataPoints = [];
    for (let i = 0; i <= maxMonths; i++) {
      dataPoints.push({ month: i, netValue: (i * monthlySavings) - budget });
    }

    const x = d3.scaleLinear().domain([0, maxMonths]).range([0, width]);
    const yMin = -budget;
    const yMax = dataPoints[dataPoints.length - 1].netValue;
    const yDomainMax = Math.max(yMax * 1.1, budget * 0.2);

    const y = d3.scaleLinear().domain([yMin, yDomainMax]).range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `Mes ${d}`));

    svg.append('g').call(d3.axisLeft(y).ticks(5));

    svg.append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#64748b').attr('stroke-width', 1).attr('stroke-dasharray', '4,2');

    const line = d3.line<any>()
      .x(d => x(d.month))
      .y(d => y(d.netValue));

    svg.append('path')
      .datum(dataPoints)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('d', line);
  }

  finishProject() {
    if (!this.isProjectReadyToFinish()) {
      alert('No se puede finalizar el proyecto porque hay actividades pendientes.');
      return;
    }
    if (confirm('¿Estás seguro de finalizar este proyecto?')) {
      this.dataService.finalizeProject(this.projectId());
    }
  }

  getAreaName(id: number) {
    return this.dataService.getAllAreas().find(a => a.id === id)?.name || 'N/A';
  }

  getUser(id: number) {
    return this.dataService.getAllUsers().find(u => u.id === id);
  }
}
