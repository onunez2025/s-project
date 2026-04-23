

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
        <div class="bg-card rounded-lg p-5 border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div class="flex items-start gap-4">
             <button (click)="back.emit()" class="group mt-1 p-1.5 rounded-md hover:bg-muted transition-colors border border-border">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-muted-foreground group-hover:text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
               </svg>
             </button>
             <div>
               <div class="flex items-center gap-3">
                 <h1 class="text-xl font-bold tracking-tight text-foreground" [attr.title]="p.name">{{ p.name }}</h1>
                 <span class="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tighter border"
                    [class.bg-destructive/10]="p.status === 'EN_PROCESO'"
                    [class.text-destructive]="p.status === 'EN_PROCESO'"
                    [class.border-destructive/20]="p.status === 'EN_PROCESO'"
                    [class.bg-emerald-500/10]="p.status === 'FINALIZADO'"
                    [class.text-emerald-500]="p.status === 'FINALIZADO'"
                    [class.border-emerald-500/20]="p.status === 'FINALIZADO'"
                    [class.bg-muted]="p.status === 'PLANIFICACION'"
                    [class.text-muted-foreground]="p.status === 'PLANIFICACION'"
                    [class.border-border]="p.status === 'PLANIFICACION'">
                   {{ p.status.replace('_', ' ') }}
                 </span>
               </div>
               <p class="text-muted-foreground text-xs font-medium mt-0.5 max-w-2xl">{{ p.description }}</p>
             </div>
          </div>

          <!-- Header Actions -->
          <div class="flex items-center gap-3">
             @if (p.status === 'FINALIZADO') {
                <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20 font-bold text-[10px] tracking-wider">
                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                   Cerrado
                </div>
             }

             @if (canManageActivities()) {
                <button (click)="openEditForm()" class="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-md border border-input text-foreground hover:bg-muted transition-all shadow-sm">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                   </svg>
                   Editar
                </button>

                <button (click)="finishProject()" 
                        [disabled]="!isProjectReadyToFinish()"
                        class="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-md shadow-sm transition-all"
                        [class.bg-primary]="isProjectReadyToFinish()"
                        [class.text-primary-foreground]="isProjectReadyToFinish()"
                        [class.hover:bg-primary/90]="isProjectReadyToFinish()"
                        [class.bg-muted]="!isProjectReadyToFinish()"
                        [class.text-muted-foreground]="!isProjectReadyToFinish()"
                        [class.cursor-not-allowed]="!isProjectReadyToFinish()"
                        [title]="isProjectReadyToFinish() ? 'Finalizar Proyecto' : 'Completa todas las actividades para finalizar'">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Finalizar
                </button>
             }
          </div>
        </div>

        <!-- TABS Navigation -->
        <div class="flex items-center justify-between">
           <div class="bg-card rounded-md p-1 border border-border flex flex-wrap gap-1">
              <button (click)="activeTab.set('BOARD')" 
                      class="px-4 py-1.5 text-xs font-bold rounded-sm transition-all flex items-center gap-2"
                      [class.bg-primary]="activeTab() === 'BOARD'"
                      [class.text-primary-foreground]="activeTab() === 'BOARD'"
                      [class.text-muted-foreground]="activeTab() !== 'BOARD'"
                      [class.hover:bg-muted]="activeTab() !== 'BOARD'">
                Tablero
              </button>
              <button (click)="activeTab.set('EXPENSES')" 
                      class="px-4 py-1.5 text-xs font-bold rounded-sm transition-all flex items-center gap-2"
                      [class.bg-primary]="activeTab() === 'EXPENSES'"
                      [class.text-primary-foreground]="activeTab() === 'EXPENSES'"
                      [class.text-muted-foreground]="activeTab() !== 'EXPENSES'"
                      [class.hover:bg-muted]="activeTab() !== 'EXPENSES'">
                Gastos
              </button>
              <button (click)="activeTab.set('PAYBACK')" 
                      class="px-4 py-1.5 text-xs font-bold rounded-sm transition-all flex items-center gap-2"
                      [class.bg-primary]="activeTab() === 'PAYBACK'"
                      [class.text-primary-foreground]="activeTab() === 'PAYBACK'"
                      [class.text-muted-foreground]="activeTab() !== 'PAYBACK'"
                      [class.hover:bg-muted]="activeTab() !== 'PAYBACK'">
                Payback
              </button>
              <button (click)="activeTab.set('FILES')" 
                      class="px-4 py-1.5 text-xs font-bold rounded-sm transition-all flex items-center gap-2"
                      [class.bg-primary]="activeTab() === 'FILES'"
                      [class.text-primary-foreground]="activeTab() === 'FILES'"
                      [class.text-muted-foreground]="activeTab() !== 'FILES'"
                      [class.hover:bg-muted]="activeTab() !== 'FILES'">
                Archivos
              </button>
              <button (click)="activeTab.set('CONVERSATIONS')" 
                      class="px-4 py-1.5 text-xs font-bold rounded-sm transition-all flex items-center gap-2"
                      [class.bg-primary]="activeTab() === 'CONVERSATIONS'"
                      [class.text-primary-foreground]="activeTab() === 'CONVERSATIONS'"
                      [class.text-muted-foreground]="activeTab() !== 'CONVERSATIONS'"
                      [class.hover:bg-muted]="activeTab() !== 'CONVERSATIONS'">
                Chat
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
                <div class="bg-card p-4 rounded-lg shadow-sm border border-border">
                   <p class="text-[10px] font-bold text-muted-foreground tracking-wider">Actividades</p>
                   <p class="text-xl font-bold text-foreground">{{ activities().length }}</p>
                </div>
                 <div class="bg-card p-4 rounded-lg shadow-sm border border-border">
                   <p class="text-[10px] font-bold text-muted-foreground tracking-wider">Progreso</p>
                   <div class="flex items-center gap-2">
                     <p class="text-xl font-bold text-primary">{{ p.progress }}%</p>
                     <div class="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div class="h-full bg-primary rounded-full transition-all duration-500" [style.width.%]="p.progress"></div>
                     </div>
                   </div>
                </div>
                 <div class="bg-card p-4 rounded-lg shadow-sm border border-border">
                   <p class="text-[10px] font-bold text-muted-foreground tracking-wider">Líderes</p>
                   <div class="flex items-center gap-1 mt-1">
                      @for(c of p.areaConfig; track c.areaId) {
                         <img [src]="getUser(c.leaderId)?.avatar" class="h-6 w-6 rounded-full border border-background -ml-2 first:ml-0" [title]="getUser(c.leaderId)?.name">
                      }
                   </div>
                </div>
              </div>
              <!-- Tasks Card -->
              <div class="bg-card rounded-lg shadow-sm border border-border flex flex-col min-h-[400px] overflow-hidden">
                 <div class="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                   <h3 class="font-bold text-foreground text-sm tracking-tight">Mis Tareas</h3>
                   @if (canAddActivities()) {
                     <button (click)="isAddingActivity.set(!isAddingActivity())" class="text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-3 py-1 rounded-md transition-colors shadow-sm">
                       {{ isAddingActivity() ? 'Cancelar' : '+ Nueva Tarea' }}
                     </button>
                   }
                 </div>

                 <div class="p-4 flex-1">
                   @if (isAddingActivity()) {
                     <div class="bg-muted/50 p-4 rounded-md mb-4 border border-border shadow-sm animate-in fade-in slide-in-from-top-2">
                        <div class="mb-3">
                           <label class="block text-[10px] font-bold text-muted-foreground tracking-wider mb-1 ml-0.5">Descripción</label>
                           <input type="text" [(ngModel)]="newActivityDesc" placeholder="¿Qué hay que hacer?" class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium">
                        </div>
                        <div class="grid grid-cols-2 gap-3 mb-3">
                           <div>
                             <label class="block text-[10px] font-bold text-muted-foreground tracking-wider mb-1 ml-0.5">Inicio Plan</label>
                             <input type="date" [(ngModel)]="newActivityStart" class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium">
                           </div>
                           <div>
                             <label class="block text-[10px] font-bold text-muted-foreground tracking-wider mb-1 ml-0.5">Fin Plan</label>
                             <input type="date" [(ngModel)]="newActivityEnd" class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium">
                           </div>
                        </div>
                        <div class="mb-4">
                          <label class="block text-[10px] font-bold text-muted-foreground tracking-wider mb-1 ml-0.5">Responsable</label>
                          <select [(ngModel)]="newActivityResp" class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium">
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
                        <button (click)="addActivity()" [disabled]="!newActivityDesc() || !newActivityStart() || !newActivityEnd() || !newActivityResp()" class="w-full bg-primary text-primary-foreground font-bold py-2 rounded-md text-xs shadow-sm hover:bg-primary/90 transition-all tracking-wider">Guardar Tarea</button>
                     </div>
                   }

                   <div class="space-y-2">
                     @for (act of activities(); track act.id) {
                       <div class="group flex items-center justify-between p-3 rounded-md border border-border bg-card/50 transition-all duration-200 hover:border-primary/30 hover:bg-muted/30">
                          <div class="flex items-center gap-3 flex-1">
                            <div class="flex-shrink-0">
                               @if (act.status === 'PENDIENTE') {
                                 <button (click)="startActivity(act)" [disabled]="!canEditActivity(act)" 
                                    class="w-7 h-7 rounded-full border border-input text-muted-foreground flex items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Iniciar Tarea">
                                   <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                 </button>
                               } @else if (act.status === 'EN_PROCESO') {
                                 <button (click)="completeActivity(act)" [disabled]="!canEditActivity(act)"
                                    class="w-7 h-7 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all animate-pulse disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Terminar Tarea">
                                   <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                 </button>
                               } @else {
                                 <div class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                 </div>
                               }
                            </div>
                            <div class="flex flex-col">
                               <span class="text-xs font-bold text-foreground transition-all" 
                                 [class.line-through]="act.status === 'REALIZADA'" 
                                 [class.text-muted-foreground]="act.status === 'REALIZADA'">
                                 {{ act.description }}
                               </span>
                               <div class="flex items-center gap-2 mt-0.5">
                                  <div class="flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded-md">
                                    <img [src]="getUser(act.responsibleId)?.avatar" class="h-3 w-3 rounded-full">
                                    <span class="text-[9px] text-muted-foreground font-bold tracking-tighter">{{ getUser(act.responsibleId)?.name }}</span>
                                  </div>
                                  <span class="text-[9px] text-muted-foreground font-medium italic">
                                     @if(act.status === 'REALIZADA') { Finalizado: {{act.actualEndDate}} }
                                     @else if(act.status === 'EN_PROCESO') { En Curso desde: {{act.actualStartDate}} }
                                     @else { Vence: {{act.estimatedEndDate}} }
                                  </span>
                               </div>
                            </div>
                          </div>
                          <!-- Actions -->
                          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            @if (canEditActivity(act) && act.status !== 'REALIZADA') {
                              <button (click)="openEditModal(act)" class="text-muted-foreground hover:text-primary p-1.5 transition-all">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                              </button>
                              <button (click)="deleteActivity(act.id)" class="text-muted-foreground hover:text-destructive p-1.5 transition-all">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            }
                          </div>
                       </div>
                     } @empty {
                       <div class="text-center py-10">
                           <p class="text-muted-foreground text-xs font-bold tracking-widest">No hay tareas pendientes</p>
                       </div>
                     }
                   </div>
                 </div>
              </div>
            </div>

            <!-- Right Column: Info & Team -->
            <div class="space-y-6">
              <div class="bg-card rounded-lg p-5 shadow-sm border border-border">
                 <h3 class="font-bold text-foreground text-sm tracking-tight mb-4 border-b border-border pb-2">Detalles</h3>
                 <div class="space-y-4">
                   <div class="flex justify-between items-center">
                     <span class="text-xs text-muted-foreground font-medium">Áreas Participantes</span>
                     <span class="text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded-sm">{{ p.areaConfig.length }}</span>
                   </div>
                   <div class="flex justify-between items-center">
                     <span class="text-xs text-muted-foreground font-medium">Presupuesto</span>
                     <span class="text-xs font-bold text-foreground">{{ p.currency === 'PEN' ? 'S/' : '$' }} {{ p.budget | number }}</span>
                   </div>
                   <div class="space-y-2 pt-2">
                     <div class="flex justify-between text-[10px] font-bold tracking-tighter">
                       <span class="text-muted-foreground">Inicio Plan</span>
                       <span class="text-foreground">{{ p.startDate }}</span>
                     </div>
                     <div class="flex justify-between text-[10px] font-bold tracking-tighter">
                       <span class="text-muted-foreground">Fin Plan</span>
                       <span class="text-foreground">{{ p.endDate }}</span>
                     </div>
                     <div class="h-px bg-border my-2"></div>
                     <div class="flex justify-between text-[10px] font-bold tracking-tighter">
                       <span class="text-muted-foreground">Inicio Real</span>
                       <span class="font-bold" [class.text-primary]="p.actualStartDate" [class.text-muted-foreground/30]="!p.actualStartDate">{{ p.actualStartDate || '--' }}</span>
                     </div>
                      <div class="flex justify-between text-[10px] font-bold tracking-tighter">
                       <span class="text-muted-foreground">Fin Real</span>
                       <span class="font-bold" [class.text-emerald-500]="p.actualEndDate" [class.text-muted-foreground/30]="!p.actualEndDate">{{ p.actualEndDate || '--' }}</span>
                     </div>
                   </div>
                 </div>
              </div>

              <!-- Lideres y Equipo -->
              <div class="bg-card rounded-lg p-5 shadow-sm border border-border">
                 <h3 class="font-bold text-foreground text-sm tracking-tight mb-4 border-b border-border pb-2">Equipo</h3>
                 
                 <!-- Leaders Loop -->
                 <div class="space-y-3 mb-6">
                    @for(config of p.areaConfig; track config.areaId) {
                       <div class="flex items-center gap-3 p-2 rounded-md bg-muted/30 border border-border">
                         <img [src]="getUser(config.leaderId)?.avatar" class="h-8 w-8 rounded-full object-cover">
                         <div>
                            <p class="text-[11px] font-bold text-foreground leading-none">{{ getUser(config.leaderId)?.name }}</p>
                            <p class="text-[9px] text-primary font-bold tracking-tighter mt-1">Líder {{ getAreaName(config.areaId) }}</p>
                         </div>
                       </div>
                    }
                 </div>

                 <!-- Team Members -->
                 <div>
                   <p class="text-[10px] font-bold text-muted-foreground tracking-widest mb-2 px-1">Miembros ({{ p.teamIds.length }})</p>
                   <div class="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                     @for (memberId of p.teamIds; track memberId) {
                       <div class="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
                          <img [src]="getUser(memberId)?.avatar" class="h-6 w-6 rounded-full bg-muted">
                          <div>
                             <p class="text-[11px] font-bold text-foreground leading-none">{{ getUser(memberId)?.name }}</p>
                             <p class="text-[9px] text-muted-foreground font-medium mt-1">{{ getUser(memberId)?.subRole }} - {{ getJoinedAreaNames(getUser(memberId)) }}</p>
                          </div>
                       </div>
                     } @empty {
                        <p class="text-[10px] text-muted-foreground italic p-2">Sin miembros adicionales.</p>
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
               <div class="bg-card p-5 rounded-lg shadow-sm border-l-4 border-primary flex justify-between items-center border-t border-r border-b border-border">
                 <div>
                   <p class="text-[10px] font-bold text-muted-foreground tracking-wider">Presupuesto Inicial</p>
                   <p class="text-xl font-bold text-foreground">{{ p.currency === 'PEN' ? 'S/' : '$' }} {{ p.budget | number:'1.2-2' }}</p>
                 </div>
                 <div class="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                   <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
               </div>

               <div class="bg-card p-5 rounded-lg shadow-sm border-l-4 border-purple-500 flex justify-between items-center border-t border-r border-b border-border">
                 <div>
                   <p class="text-[10px] font-bold text-muted-foreground tracking-wider">Gasto Acumulado (Est.)</p>
                   <p class="text-xl font-bold text-foreground">{{ p.currency === 'PEN' ? 'S/' : '$' }} {{ totalSpent() | number:'1.2-2' }}</p>
                 </div>
                 <div class="h-10 w-10 bg-purple-50/10 rounded-full flex items-center justify-center text-purple-500">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                 </div>
               </div>

               <div class="bg-card p-5 rounded-lg shadow-sm border-l-4 flex justify-between items-center border-t border-r border-b border-border"
                    [class.border-emerald-500]="remainingBudget() >= 0"
                    [class.border-destructive]="remainingBudget() < 0">
                 <div>
                   <p class="text-[10px] font-bold text-muted-foreground tracking-wider">Presupuesto Restante</p>
                   <p class="text-xl font-bold" 
                      [class.text-emerald-600]="remainingBudget() >= 0"
                      [class.text-destructive]="remainingBudget() < 0">
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
                  <h3 class="font-bold text-slate-800 mb-4 text-sm tracking-wide">Registrar Gasto</h3>
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
                             class="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-md hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50 mt-2 text-xs tracking-widest">
                        Guardar Gasto
                     </button>
                  </div>
               </div>

             <div class="lg:col-span-3 bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-border">
                    <thead class="bg-muted/50">
                      <tr>
                        <th class="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground tracking-widest">Descripción</th>
                        <th class="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground tracking-widest">Categoría</th>
                        <th class="px-6 py-3 text-right text-[10px] font-bold text-muted-foreground tracking-widest">Monto</th>
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
                <div class="border border-dashed border-primary/30 rounded-lg bg-primary/5 p-8 flex flex-col items-center justify-center text-center hover:bg-primary/10 transition-all cursor-pointer group"
                     (click)="fileInput.click()">
                   <div class="h-12 w-12 bg-card rounded-md border border-border flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      @if (isUploading()) {
                         <svg class="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                           <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                           <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                      } @else {
                         <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      }
                   </div>
                   <h4 class="text-sm font-bold text-foreground">
                     {{ isUploading() ? 'Subiendo archivo...' : 'Sube archivos importantes aquí' }}
                   </h4>
                   <p class="text-muted-foreground text-[10px] mt-1 font-medium italic">Soporta PDF, Imágenes y Excel</p>
                   <input #fileInput type="file" class="hidden" (change)="onFileSelected($event)">
                </div>
             }
             <!-- File Grid -->
             <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                @for (file of files(); track file.id) {
                   <div class="bg-card p-3 rounded-lg border border-border shadow-sm hover:border-primary/30 transition-all flex items-center gap-3">
                      <!-- Icon based on type -->
                      <div class="h-10 w-10 flex-shrink-0 rounded-md flex items-center justify-center font-black text-white text-[10px]"
                           [class.bg-red-500]="file.type === 'PDF'"
                           [class.bg-blue-500]="file.type === 'IMG'"
                           [class.bg-emerald-600]="file.type === 'EXCEL'"
                           [class.bg-muted-foreground]="file.type === 'OTRO'">
                         {{ file.type }}
                      </div>
                      <div class="flex-1 min-w-0">
                         <h5 class="text-xs font-bold text-foreground truncate">{{ file.name }}</h5>
                         <p class="text-[9px] text-muted-foreground font-medium truncate">Por {{ getUser(file.uploadedBy)?.name }} • {{ file.uploadDate }}</p>
                      </div>
                      <div class="flex flex-col gap-1">
                         @if (file.url && file.url !== '#') {
                            <a [href]="file.url" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-primary p-1" title="Descargar">
                               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4 4m4 4V4"></path></svg>
                            </a>
                         } @else {
                            <button (click)="alertNoUrl()" class="text-muted-foreground/30 hover:text-destructive p-1 cursor-not-allowed" title="Archivo no disponible">
                               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </button>
                         }
                         @if (canManageActivities()) {
                            <button (click)="deleteFile(file.id)" class="text-muted-foreground hover:text-destructive p-1" title="Eliminar">
                               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                         }
                      </div>
                   </div>
                }
             </div>
           </div>
        }

        @if (activeTab() === 'PAYBACK') {
           <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in font-bold">
              <div class="xl:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 tracking-tighter">
                 <div class="bg-card p-5 rounded-lg shadow-sm border border-border flex flex-col justify-between h-28 relative overflow-hidden group">
                    <div>
                      <p class="text-[10px] text-muted-foreground tracking-widest">Inversión (Capex)</p>
                      <p class="text-xl font-black text-foreground mt-1">{{ p.currency === 'PEN' ? 'S/' : '$' }} {{ p.budget | number:'1.0-0' }}</p>
                    </div>
                 </div>
                 <div class="bg-card p-5 rounded-lg shadow-sm border border-primary/20 flex flex-col justify-between h-28 relative overflow-hidden group">
                    <div>
                      <p class="text-[10px] text-primary tracking-widest">Ahorro Mensual</p>
                      <p class="text-xl font-black text-primary mt-1">{{ p.currency === 'PEN' ? 'S/' : '$' }} {{ totalMonthlySavings() | number:'1.0-0' }}</p>
                    </div>
                 </div>
                 <div class="bg-card p-5 rounded-lg shadow-sm border border-emerald-500/20 flex flex-col justify-between h-28 relative overflow-hidden group">
                    <div>
                      <p class="text-[10px] text-emerald-500 tracking-widest">Ahorro Anual</p>
                      <p class="text-xl font-black text-emerald-500 mt-1">{{ p.currency === 'PEN' ? 'S/' : '$' }} {{ roiAnnual() | number:'1.0-0' }}</p>
                    </div>
                 </div>
                 <div class="bg-foreground p-5 rounded-lg shadow-sm flex flex-col justify-between h-28 relative overflow-hidden text-background">
                    <div>
                      <p class="text-[10px] opacity-70 tracking-widest">Payback (Retorno)</p>
                      <p class="text-xl font-black mt-1">
                        {{ paybackMonths() === Infinity ? '∞' : (paybackMonths() | number:'1.1-1') }} <span class="text-xs font-medium opacity-50 ml-1">Meses</span>
                      </p>
                    </div>
                 </div>
              </div>
              
               <div class="xl:col-span-2 space-y-6">
                 <div class="bg-card rounded-lg shadow-sm border border-border p-6">
                    <h3 class="text-xs tracking-widest text-muted-foreground mb-6">Proyección de Retorno</h3>
                    <div #paybackChart class="w-full h-[300px] bg-muted/20 rounded-md relative overflow-hidden"></div>
                 </div>
               </div>

              <div class="xl:col-span-1">
                 <div class="bg-card rounded-lg shadow-sm border border-border p-5 sticky top-6">
                    <h3 class="font-bold text-foreground text-[10px] tracking-widest mb-6 px-1">Indicador de Impacto</h3>
                     <div class="space-y-4">
                       <div>
                          <label class="block text-[10px] font-bold text-muted-foreground tracking-wider mb-1.5 ml-0.5">Nombre</label>
                          <input type="text" [(ngModel)]="newIndName" class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium">
                       </div>
                       <div>
                          <label class="block text-[10px] font-bold text-muted-foreground tracking-wider mb-1.5 ml-0.5">Categoría</label>
                          <select [(ngModel)]="newIndCategory" (change)="updateUnitLabel()" class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium">
                               <option value="HORAS_HOMBRE">Horas Hombre</option>
                               <option value="INSUMOS">Insumos</option>
                               <option value="RIESGOS">Riesgos</option>
                          </select>
                       </div>
                        <div class="grid grid-cols-2 gap-3 tracking-tighter">
                          <div>
                             <label class="block text-[9px] font-bold text-muted-foreground mb-1 ml-0.5">Actual</label>
                             <input type="number" [(ngModel)]="newIndCurrent" class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary outline-none font-bold">
                          </div>
                          <div>
                             <label class="block text-[9px] font-bold text-muted-foreground mb-1 ml-0.5">Proyectado</label>
                             <input type="number" [(ngModel)]="newIndProjected" class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary outline-none font-bold">
                          </div>
                       </div>
                        <div class="grid grid-cols-2 gap-3 tracking-tighter">
                          <div>
                             <label class="block text-[9px] font-bold text-muted-foreground mb-1 ml-0.5">Frecuencia</label>
                             <input type="number" [(ngModel)]="newIndFreq" class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary outline-none font-bold">
                          </div>
                          <div>
                             <label class="block text-[9px] font-bold text-muted-foreground mb-1 ml-0.5">Costo Unit.</label>
                             <input type="number" [(ngModel)]="newIndCost" class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary outline-none font-bold">
                          </div>
                       </div>
                       <button (click)="addIndicator()" class="w-full bg-primary text-primary-foreground font-black py-2.5 rounded-md text-xs tracking-widest shadow-sm hover:bg-primary/90 transition-all mt-4">Registrar</button>
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

         @if (isEditingActivity()) {
             <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
                <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
                   <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                       Editar Tarea
                   </h3>
                   
                   <div class="space-y-4">
                       <div>
                         <label class="block text-xs font-bold text-slate-500 mb-1">Descripción</label>
                         <input type="text" [(ngModel)]="editActivityDesc" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900">
                       </div>
                       
                       <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs font-bold text-slate-500 mb-1">Inicio Plan</label>
                            <input type="date" [(ngModel)]="editActivityStart" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none text-slate-900">
                          </div>
                          <div>
                            <label class="block text-xs font-bold text-slate-500 mb-1">Fin Plan</label>
                            <input type="date" [(ngModel)]="editActivityEnd" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none text-slate-900">
                          </div>
                       </div>

                       <div>
                         <label class="block text-xs font-bold text-slate-500 mb-1">Responsable</label>
                         <select [(ngModel)]="editActivityResp" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none text-slate-900">
                            <!-- Show same options as create -->
                            @for(c of p.areaConfig; track c.areaId) {
                               <option [value]="c.leaderId">{{ getUser(c.leaderId)?.name }} (Líder {{ getAreaName(c.areaId) }})</option>
                            }
                            @for (memberId of p.teamIds; track memberId) {
                              <option [value]="memberId">{{ getUser(memberId)?.name }}</option>
                            }
                         </select>
                       </div>

                       <div class="flex items-center gap-3 pt-4">
                          <button (click)="closeEditModal()" class="flex-1 py-2 border border-border text-muted-foreground rounded-md text-[10px] font-black tracking-widest hover:bg-muted transition-all">Cancelar</button>
                          <button (click)="saveEditActivity()" [disabled]="!editActivityDesc() || !editActivityStart() || !editActivityEnd() || !editActivityResp()" class="flex-1 py-2 bg-primary text-primary-foreground rounded-md text-[10px] font-black tracking-widest shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50">Guardar</button>
                       </div>
                   </div>
                </div>
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
  isUploading = signal(false);

  // Local state for Adding Activity
  isAddingActivity = signal(false);
  newActivityDesc = signal('');
  newActivityStart = signal('');
  newActivityEnd = signal('');
  newActivityResp = signal<number>(0);

  // Local state for Editing Activity
  isEditingActivity = signal(false);
  editingActivityId = signal<number | null>(null);
  editActivityDesc = signal('');
  editActivityStart = signal('');
  editActivityEnd = signal('');
  editActivityResp = signal<number>(0);

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

  alertNoUrl() {
    alert('Este archivo es de prueba (Mock) y no tiene un enlace real de descarga en la base de datos.');
  }

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

  // SECURITY: Can only edit activity if I am the responsible user OR the leader of the specific area of the responsible user, OR Admin/Gerente/Jefe
  canEditActivity(act: Activity): boolean {
    const project = this.project();
    if (!project || project.status === 'FINALIZADO') return false;

    const user = this.currentUser();
    if (user.role === 'ADMIN' || user.subRole === 'GERENTE' || user.subRole === 'JEFE') return true;
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

  openEditModal(act: Activity) {
    this.editingActivityId.set(act.id);
    this.editActivityDesc.set(act.description);
    this.editActivityStart.set(act.startDate);
    this.editActivityEnd.set(act.estimatedEndDate);
    this.editActivityResp.set(act.responsibleId);
    this.isEditingActivity.set(true);
  }

  closeEditModal() {
    this.isEditingActivity.set(false);
    this.editingActivityId.set(null);
  }

  saveEditActivity() {
    const id = this.editingActivityId();
    if (id !== null && this.editActivityDesc() && this.editActivityResp() && this.editActivityStart() && this.editActivityEnd()) {
      if (new Date(this.editActivityEnd()) < new Date(this.editActivityStart())) {
        alert('La fecha de fin planificada no puede ser anterior a la fecha de inicio.');
        return;
      }
      this.dataService.updateActivity({
        id,
        description: this.editActivityDesc(),
        responsibleId: +this.editActivityResp(),
        startDate: this.editActivityStart(),
        estimatedEndDate: this.editActivityEnd(),
      });
      this.closeEditModal();
    }
  }

  startActivity(act: Activity) {
    if (this.canEditActivity(act)) {
      this.dataService.updateActivityStatus(act.id, 'EN_PROCESO');
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

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading.set(true);
      try {
        let type: FileType = 'OTRO';
        if (file.type.includes('pdf')) type = 'PDF';
        else if (file.type.includes('image')) type = 'IMG';
        else if (file.type.includes('sheet') || file.type.includes('excel')) type = 'EXCEL';

        const publicUrl = await this.dataService.uploadFileToStorage(file, this.projectId());

        if (publicUrl) {
          await this.dataService.addFile({
            projectId: this.projectId(),
            name: file.name,
            type: type,
            url: publicUrl,
            uploadDate: new Date().toISOString().split('T')[0],
            uploadedBy: this.currentUser().id
          });
          alert('Archivo subido con éxito');
        } else {
          alert('Hubo un error al subir el archivo al servidor.');
        }
      } catch (err) {
        console.error('Error uploading file:', err);
        alert('Hubo un error inesperado al subir el archivo.');
      } finally {
        this.isUploading.set(false);
        // Reset the file input so the same file could be uploaded again if needed
        event.target.value = '';
      }
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
