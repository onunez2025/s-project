
import { Component, inject, signal, computed, output, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule, FormArray, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { DataService, User, Area, Project, Currency, AreaLeaderConfig } from '../../services/data.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
      <div class="w-full max-w-2xl bg-white h-full shadow-2xl p-8 overflow-y-auto animate-slide-in flex flex-col">
        
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
           <div>
             <h3 class="text-2xl font-bold text-slate-800">
               {{ projectToEdit() ? 'Editar Proyecto' : 'Nuevo Proyecto' }}
             </h3>
             <p class="text-slate-500 text-sm mt-1">Configuración Multi-Área y Equipo</p>
           </div>
           <button (click)="cancel.emit()" class="h-10 w-10 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6 flex-1">
          
          <!-- Basic Info -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nombre del Proyecto</label>
            <input type="text" formControlName="name" placeholder="Ej. Implementación SAP"
              class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 font-medium">
            @if (form.get('name')?.touched && form.get('name')?.invalid) {
              <p class="mt-1 text-xs text-red-500 font-medium">El nombre es requerido.</p>
            }
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Descripción</label>
            <textarea formControlName="description" rows="2" class="block w-full rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 resize-none"></textarea>
          </div>

          <!-- Budget Section -->
          <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-5">
            <h4 class="text-sm font-bold text-slate-800 flex items-center gap-2">
               <span class="w-1 h-4 bg-blue-500 rounded-full"></span>
               Presupuesto y Tiempos
            </h4>
            
            <div class="grid grid-cols-2 gap-4">
               <div class="col-span-2 sm:col-span-1">
                 <label class="block text-xs font-bold text-slate-500 mb-1">Presupuesto</label>
                 <div class="flex rounded-xl shadow-sm">
                   <span class="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-white text-slate-500 text-sm font-bold">
                     {{ form.get('currency')?.value === 'PEN' ? 'S/' : '$' }}
                   </span>
                   <input type="number" formControlName="budget" class="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500 border text-slate-900 font-bold bg-white">
                 </div>
                 @if(form.get('budget')?.touched && form.get('budget')?.invalid) {
                    <p class="text-[10px] text-red-500 mt-1">Debe ser mayor a 0</p>
                 }
               </div>
               
               <div class="col-span-2 sm:col-span-1">
                  <label class="block text-xs font-bold text-slate-500 mb-1">Moneda</label>
                  <div class="flex bg-white rounded-xl border border-slate-200 p-1">
                    <label class="flex-1 text-center cursor-pointer">
                      <input type="radio" formControlName="currency" value="PEN" class="hidden peer">
                      <span class="block py-1.5 text-xs font-bold text-slate-500 rounded-lg peer-checked:bg-blue-100 peer-checked:text-blue-700 transition-all">Soles</span>
                    </label>
                    <label class="flex-1 text-center cursor-pointer">
                      <input type="radio" formControlName="currency" value="USD" class="hidden peer">
                      <span class="block py-1.5 text-xs font-bold text-slate-500 rounded-lg peer-checked:bg-blue-100 peer-checked:text-blue-700 transition-all">Dólares</span>
                    </label>
                  </div>
               </div>

               <div>
                 <label class="block text-xs font-bold text-slate-500 mb-1">Inicio</label>
                 <input type="date" formControlName="startDate" class="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white text-slate-900 font-medium text-sm">
               </div>
               <div>
                 <label class="block text-xs font-bold text-slate-500 mb-1">Fin</label>
                 <input type="date" formControlName="endDate" class="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white text-slate-900 font-medium text-sm">
               </div>
               @if(form.errors?.['dateRange']) {
                  <p class="col-span-2 text-center text-xs text-red-500 font-bold bg-red-50 p-1 rounded">
                     La fecha de fin debe ser posterior a la de inicio.
                  </p>
               }
            </div>
          </div>

          <!-- Multi-Area Configuration -->
          <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-5">
             <h4 class="text-sm font-bold text-slate-800 flex items-center gap-2">
               <span class="w-1 h-4 bg-purple-500 rounded-full"></span>
               Áreas y Líderes
            </h4>
            
            <div>
               <label class="block text-xs font-bold text-slate-500 mb-3">Selecciona Áreas Participantes</label>
               <div class="flex flex-wrap gap-2">
                 @for (area of allAreas(); track area.id) {
                    <button type="button" 
                       (click)="toggleArea(area.id)"
                       class="px-3 py-1.5 rounded-lg border text-sm font-medium transition-all"
                       [class.bg-purple-50]="isAreaSelected(area.id)"
                       [class.border-purple-200]="isAreaSelected(area.id)"
                       [class.text-purple-700]="isAreaSelected(area.id)"
                       [class.bg-white]="!isAreaSelected(area.id)"
                       [class.border-slate-200]="!isAreaSelected(area.id)"
                       [class.text-slate-600]="!isAreaSelected(area.id)">
                       {{ area.name }}
                    </button>
                 }
               </div>
            </div>

            <!-- Dynamic Leader Selectors per Selected Area -->
             @if (selectedAreaIds().length > 0) {
               <div class="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  @for (areaId of selectedAreaIds(); track areaId) {
                     <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1">Líder para {{ getAreaName(areaId) }}</label>
                        <select [value]="getLeaderForArea(areaId)" (change)="setLeaderForArea(areaId, $any($event.target).value)" 
                                class="block w-full rounded-lg border-slate-200 bg-white text-slate-900 text-sm p-2.5 focus:border-purple-500 outline-none">
                           <option [value]="0">Seleccionar Líder...</option>
                           @for (user of getPotentialLeaders(areaId); track user.id) {
                              <option [value]="user.id">{{ user.name }} ({{ user.subRole || 'ADMIN' }})</option>
                           }
                        </select>
                     </div>
                  }
               </div>
             } @else {
               <p class="text-xs text-red-400 italic">Debes seleccionar al menos un área.</p>
             }
          </div>

          <!-- Team Section (Grouped by Area) -->
          @if (selectedAreaIds().length > 0) {
            <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h4 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                 <span class="w-1 h-4 bg-green-500 rounded-full"></span>
                 Equipo de Trabajo
              </h4>
              
              <div class="max-h-60 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                 @for (areaId of selectedAreaIds(); track areaId) {
                    <div class="border-b border-slate-100 pb-3 last:border-0">
                       <h5 class="text-xs font-bold text-slate-500 uppercase mb-2">{{ getAreaName(areaId) }} - Miembros Disponibles</h5>
                       <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          @for (user of getAvailableTeamMembers(areaId); track user.id) {
                             <label class="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <input type="checkbox" [checked]="isTeamMemberSelected(user.id)" (change)="toggleTeamMember(user.id)"
                                       class="h-4 w-4 text-green-600 rounded focus:ring-green-500 border-slate-300">
                                <span class="text-sm text-slate-700">{{ user.name }}</span>
                             </label>
                          } @empty {
                             <p class="text-xs text-slate-400 italic">No hay miembros adicionales disponibles.</p>
                          }
                       </div>
                    </div>
                 }
              </div>
            </div>
          }

          <!-- Status Override (Only if Editing) -->
          @if (projectToEdit()) {
             <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <label class="block text-xs font-bold text-slate-500 mb-2">Estado Manual</label>
                <select formControlName="status" class="block w-full rounded-xl border-slate-200 bg-white p-2 text-slate-900 text-sm outline-none">
                   <option value="PLANIFICACION">Planificación</option>
                   <option value="EN_PROGRESO">En Progreso</option>
                   <option value="FINALIZADO">Finalizado</option>
                </select>
             </div>
          }

          <!-- Actions -->
          <div class="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-slate-100 pb-2">
             <button type="button" (click)="cancel.emit()" class="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">
               Cancelar
             </button>
             <button type="submit" [disabled]="form.invalid || !isValidConfig()" class="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/30">
               {{ projectToEdit() ? 'Guardar Cambios' : 'Crear Proyecto' }}
             </button>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  `]
})
export class ProjectFormComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);

  projectToEdit = input<Project | null>(null);

  cancel = output<void>();
  save = output<void>();

  currentUser = this.dataService.currentUser;
  allAreas = computed(() => this.dataService.getAllAreas());

  // Local State for Multi-Area Logic
  selectedAreaIds = signal<number[]>([]);
  // Map AreaId -> LeaderId
  areaLeaderMap = signal<Map<number, number>>(new Map());
  selectedTeamIds = signal<number[]>([]);

  dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const start = control.get('startDate');
    const end = control.get('endDate');
    return start && end && new Date(start.value) > new Date(end.value) ? { dateRange: true } : null;
  };

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    budget: [0, [Validators.required, Validators.min(1)]],
    currency: ['PEN' as Currency, Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    status: ['PLANIFICACION'],
    progress: [0]
  }, { validators: this.dateRangeValidator });

  constructor() {
    effect(() => {
      const proj = this.projectToEdit();
      if (proj) {
        // Populate Form
        this.form.patchValue({
          name: proj.name,
          description: proj.description,
          budget: proj.budget,
          currency: proj.currency,
          startDate: proj.startDate,
          endDate: proj.endDate,
          status: proj.status,
          progress: proj.progress
        });

        // Populate Areas & Leaders
        const areaIds = proj.areaConfig.map(c => c.areaId);
        this.selectedAreaIds.set(areaIds);

        const map = new Map<number, number>();
        proj.areaConfig.forEach(c => map.set(c.areaId, c.leaderId));
        this.areaLeaderMap.set(map);

        // Populate Team
        this.selectedTeamIds.set(proj.teamIds);

      } else {
        // Default: If creating new, auto-select current user's area and set them as leader (if applicable)
        const user = this.currentUser();
        this.form.reset({
          currency: 'PEN',
          status: 'PLANIFICACION',
          progress: 0
        });

        if (user.role === 'ADMIN') {
          // Admin starts empty
          this.selectedAreaIds.set([]);
          this.areaLeaderMap.set(new Map());
        } else {
          // Manager/Boss/Assistant starts with their area
          this.selectedAreaIds.set([user.areaId]);
          const map = new Map<number, number>();
          // If they can be leader, set them. Otherwise leave 0.
          map.set(user.areaId, user.id);
          this.areaLeaderMap.set(map);
        }
        this.selectedTeamIds.set([]);
      }
    });
  }

  // --- Logic for Areas ---
  isAreaSelected(id: number) { return this.selectedAreaIds().includes(id); }

  toggleArea(id: number) {
    this.selectedAreaIds.update(ids => {
      if (ids.includes(id)) {
        // Remove
        const newIds = ids.filter(x => x !== id);
        // Also remove leader choice
        const map = new Map(this.areaLeaderMap());
        map.delete(id);
        this.areaLeaderMap.set(map);
        return newIds;
      } else {
        // Add
        return [...ids, id];
      }
    });
  }

  getAreaName(id: number) { return this.allAreas().find(a => a.id === id)?.name || '...'; }

  // --- Logic for Leaders ---
  getPotentialLeaders(areaId: number) {
    // Return users in that area who are ADMIN, GERENTE or JEFE. 
    // Assistants usually don't lead projects, but let's allow Jefes/Gerentes mainly.
    // Allow Admins too (though they might have diff areaId).
    return this.dataService.getAllUsers().filter(u =>
      (u.areaIds.includes(areaId) && (u.subRole === 'GERENTE' || u.subRole === 'JEFE' || u.role === 'ADMIN')) ||
      (u.role === 'ADMIN') // Allow global admins
    );
  }

  getLeaderForArea(areaId: number): number {
    return this.areaLeaderMap().get(areaId) || 0;
  }

  setLeaderForArea(areaId: number, leaderIdStr: string) {
    const leaderId = +leaderIdStr;
    const map = new Map(this.areaLeaderMap());
    map.set(areaId, leaderId);
    this.areaLeaderMap.set(map);
  }

  // --- Logic for Team ---
  getAvailableTeamMembers(areaId: number) {
    const leaderId = this.getLeaderForArea(areaId);
    // Return users in that area NOT including the assigned leader
    return this.dataService.getAllUsers().filter(u => u.areaIds.includes(areaId) && u.id !== leaderId);
  }

  isTeamMemberSelected(uid: number) { return this.selectedTeamIds().includes(uid); }

  toggleTeamMember(uid: number) {
    this.selectedTeamIds.update(ids => {
      if (ids.includes(uid)) return ids.filter(x => x !== uid);
      return [...ids, uid];
    });
  }

  // --- Submit ---
  isValidConfig() {
    if (this.selectedAreaIds().length === 0) return false;
    // Validate all selected areas have a leader
    for (const areaId of this.selectedAreaIds()) {
      const leader = this.areaLeaderMap().get(areaId);
      if (!leader || leader === 0) return false;
    }
    return true;
  }

  onSubmit() {
    if (this.form.valid && this.isValidConfig()) {
      const formVal = this.form.value;

      // Check for Status Logic
      if (this.projectToEdit() && formVal.status === 'FINALIZADO') {
        if (this.dataService.hasPendingActivities(this.projectToEdit()!.id)) {
          alert('No puedes marcar el proyecto como Finalizado porque tiene actividades pendientes.');
          return;
        }
      }

      const areaConfig: AreaLeaderConfig[] = this.selectedAreaIds().map(aid => ({
        areaId: aid,
        leaderId: this.areaLeaderMap().get(aid)!
      }));

      const payload: any = {
        name: formVal.name!,
        description: formVal.description || '',
        areaConfig: areaConfig,
        budget: +formVal.budget!,
        currency: formVal.currency as 'PEN' | 'USD',
        startDate: formVal.startDate!,
        endDate: formVal.endDate!,
        teamIds: this.selectedTeamIds(),
        status: formVal.status as any,
        progress: +formVal.progress!
      };

      if (this.projectToEdit()) {
        this.dataService.updateProject({ ...payload, id: this.projectToEdit()!.id });
      } else {
        this.dataService.addProject(payload);
      }
      this.save.emit();
    }
  }
}
