
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
          <p class="text-muted-foreground text-xs font-medium">Administración de usuarios, roles y jerarquías del sistema.</p>
        </div>
        
        <button (click)="openCreate()" class="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <thead class="bg-muted/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuario</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Área</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rol / Nivel</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Reporta A</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (user of users(); track user.id) {
                <tr class="hover:bg-accent/50 transition-colors group">
                  <td class="px-6 py-3 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <img [src]="user.avatar" class="h-9 w-9 rounded-full bg-muted object-cover border border-border">
                      <div>
                        <div class="text-sm font-medium">{{ user.name }}</div>
                        <div class="text-xs text-muted-foreground">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap">
                      <div class="flex flex-wrap gap-1">
                        @for (areaId of user.areaIds; track areaId) {
                           <span class="text-[10px] font-medium text-secondary-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">
                             {{ getAreaName(areaId) }}
                           </span>
                        }
                        @if (user.areaIds.length === 0) {
                           <span class="text-xs text-muted-foreground italic">Sin área</span>
                        }
                      </div>
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap">
                    @if (user.role === 'ADMIN') {
                       <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full bg-foreground text-background">
                         ADMIN
                       </span>
                    } @else {
                       <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full border"
                        [class.bg-purple-50]="user.subRole === 'GERENTE'"
                        [class.text-purple-700]="user.subRole === 'GERENTE'"
                        [class.border-purple-200]="user.subRole === 'GERENTE'"
                        [class.dark:bg-purple-900/20]="user.subRole === 'GERENTE'"
                        [class.dark:text-purple-400]="user.subRole === 'GERENTE'"
                        [class.dark:border-purple-800]="user.subRole === 'GERENTE'"
                        [class.bg-orange-50]="user.subRole === 'JEFE'"
                        [class.text-orange-800]="user.subRole === 'JEFE'"
                        [class.border-orange-200]="user.subRole === 'JEFE'"
                        [class.dark:bg-orange-900/20]="user.subRole === 'JEFE'"
                        [class.dark:text-orange-400]="user.subRole === 'JEFE'"
                        [class.dark:border-orange-800]="user.subRole === 'JEFE'"
                        [class.bg-emerald-50]="user.subRole === 'ASISTENTE'"
                        [class.text-emerald-700]="user.subRole === 'ASISTENTE'"
                        [class.border-emerald-200]="user.subRole === 'ASISTENTE'"
                        [class.dark:bg-emerald-900/20]="user.subRole === 'ASISTENTE'"
                        [class.dark:text-emerald-400]="user.subRole === 'ASISTENTE'"
                        [class.dark:border-emerald-800]="user.subRole === 'ASISTENTE'">
                        {{ user.subRole }}
                       </span>
                    }
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-sm">
                    @if(user.reportsToId) {
                      <div class="flex items-center gap-2">
                         <div class="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            {{ getUserName(user.reportsToId)?.charAt(0) }}
                         </div>
                         <span class="text-sm font-medium">{{ getUserName(user.reportsToId) }}</span>
                      </div>
                    } @else {
                      <span class="text-muted-foreground text-xs italic">N/A</span>
                    }
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                     <div class="flex items-center justify-end gap-1">
                        <button (click)="openEdit(user)" class="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors" title="Editar">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button (click)="deleteUser(user)" class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors" title="Eliminar">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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
          <div class="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-end">
            <div class="w-full max-w-md bg-card h-full shadow-lg border-l border-border p-6 overflow-y-auto animate-slide-in flex flex-col">
              
              <div class="flex justify-between items-center mb-6">
                 <div>
                   <h3 class="text-lg font-bold">
                      {{ editingUser() ? 'Editar Usuario' : 'Nuevo Usuario' }}
                   </h3>
                   <p class="text-sm text-muted-foreground mt-0.5">Información de acceso y permisos.</p>
                 </div>
                 <button (click)="closeForm()" class="h-8 w-8 rounded-md bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors">
                   <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                   </svg>
                 </button>
              </div>

              <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="flex-1 flex flex-col min-h-0">
                <div class="space-y-4 overflow-y-auto pr-1 pb-4">
                  <div>
                    <label class="block text-sm font-medium mb-1.5 ml-0.5">Nombre Completo</label>
                    <input type="text" formControlName="name" class="block w-full rounded-md bg-input/50 border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all px-3 py-2 text-sm outline-none">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-1.5 ml-0.5">Email Corporativo</label>
                    <input type="email" formControlName="email" class="block w-full rounded-md bg-input/50 border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all px-3 py-2 text-sm outline-none">
                  </div>
                  
                  @if (!editingUser()) {
                     <div>
                        <label class="block text-sm font-medium mb-1.5 ml-0.5">Contraseña Inicial</label>
                        <input type="text" formControlName="password" class="block w-full rounded-md bg-input/50 border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all px-3 py-2 text-sm outline-none" placeholder="••••••••">
                     </div>
                  }

                  <div>
                    <label class="block text-sm font-medium mb-1.5 ml-0.5">Rol del Sistema</label>
                    <select formControlName="role" class="block w-full rounded-md bg-input/50 border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all px-3 py-2 text-sm outline-none">
                      <option value="USUARIO">Usuario Regular</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>

                  <div class="p-4 bg-muted rounded-lg space-y-3 border border-border">
                    <label class="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Áreas Asignadas</label>
                    <div class="grid grid-cols-2 gap-2">
                      @for(area of areas(); track area.id) {
                        <label class="flex items-center gap-2 p-2 rounded-md bg-card border border-border cursor-pointer hover:border-primary transition-all select-none text-sm">
                          <input type="checkbox" 
                                 [checked]="isAreaSelected(area.id)"
                                 (change)="toggleArea(area.id)"
                                 class="w-4 h-4 rounded border-input text-primary focus:ring-primary">
                          <span class="font-medium">{{ area.name }}</span>
                        </label>
                      }
                    </div>
                  </div>

                  @if (userForm.get('role')?.value === 'USUARIO') {
                    <div class="p-4 bg-primary/5 rounded-lg space-y-3 border border-primary/20">
                      <div>
                        <label class="block text-xs font-medium text-primary uppercase tracking-wide mb-1.5">Nivel Jerárquico</label>
                        <select formControlName="subRole" class="block w-full rounded-md bg-card border border-primary/20 focus:ring-2 focus:ring-primary focus:border-primary transition-all px-3 py-2 text-sm outline-none">
                          <option [value]="null">Seleccionar Nivel...</option>
                          <option value="GERENTE">Gerente</option>
                          <option value="JEFE">Jefe</option>
                          <option value="ASISTENTE">Asistente</option>
                        </select>
                      </div>

                      <div>
                        <label class="block text-xs font-medium text-primary uppercase tracking-wide mb-1.5">Supervisor (Reporta A)</label>
                        <select formControlName="reportsToId" class="block w-full rounded-md bg-card border border-primary/20 focus:ring-2 focus:ring-primary focus:border-primary transition-all px-3 py-2 text-sm outline-none">
                          <option [value]="null">
                             {{ potentialSupervisors().length === 0 ? 'Sin superior (o no aplica)' : 'Seleccionar Supervisor...' }}
                          </option>
                          @for (boss of potentialSupervisors(); track boss.id) {
                            <option [value]="boss.id">{{ boss.name }} ({{ boss.subRole }})</option>
                          }
                        </select>
                      </div>
                    </div>
                  }
                </div>

                <div class="pt-4 flex justify-end gap-3 border-t border-border mt-auto">
                   <button type="button" (click)="closeForm()" class="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors">Cancelar</button>
                    <button type="submit" [disabled]="userForm.invalid || isLoading()" class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
                       @if (isLoading()) {
                          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                             <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                             <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                       } @else {
                          {{ editingUser() ? 'Guardar Cambios' : 'Crear Usuario' }}
                       }
                    </button>
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
