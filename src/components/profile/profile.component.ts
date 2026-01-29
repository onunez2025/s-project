
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { DataService, User } from '../../services/data.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="h-full flex flex-col items-center justify-start py-10 animate-fade-in">
      
      <div class="w-full max-w-2xl">
         <div class="mb-8">
            <h2 class="text-3xl font-bold text-slate-800">Mi Perfil</h2>
            <p class="text-slate-500 mt-1">Gestiona tu información personal y credenciales.</p>
         </div>

         <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            
            <!-- Avatar Section -->
            <div class="flex flex-col items-center mb-8">
               <div class="relative group cursor-pointer" (click)="fileInput.click()">
                  <img [src]="currentAvatar()" class="h-32 w-32 rounded-full object-cover border-4 border-slate-50 shadow-lg transition-transform group-hover:scale-105">
                  <div class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
               </div>
               <p class="text-xs text-slate-400 mt-3 font-medium">Haz clic en la foto para cambiarla</p>
               <input #fileInput type="file" class="hidden" accept="image/*" (change)="onFileSelected($event)">
            </div>

            <!-- Form -->
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
               
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nombre Completo</label>
                     <input type="text" formControlName="name" class="block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 font-medium outline-none">
                  </div>
                  <div>
                     <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Email (Solo lectura)</label>
                     <input type="email" formControlName="email" class="block w-full rounded-xl border-slate-200 bg-slate-100 text-slate-500 border p-3 font-medium outline-none cursor-not-allowed">
                  </div>
               </div>

               <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                     Seguridad
                  </h4>
                  <div>
                     <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nueva Contraseña</label>
                     <input type="password" formControlName="password" placeholder="Dejar en blanco para mantener la actual" class="block w-full rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 font-medium outline-none">
                     <p class="text-[10px] text-slate-400 mt-1">Mínimo 4 caracteres si decides cambiarla.</p>
                  </div>
               </div>

               <div class="flex justify-end pt-4">
                  <button type="submit" [disabled]="profileForm.invalid || !profileForm.dirty" 
                          class="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2">
                     <svg *ngIf="isSaving()" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     {{ isSaving() ? 'Guardando...' : 'Guardar Cambios' }}
                  </button>
               </div>

            </form>
         </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProfileComponent {
  dataService = inject(DataService);
  fb = inject(FormBuilder);
  
  currentUser = this.dataService.currentUser;
  currentAvatar = signal('');
  isSaving = signal(false);

  profileForm = this.fb.group({
    name: ['', Validators.required],
    email: [{value: '', disabled: true}],
    password: ['', [Validators.minLength(4)]]
  });

  constructor() {
    const user = this.currentUser();
    if (user) {
       this.currentAvatar.set(user.avatar);
       this.profileForm.patchValue({
          name: user.name,
          email: user.email
       });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
         this.currentAvatar.set(e.target.result);
         this.profileForm.markAsDirty();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
     if (this.profileForm.valid) {
        this.isSaving.set(true);
        const user = this.currentUser();
        if (!user) return;

        const val = this.profileForm.value;
        const updatedUser: User = {
           ...user,
           name: val.name!,
           avatar: this.currentAvatar()
        };
        
        if (val.password) {
           updatedUser.password = val.password;
        }

        // Simulate API delay
        setTimeout(() => {
           this.dataService.updateUser(updatedUser);
           this.isSaving.set(false);
           alert('Perfil actualizado correctamente.');
           this.profileForm.reset({ 
              name: updatedUser.name, 
              email: updatedUser.email, 
              password: '' 
           });
           this.profileForm.markAsPristine();
        }, 800);
     }
  }
}
