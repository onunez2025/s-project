
import { Component, inject, signal, computed, output, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule, FormArray, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { DataService, User, Area, Project, Currency, AreaLeaderConfig } from '../../services/data.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-end">
      <div class="w-full max-w-xl bg-card h-full shadow-2xl p-6 overflow-y-auto animate-slide-in flex flex-col relative border-l border-border">
        
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
           <div>
             <h3 class="text-lg font-bold text-foreground uppercase tracking-widest">
               {{ projectToEdit() ? 'Editar Proyecto' : 'Nuevo Proyecto' }}
             </h3>
             <p class="text-muted-foreground text-[10px] font-bold uppercase tracking-tighter mt-1">Configuración Multi-Área y Equipo</p>
           </div>
           <button (click)="cancel.emit()" class="h-8 w-8 rounded-full bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5 flex-1">
          
          <!-- Basic Info -->
          <div class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-0.5">Nombre del Proyecto</label>
              <input type="text" formControlName="name" placeholder="Ej. Implementación SAP"
                class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium">
              @if (form.get('name')?.touched && form.get('name')?.invalid) {
                <p class="mt-1 text-[10px] text-destructive font-bold uppercase tracking-tighter">El nombre es requerido.</p>
              }
            </div>

            <div>
              <label class="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-0.5">Descripción</label>
              <textarea formControlName="description" rows="2" 
                class="w-full px-3 py-2 bg-input/50 border border-input rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium resize-none"></textarea>
            </div>
          </div>

          <!-- Budget Section -->
          <div class="p-4 bg-muted/30 rounded-lg border border-border space-y-4">
            <h4 class="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
               <span class="w-1 h-3 bg-primary rounded-full"></span>
               Presupuesto y Tiempos
            </h4>
            
            <div class="grid grid-cols-2 gap-4">
               <div class="col-span-2 sm:col-span-1">
                 <label class="block text-[10px] font-bold text-muted-foreground mb-1.5 ml-0.5 uppercase">Monto</label>
                 <div class="flex rounded-md shadow-sm">
                    <span class="inline-flex items-center px-2.5 bg-muted border border-input border-r-0 rounded-l-md text-[10px] font-black uppercase text-foreground">
                      {{ form.get('currency')?.value === 'PEN' ? 'S/' : '$' }}
                    </span>
                    <input type="number" formControlName="budget" 
                           class="flex-1 px-3 py-2 bg-background border border-input rounded-r-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-bold">
                 </div>
                 @if(form.get('budget')?.touched && form.get('budget')?.invalid) {
                    <p class="text-[10px] text-destructive mt-1 font-bold">Debe ser mayor a 0</p>
                 }
               </div>
               
               <div class="col-span-2 sm:col-span-1">
                  <label class="block text-[10px] font-bold text-muted-foreground mb-1.5 ml-0.5 uppercase">Moneda</label>
                  <div class="flex bg-background rounded-md border border-input p-1 h-[34px]">
                    <label class="flex-1 text-center cursor-pointer">
                      <input type="radio" formControlName="currency" value="PEN" class="hidden peer">
                      <span class="block py-1 text-[10px] font-black text-muted-foreground rounded-md peer-checked:bg-primary/10 peer-checked:text-primary transition-all uppercase">Soles</span>
                    </label>
                    <label class="flex-1 text-center cursor-pointer">
                      <input type="radio" formControlName="currency" value="USD" class="hidden peer">
                      <span class="block py-1 text-[10px] font-black text-muted-foreground rounded-md peer-checked:bg-primary/10 peer-checked:text-primary transition-all uppercase">Dólares</span>
                    </label>
                  </div>
               </div>

               <div>
                 <label class="block text-[10px] font-bold text-muted-foreground mb-1.5 ml-0.5 uppercase">Inicio</label>
                 <input type="date" formControlName="startDate" max="2050-12-31"
                        class="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium">
               </div>
               <div>
                 <label class="block text-[10px] font-bold text-muted-foreground mb-1.5 ml-0.5 uppercase">Fin</label>
                 <input type="date" formControlName="endDate" max="2050-12-31"
                        class="w-full px-3 py-1.5 bg-background border border-input rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium">
               </div>
               @if(form.errors?.['dateRange']) {
                  <p class="col-span-2 text-center text-[10px] text-destructive font-black bg-destructive/10 p-1.5 rounded uppercase tracking-tighter">
                     La fecha de fin debe ser posterior a la de inicio.
                  </p>
               }
               @if(form.errors?.['invalidYear']) {
                  <p class="col-span-2 text-center text-[10px] text-destructive font-black bg-destructive/10 p-1.5 rounded uppercase tracking-tighter">
                     El año máximo permitido es 2050.
                  </p>
               }
            </div>
          </div>

          <!-- Multi-Area Configuration -->
          <div class="p-4 bg-card rounded-lg border border-border shadow-sm space-y-4">
             <h4 class="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
               <span class="w-1 h-3 bg-purple-500 rounded-full"></span>
               Áreas y Líderes
            </h4>
            
            <div>
               <label class="block text-[10px] font-bold text-muted-foreground mb-2.5 uppercase tracking-wider">Participantes</label>
               <div class="flex flex-wrap gap-2">
                 @for (area of allAreas(); track area.id) {
                    <button type="button" 
                       (click)="toggleArea(area.id)"
                       class="px-2.5 py-1 rounded border text-[10px] font-black uppercase transition-all tracking-tighter"
                       [class.bg-purple-500/10]="isAreaSelected(area.id)"
                       [class.border-purple-500/30]="isAreaSelected(area.id)"
                       [class.text-purple-500]="isAreaSelected(area.id)"
                       [class.bg-muted]="!isAreaSelected(area.id)"
                       [class.border-border]="!isAreaSelected(area.id)"
                       [class.text-muted-foreground]="!isAreaSelected(area.id)">
                       {{ area.name }}
                    </button>
                 }
               </div>
            </div>

            <!-- Dynamic Leader Selectors per Selected Area -->
             @if (selectedAreaIds().length > 0) {
               <div class="space-y-2.5 bg-muted/30 p-3 rounded-md border border-border">
                  @for (areaId of selectedAreaIds(); track areaId) {
                     <div>
                        <label class="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-tighter">Líder para {{ getAreaName(areaId) }}</label>
                        <select [value]="getLeaderForArea(areaId)" (change)="setLeaderForArea(areaId, $any($event.target).value)" 
                                class="w-full px-3 py-2 bg-background border border-input rounded-md text-xs focus:ring-1 focus:ring-purple-500/50 outline-none font-bold">
                           <option [value]="0">Seleccionar Líder...</option>
                           @for (user of getPotentialLeaders(areaId); track user.id) {
                              <option [value]="user.id" [selected]="getLeaderForArea(areaId) === user.id">{{ user.name }} ({{ user.subRole || 'ADMIN' }})</option>
                           }
                        </select>
                     </div>
                  }
               </div>
             } @else {
               <p class="text-[10px] text-destructive font-bold uppercase tracking-widest italic">Debes seleccionar al menos un área.</p>
             }
          </div>

          <!-- Team Section (Grouped by Area) -->
          @if (selectedAreaIds().length > 0) {
            <div class="p-4 bg-card rounded-lg border border-border shadow-sm space-y-4">
              <h4 class="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                 <span class="w-1 h-3 bg-emerald-500 rounded-full"></span>
                 Equipo de Trabajo
              </h4>
              
              <div class="max-h-48 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                 @for (areaId of selectedAreaIds(); track areaId) {
                    <div class="border-b border-border/50 pb-2.5 last:border-0">
                       <h5 class="text-[10px] font-black text-muted-foreground uppercase mb-2 tracking-tighter">{{ getAreaName(areaId) }} - Miembros</h5>
                       <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          @for (user of getAvailableTeamMembers(areaId); track user.id) {
                             <label class="flex items-center space-x-3 p-1.5 rounded cursor-pointer hover:bg-muted transition-colors border border-transparent hover:border-border">
                                <input type="checkbox" [checked]="isTeamMemberSelected(user.id)" (change)="toggleTeamMember(user.id)"
                                       class="h-3.5 w-3.5 text-emerald-600 rounded focus:ring-emerald-500 border-input bg-background/50">
                                <span class="text-[11px] font-bold text-foreground/80 tracking-tighter">{{ user.name }}</span>
                             </label>
                          } @empty {
                             <p class="text-[10px] text-muted-foreground italic">No hay miembros adicionales.</p>
                          }
                       </div>
                    </div>
                 }
              </div>
            </div>
          }

          <!-- Status Override (Only if Editing) -->
          @if (projectToEdit()) {
             <div class="p-4 bg-muted/30 rounded-lg border border-border">
                <label class="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-widest">Estado Manual</label>
                <select formControlName="status" class="w-full px-3 py-2 bg-background border border-input rounded-md text-xs focus:ring-1 focus:ring-primary outline-none font-bold">
                   <option value="PLANIFICACION">Planificación</option>
                   <option value="EN_PROCESO">En Progreso</option>
                   <option value="FINALIZADO">Finalizado</option>
                </select>
             </div>
          }

          <!-- Actions -->
          <div class="mt-auto pt-4 flex justify-end gap-3 sticky bottom-0 bg-card border-t border-border -mx-6 px-6 pb-2">
             <button type="button" (click)="cancel.emit()" 
                     class="px-5 py-2 border border-border rounded-md text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all">
               Cancelar
             </button>
             <button type="submit" [disabled]="form.invalid || !isValidConfig()" 
                     class="px-5 py-2 bg-primary text-primary-foreground rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm">
               {{ projectToEdit() ? 'Guardar Cambios' : 'Crear Proyecto' }}
             </button>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 4px; }
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
    
    if (!start || !end || !start.value || !end.value) return null;
    
    const startDate = new Date(start.value);
    const endDate = new Date(end.value);

    if (startDate > endDate) {
      return { dateRange: true };
    }

    if (startDate.getFullYear() > 2050 || endDate.getFullYear() > 2050) {
      return { invalidYear: true };
    }

    return null;
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
