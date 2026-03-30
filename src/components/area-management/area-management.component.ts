
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
          <h2 class="text-2xl font-bold tracking-tight">Configuración de Áreas</h2>
          <p class="text-muted-foreground text-xs font-medium">Gestión de departamentos y unidades de negocio</p>
        </div>
        
        <button (click)="openCreate()" class="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nueva Área
        </button>
      </div>

      <!-- Main Card -->
      <div class="bg-card rounded-lg shadow-sm border overflow-hidden flex flex-col flex-1 relative">
        <div class="flex-1 overflow-auto">
          <table class="min-w-full divide-y divide-border">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre del Área</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Dotación</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              @for (area of areas(); track area.id) {
                <tr class="hover:bg-accent/50 transition-colors group">
                  <td class="px-6 py-3 whitespace-nowrap">
                     <span class="font-mono text-xs text-muted-foreground">#{{ area.id }}</span>
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap">
                     <div class="text-sm font-medium">{{ area.name }}</div>
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                      {{ getEmployeeCount(area.id) }} miembros
                    </span>
                  </td>
                  <td class="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                     <div class="flex items-center justify-end gap-1">
                        <button (click)="openEdit(area)" class="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors" title="Editar">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button (click)="deleteArea(area.id)" 
                                [disabled]="getEmployeeCount(area.id) > 0"
                                class="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
                                title="Eliminar">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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
          <div class="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-end">
            <div class="w-full max-w-md bg-card h-full shadow-lg border-l border-border p-6 overflow-y-auto animate-slide-in flex flex-col">
              <div class="flex justify-between items-center mb-6">
                 <div>
                   <h3 class="text-lg font-bold">
                     {{ editingArea() ? 'Editar Área' : 'Nueva Área' }}
                   </h3>
                   <p class="text-sm text-muted-foreground mt-0.5">Información del departamento.</p>
                 </div>
                 <button (click)="closeForm()" class="h-8 w-8 rounded-md bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors">
                   <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                   </svg>
                 </button>
              </div>

              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4 flex-1">
                <div>
                  <label class="block text-sm font-medium mb-1.5 ml-0.5">Nombre del Área</label>
                  <input type="text" formControlName="name" class="block w-full rounded-md bg-input/50 border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all px-3 py-2 text-sm outline-none">
                  @if (form.get('name')?.touched && form.get('name')?.invalid) {
                    <p class="text-xs text-destructive mt-1.5 font-medium">El nombre es requerido</p>
                  }
                </div>

                <div class="pt-4 flex justify-end gap-3 border-t border-border mt-auto">
                   <button type="button" (click)="closeForm()" class="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors">Cancelar</button>
                   <button type="submit" [disabled]="form.invalid" class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50">
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
  styles: []
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
    return this.dataService.getAllUsers().filter(u => u.areaIds.includes(areaId)).length;
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
