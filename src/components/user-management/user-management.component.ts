
import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService, User, Area, Role, SubRole } from '../../services/data.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="h-full flex flex-col space-y-6 animate-fade-in pb-10">
      
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight">Gestión de Personal</h2>
          <p class="text-muted-foreground text-[11px] font-bold uppercase tracking-wider">Administración de usuarios, roles y jerarquías del sistema.</p>
        </div>
        
        <button (click)="openCreate()" class="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2">
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nuevo Usuario
        </button>
      </div>

      <!-- Main Content Card -->
      <div class="bg-card rounded-lg shadow-sm border overflow-hidden flex flex-col flex-1 relative">
        
        <!-- Table List -->
        <div class="overflow-x-auto flex-1">
           <table class="min-w-full divide-y divide-border">
            <thead class="bg-muted/30">
              <tr>
                <th class="px-6 py-4 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">Usuario</th>
                <th class="px-6 py-4 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">Áreas</th>
                <th class="px-6 py-4 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">Nivel</th>
                <th class="px-6 py-4 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">Reporta A</th>
                <th class="px-6 py-4 text-right text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (user of users(); track user.id) {
                <tr class="hover:bg-accent/50 transition-colors group">
                  <td class="px-6 py-3 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="h-9 w-9 rounded-full bg-muted/50 border border-border overflow-hidden relative group-hover:scale-105 transition-transform">
                        <img [src]="user.avatar" class="h-full w-full object-cover">
                      </div>
                      <div class="flex flex-col">
                        <span class="text-[11px] font-black text-foreground uppercase tracking-tight">{{ user.name }}</span>
                        <span class="text-[10px] text-muted-foreground font-bold">{{ user.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap">
                      <div class="flex flex-wrap gap-1.5">
                        @for (areaId of user.areaIds; track areaId) {
                           <span class="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                             {{ getAreaName(areaId) }}
                           </span>
                        }
                        @if (user.areaIds.length === 0) {
                           <span class="text-[9px] font-bold text-muted-foreground uppercase italic tracking-tighter">Sin asignar</span>
                        }
                      </div>
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap">
                    @if (user.role === 'ADMIN') {
                       <span class="px-2 py-0.5 inline-flex text-[9px] font-black rounded-md bg-foreground text-background uppercase tracking-widest">
                         ADMIN
                       </span>
                    } @else {
                       <span class="px-2 py-0.5 inline-flex text-[9px] font-black rounded-md border uppercase tracking-widest"
                        [class.bg-purple-500/10]="user.subRole === 'GERENTE'"
                        [class.text-purple-600]="user.subRole === 'GERENTE'"
                        [class.border-purple-500/20]="user.subRole === 'GERENTE'"
                        [class.bg-orange-500/10]="user.subRole === 'JEFE'"
                        [class.text-orange-600]="user.subRole === 'JEFE'"
                        [class.border-orange-500/20]="user.subRole === 'JEFE'"
                        [class.bg-emerald-500/10]="user.subRole === 'ASISTENTE'"
                        [class.text-emerald-600]="user.subRole === 'ASISTENTE'"
                        [class.border-emerald-500/20]="user.subRole === 'ASISTENTE'">
                        {{ user.subRole }}
                       </span>
                    }
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap">
                    @if(user.reportsToId) {
                      <div class="flex items-center gap-2">
                         <div class="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                            {{ getUserName(user.reportsToId)?.charAt(0) }}
                         </div>
                         <span class="text-[10px] font-bold text-foreground uppercase tracking-tight">{{ getUserName(user.reportsToId) }}</span>
                      </div>
                    } @else {
                      <span class="text-muted-foreground text-[9px] font-bold uppercase tracking-tighter italic">N/A</span>
                    }
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-right">
                     <div class="flex items-center justify-end gap-1">
                        <button (click)="openEdit(user)" class="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-all active:scale-90" title="Editar">
                           <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button (click)="deleteUser(user)" class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-all active:scale-90" title="Eliminar">
                           <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                     </div>
                  </td>
                </tr>
              }
            </tbody>
           </table>
        </div>

        <!-- Create User Slide-over -->
        @if (showForm()) {
          <div class="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-50 flex justify-end">
            <div class="w-full max-w-sm bg-card/95 backdrop-blur-md h-full shadow-2xl border-l border-border p-6 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
              
              <div class="flex justify-between items-center mb-6">
                 <div>
                   <h3 class="text-sm font-black uppercase tracking-widest text-primary">
                      {{ editingUser() ? 'Editar Perfil' : 'Alta de Usuario' }}
                   </h3>
                   <p class="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mt-0.5">Configuración de acceso y jerarquías</p>
                 </div>
                 <button (click)="closeForm()" class="h-8 w-8 rounded-full bg-muted/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all active:scale-90">
                   <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                   </svg>
                 </button>
              </div>

              <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="flex-1 flex flex-col min-h-0">
                <div class="space-y-5 overflow-y-auto pr-1 pb-4">
                  <div>
                    <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-0.5">Nombre Completo</label>
                    <input type="text" formControlName="name" 
                           class="block w-full rounded-md bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 text-[11px] font-bold uppercase tracking-tight outline-none placeholder:text-muted-foreground/50"
                           placeholder="EJ. JUAN PÉREZ">
                  </div>
                  
                  <div>
                    <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-0.5">Email Corporativo</label>
                    <input type="email" formControlName="email" 
                           class="block w-full rounded-md bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 text-[11px] font-bold outline-none">
                  </div>
                  
                  @if (!editingUser()) {
                     <div>
                        <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-0.5">Contraseña Inicial</label>
                        <input type="text" formControlName="password" 
                               class="block w-full rounded-md bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 text-[11px] font-bold outline-none" 
                               placeholder="••••••••">
                     </div>
                  }

                  <div>
                    <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-0.5">Rol del Sistema</label>
                    <select formControlName="role" class="block w-full rounded-md bg-muted/30 border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3 py-2 text-[11px] font-bold uppercase tracking-tight outline-none">
                      <option value="USUARIO">Usuario Regular</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>

                  <div class="p-4 bg-muted/30 rounded-lg space-y-4 border border-border shadow-inner">
                    <label class="block text-[9px] font-black text-muted-foreground uppercase tracking-widest">Áreas de Operación</label>
                    <div class="grid grid-cols-1 gap-2">
                      @for(area of areas(); track area.id) {
                        <label class="flex items-center gap-3 p-2.5 rounded-md bg-card border border-border cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all select-none">
                          <input type="checkbox" 
                                 [checked]="isAreaSelected(area.id)"
                                 (change)="toggleArea(area.id)"
                                 class="w-3.5 h-3.5 rounded border-input text-primary focus:ring-primary">
                          <span class="text-[10px] font-black uppercase tracking-widest text-foreground/80">{{ area.name }}</span>
                        </label>
                      }
                    </div>
                  </div>

                  @if (userForm.get('role')?.value === 'USUARIO') {
                    <div class="p-4 bg-primary/5 rounded-lg space-y-4 border border-primary/10">
                      <div>
                        <label class="block text-[9px] font-black text-primary uppercase tracking-widest mb-1.5 ml-0.5">Nivel Jerárquico</label>
                        <select formControlName="subRole" class="block w-full rounded-md bg-card border border-primary/20 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none">
                          <option [value]="null">--- SELECCIONAR ---</option>
                          <option value="GERENTE">GERENTE</option>
                          <option value="JEFE">JEFE</option>
                          <option value="ASISTENTE">ASISTENTE</option>
                        </select>
                      </div>

                      <div>
                        <label class="block text-[9px] font-black text-primary uppercase tracking-widest mb-1.5 ml-0.5">Reporta A (Supervisor)</label>
                        <select formControlName="reportsToId" class="block w-full rounded-md bg-card border border-primary/20 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none">
                          <option [value]="null">
                             {{ potentialSupervisors().length === 0 ? 'SIN SUPERIOR' : '--- SELECCIONAR ---' }}
                          </option>
                          @for (boss of potentialSupervisors(); track boss.id) {
                            <option [value]="boss.id">{{ boss.name }} ({{ boss.subRole }})</option>
                          }
                        </select>
                      </div>
                    </div>
                  }
                </div>

                <div class="pt-5 flex flex-col gap-2 border-t border-border mt-auto">
                    <button type="submit" [disabled]="userForm.invalid || isLoading()" class="w-full h-10 bg-primary text-primary-foreground rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                       @if (isLoading()) {
                          <svg class="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                             <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                             <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                       } @else {
                          {{ editingUser() ? 'Actualizar Registro' : 'Confirmar Alta' }}
                       }
                    </button>
                    <button type="button" (click)="closeForm()" class="w-full h-9 border border-border rounded-md text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/50 transition-all">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: []
})
export class UserManagementComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);

  showForm = signal(false);
  editingUser = signal<User | null>(null);
  isLoading = signal(false);

  users = computed(() => this.dataService.getAllUsers());
  areas = computed(() => this.dataService.getAllAreas());

  userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['USUARIO' as Role, Validators.required],
    subRole: [null as SubRole],
    areaIds: [[] as number[]],
    reportsToId: [null as number | null]
  });

  selectedRole = toSignal(this.userForm.controls.role.valueChanges, { initialValue: 'USUARIO' });
  selectedSubRole = toSignal(this.userForm.controls.subRole.valueChanges, { initialValue: null });
  selectedAreaIds = toSignal(this.userForm.controls.areaIds.valueChanges, { initialValue: [] as number[] });

  constructor() {
    this.userForm.get('role')?.valueChanges.subscribe(val => {
      if (val === 'ADMIN') {
        this.userForm.patchValue({ subRole: null, reportsToId: null, areaIds: [] });
      }
    });

    this.userForm.get('subRole')?.valueChanges.subscribe(() => {
      if (this.userForm.dirty) this.userForm.patchValue({ reportsToId: null });
    });

    this.userForm.get('subRole')?.valueChanges.subscribe(val => {
      if (val !== 'GERENTE' && this.userForm.get('role')?.value !== 'ADMIN') {
        const current = this.userForm.get('areaIds')?.value || [];
        if (current.length > 1) {
          this.userForm.get('areaIds')?.setValue([current[0]]);
        }
      }
    });
  }

  potentialSupervisors = computed(() => {
    const role = this.selectedRole();
    const subRole = this.selectedSubRole();
    const areaIds = this.selectedAreaIds();
    const currentUserId = this.editingUser()?.id;

    if (role === 'ADMIN' || !subRole || areaIds.length === 0) return [];

    const allUsers = this.dataService.getAllUsers();
    const areaUsers = allUsers.filter(u =>
      u.areaIds.some(aid => areaIds.includes(aid)) && u.id !== currentUserId
    );

    if (subRole === 'GERENTE') return [];
    if (subRole === 'JEFE') return areaUsers.filter(u => u.subRole === 'GERENTE');
    if (subRole === 'ASISTENTE') return areaUsers.filter(u => u.subRole === 'JEFE' || u.subRole === 'GERENTE');
    return [];
  });

  getAreaName(id: number) {
    return this.areas().find(a => a.id === id)?.name || 'N/A';
  }

  getUserName(id: number | null) {
    if (!id) return null;
    return this.users().find(u => u.id === id)?.name;
  }

  openCreate() {
    this.editingUser.set(null);
    this.userForm.reset({ role: 'USUARIO', areaIds: [] });
    this.userForm.controls.password.setValidators([Validators.required, Validators.minLength(4)]);
    this.showForm.set(true);
  }

  openEdit(user: User) {
    this.editingUser.set(user);
    this.userForm.markAsPristine();
    this.userForm.controls.password.clearValidators();
    this.userForm.controls.password.updateValueAndValidity();

    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      subRole: user.subRole,
      areaIds: user.areaIds || [],
      reportsToId: user.reportsToId
    });
    this.showForm.set(true);
  }

  isAreaSelected(id: number): boolean {
    const current = this.userForm.get('areaIds')?.value || [];
    return current.includes(id);
  }

  toggleArea(id: number) {
    const role = this.userForm.get('role')?.value;
    const subRole = this.userForm.get('subRole')?.value;
    const current = [...(this.userForm.get('areaIds')?.value || [])];

    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      if (role !== 'ADMIN' && subRole !== 'GERENTE') {
        current.length = 0;
      }
      current.push(id);
    }

    this.userForm.get('areaIds')?.setValue(current);
    this.userForm.get('areaIds')?.markAsDirty();
  }

  closeForm() {
    this.showForm.set(false);
    this.editingUser.set(null);
  }

  async onSubmit() {
    if (this.userForm.valid) {
      this.isLoading.set(true);
      const val = this.userForm.value;

      if (this.dataService.isEmailTaken(val.email!, this.editingUser()?.id)) {
        alert('El correo electrónico ya está registrado por otro usuario.');
        this.isLoading.set(false);
        return;
      }

      try {
        const payload: any = {
          name: val.name!,
          email: val.email!,
          role: val.role as Role,
          subRole: val.subRole as SubRole,
          areaIds: val.areaIds as number[],
          reportsToId: val.reportsToId ? +val.reportsToId : null,
          avatar: this.editingUser() ? this.editingUser()!.avatar : `https://i.pravatar.cc/150?u=${Math.random()}`
        };

        if (!this.editingUser() && val.password) {
          payload.password = val.password;
        }

        if (this.editingUser()) {
          await this.dataService.updateUser({ ...payload, id: this.editingUser()!.id });
        } else {
          await this.dataService.addUser(payload);
        }

        this.closeForm();
      } catch (err: any) {
        console.error('Submit error:', err);
        alert('Hubo un error al guardar el usuario. Por favor intenta de nuevo.');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  deleteUser(user: User) {
    const check = this.dataService.canDeleteUser(user.id);
    if (!check.allowed) {
      alert(`No se puede eliminar al usuario: ${check.reason}`);
      return;
    }

    if (confirm(`¿Estás seguro de eliminar a ${user.name}? Esta acción no se puede deshacer.`)) {
      this.dataService.deleteUser(user.id);
    }
  }
}
