
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
          <h2 class="text-3xl font-bold text-slate-800">Gestión de Personal</h2>
          <p class="text-slate-500 mt-1">Administración de usuarios, roles y jerarquías del sistema.</p>
        </div>
        
        <button (click)="openCreate()" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      <!-- Main Content Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-1 relative">
        
        <!-- Table List -->
        <div class="overflow-x-auto flex-1">
           <table class="min-w-full divide-y divide-slate-100">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Área</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rol / Nivel</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reporta A</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-100">
              @for (user of users(); track user.id) {
                <tr class="hover:bg-slate-50 transition-colors group">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-4">
                      <img [src]="user.avatar" class="h-10 w-10 rounded-full bg-slate-200 object-cover border border-slate-100">
                      <div>
                        <div class="text-sm font-bold text-slate-700">{{ user.name }}</div>
                        <div class="text-xs text-slate-400">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex flex-wrap gap-1">
                        @for (areaId of user.areaIds; track areaId) {
                           <span class="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                             {{ getAreaName(areaId) }}
                           </span>
                        }
                        @if (user.areaIds.length === 0) {
                           <span class="text-xs text-slate-300 italic">Sin área</span>
                        }
                      </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    @if (user.role === 'ADMIN') {
                       <span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-slate-800 text-white">
                         ADMIN
                       </span>
                    } @else {
                       <!-- Pastel Badges -->
                       <span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border"
                        [class.bg-purple-100]="user.subRole === 'GERENTE'"
                        [class.text-purple-700]="user.subRole === 'GERENTE'"
                        [class.border-purple-200]="user.subRole === 'GERENTE'"
                        [class.bg-orange-100]="user.subRole === 'JEFE'"
                        [class.text-orange-800]="user.subRole === 'JEFE'"
                        [class.border-orange-200]="user.subRole === 'JEFE'"
                        [class.bg-emerald-100]="user.subRole === 'ASISTENTE'"
                        [class.text-emerald-700]="user.subRole === 'ASISTENTE'"
                        [class.border-emerald-200]="user.subRole === 'ASISTENTE'">
                        {{ user.subRole }}
                       </span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    @if(user.reportsToId) {
                      <div class="flex items-center gap-2">
                         <div class="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {{ getUserName(user.reportsToId)?.charAt(0) }}
                         </div>
                         <span class="text-slate-600 font-medium">{{ getUserName(user.reportsToId) }}</span>
                      </div>
                    } @else {
                      <span class="text-slate-300 text-xs italic">N/A</span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <div class="flex items-center justify-end gap-2">
                        <button (click)="openEdit(user)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button (click)="deleteUser(user)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                     </div>
                  </td>
                </tr>
              }
            </tbody>
           </table>
        </div>

        <!-- Create User Modal / Slide-over -->
        @if (showForm()) {
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
            <div class="w-full max-w-md bg-white h-full shadow-2xl p-8 overflow-y-auto animate-slide-in flex flex-col">
              
              <div class="flex justify-between items-center mb-8">
                 <div>
                   <h3 class="text-2xl font-bold text-slate-800">
                      {{ editingUser() ? 'Editar Usuario' : 'Nuevo Usuario' }}
                   </h3>
                   <p class="text-sm text-slate-500 mt-1">Información de acceso y permisos.</p>
                 </div>
                 <button (click)="closeForm()" class="h-10 w-10 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
              </div>

              <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="flex-1 flex flex-col min-h-0">
                <div class="space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-6">
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nombre Completo</label>
                    <input type="text" formControlName="name" class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 font-medium outline-none">
                  </div>
                  
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Email Corporativo</label>
                    <input type="email" formControlName="email" class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 font-medium outline-none">
                  </div>
                  
                  @if (!editingUser()) {
                     <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Contraseña Inicial</label>
                        <input type="text" formControlName="password" class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 font-medium outline-none" placeholder="••••••••">
                     </div>
                  }

                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Rol del Sistema</label>
                    <select formControlName="role" class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 font-medium outline-none">
                      <option value="USUARIO">Usuario Regular</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>

                  <div class="p-5 bg-slate-50 rounded-2xl space-y-4 border border-slate-200">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide">Áreas Asignadas</label>
                    <div class="grid grid-cols-2 gap-2">
                      @for(area of areas(); track area.id) {
                        <label class="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-blue-400 transition-all select-none">
                          <input type="checkbox" 
                                 [checked]="isAreaSelected(area.id)"
                                 (change)="toggleArea(area.id)"
                                 class="w-5 h-5 rounded text-blue-600 border-slate-300 focus:ring-blue-500">
                          <span class="text-sm font-medium text-slate-700">{{ area.name }}</span>
                        </label>
                      }
                    </div>
                  </div>

                  @if (userForm.get('role')?.value === 'USUARIO') {
                    <div class="p-5 bg-blue-50/50 rounded-2xl space-y-5 border border-blue-100">
                      <div>
                        <label class="block text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">Nivel Jerárquico</label>
                        <select formControlName="subRole" class="block w-full rounded-xl border-blue-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 font-medium outline-none">
                          <option [value]="null">Seleccionar Nivel...</option>
                          <option value="GERENTE">Gerente</option>
                          <option value="JEFE">Jefe</option>
                          <option value="ASISTENTE">Asistente</option>
                        </select>
                      </div>

                      <div>
                        <label class="block text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">Supervisor (Reporta A)</label>
                        <select formControlName="reportsToId" class="block w-full rounded-xl border-blue-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 font-medium outline-none">
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

                <div class="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-auto">
                   <button type="button" (click)="closeForm()" class="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
                    <button type="submit" [disabled]="userForm.invalid || isLoading()" class="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center gap-2">
                       @if (isLoading()) {
                          <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
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
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slide-in { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
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

  // Convert form value changes to signals for reactivity in computed
  selectedRole = toSignal(this.userForm.controls.role.valueChanges, { initialValue: 'USUARIO' });
  selectedSubRole = toSignal(this.userForm.controls.subRole.valueChanges, { initialValue: null });
  selectedAreaIds = toSignal(this.userForm.controls.areaIds.valueChanges, { initialValue: [] as number[] });

  constructor() {
    // Reset subordinate fields if role changes to ADMIN
    this.userForm.get('role')?.valueChanges.subscribe(val => {
      if (val === 'ADMIN') {
        this.userForm.patchValue({ subRole: null, reportsToId: null, areaIds: [] });
      }
    });

    // Reset reportsTo if subrole changes
    this.userForm.get('subRole')?.valueChanges.subscribe(() => {
      if (this.userForm.dirty) this.userForm.patchValue({ reportsToId: null });
    });

    // For single area users (non-Managers), ensure only one area can be selected
    this.userForm.get('subRole')?.valueChanges.subscribe(val => {
      if (val !== 'GERENTE' && this.userForm.get('role')?.value !== 'ADMIN') {
        const current = this.userForm.get('areaIds')?.value || [];
        if (current.length > 1) {
          this.userForm.get('areaIds')?.setValue([current[0]]);
        }
      }
    });
  }

  // Logic: "Si el nivel es 'Jefe', el selector solo muestra 'Gerentes'. Si 'Asistente', muestra 'Jefes' y 'Gerentes'."
  // Also filtered by same Area.
  potentialSupervisors = computed(() => {
    const role = this.selectedRole();
    const subRole = this.selectedSubRole(); // The level of the new user
    const areaIds = this.selectedAreaIds();
    const currentUserId = this.editingUser()?.id; // Don't show self as boss

    if (role === 'ADMIN' || !subRole || areaIds.length === 0) return [];

    const allUsers = this.dataService.getAllUsers();

    // Filter supervisors who share AT LEAST ONE area with the selected areas of the new user
    const areaUsers = allUsers.filter(u =>
      u.areaIds.some(aid => areaIds.includes(aid)) && u.id !== currentUserId
    );

    if (subRole === 'GERENTE') {
      return [];
    }

    if (subRole === 'JEFE') {
      return areaUsers.filter(u => u.subRole === 'GERENTE');
    }

    if (subRole === 'ASISTENTE') {
      return areaUsers.filter(u => u.subRole === 'JEFE' || u.subRole === 'GERENTE');
    }

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
    this.userForm.controls.password.clearValidators(); // Password not required on edit
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
      // If not Gerente and not Admin, limit to one selection
      if (role !== 'ADMIN' && subRole !== 'GERENTE') {
        current.length = 0; // Clear
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

      // Check Uniqueness
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

        // Add password if creating new user
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
