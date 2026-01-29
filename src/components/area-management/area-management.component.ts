
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { DataService, Area } from '../../services/data.service';

@Component({
  selector: 'app-area-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="h-full flex flex-col space-y-6 animate-fade-in pb-10">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-3xl font-bold text-slate-800">Configuración de Áreas</h2>
          <p class="text-slate-500 mt-1">Gestión de departamentos y unidades de negocio</p>
        </div>
        
        <button (click)="openCreate()" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Área
        </button>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-1 relative">
        <!-- List -->
        <div class="flex-1 overflow-auto">
          <table class="min-w-full divide-y divide-slate-100">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Área</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dotación</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-100">
              @for (area of areas(); track area.id) {
                <tr class="hover:bg-slate-50 transition-colors group">
                  <td class="px-6 py-4 whitespace-nowrap">
                     <span class="font-mono text-xs text-slate-400">#{{ area.id }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                     <div class="text-sm font-bold text-slate-800">{{ area.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {{ getEmployeeCount(area.id) }} miembros
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <div class="flex items-center justify-end gap-2">
                        <button (click)="openEdit(area)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button (click)="deleteArea(area.id)" 
                                [disabled]="getEmployeeCount(area.id) > 0"
                                class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed" 
                                title="Eliminar (Solo si no tiene empleados)">
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                     </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Form Slide-over -->
        @if (showForm()) {
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
            <div class="w-full max-w-md bg-white h-full shadow-2xl p-8 overflow-y-auto animate-slide-in flex flex-col">
              <div class="flex justify-between items-center mb-8">
                 <div>
                   <h3 class="text-2xl font-bold text-slate-800">
                     {{ editingArea() ? 'Editar Área' : 'Nueva Área' }}
                   </h3>
                   <p class="text-sm text-slate-500 mt-1">Información del departamento.</p>
                 </div>
                 <button (click)="closeForm()" class="h-10 w-10 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
              </div>

              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6 flex-1">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nombre del Área</label>
                  <input type="text" formControlName="name" class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 font-medium outline-none">
                  @if (form.get('name')?.touched && form.get('name')?.invalid) {
                    <p class="text-xs text-red-500 mt-2 font-bold">El nombre es requerido</p>
                  }
                </div>

                <div class="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white pb-2 border-t border-slate-100 mt-auto">
                   <button type="button" (click)="closeForm()" class="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
                   <button type="submit" [disabled]="form.invalid" class="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50">
                     {{ editingArea() ? 'Actualizar' : 'Guardar' }}
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
export class AreaManagementComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);
  
  showForm = signal(false);
  editingArea = signal<Area | null>(null);

  areas = computed(() => this.dataService.getAllAreas());
  
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]]
  });

  getEmployeeCount(areaId: number) {
    return this.dataService.getAllUsers().filter(u => u.areaId === areaId).length;
  }

  openCreate() {
    this.editingArea.set(null);
    this.form.reset();
    this.showForm.set(true);
  }

  openEdit(area: Area) {
    this.editingArea.set(area);
    this.form.patchValue({ name: area.name });
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingArea.set(null);
  }

  onSubmit() {
    if (this.form.valid) {
      // Uniqueness check
      if (this.dataService.isAreaNameTaken(this.form.value.name!, this.editingArea()?.id)) {
         alert('Ya existe un área con este nombre.');
         return;
      }

      if (this.editingArea()) {
        this.dataService.updateArea({ id: this.editingArea()!.id, name: this.form.value.name! });
      } else {
        this.dataService.addArea(this.form.value.name!);
      }
      this.closeForm();
    }
  }

  deleteArea(id: number) {
    if (confirm('¿Estás seguro de eliminar esta área?')) {
      this.dataService.deleteArea(id);
    }
  }
}
