
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { DataService, User } from '../../services/data.service';

@Component({
   selector: 'app-profile',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule, FormsModule],
   template: `
    <div class="h-full flex flex-col items-center justify-start py-10 animate-fade-in overflow-y-auto custom-scrollbar">
      
      <div class="w-full max-w-xl px-4">
         <div class="mb-8">
            <h2 class="text-2xl font-bold tracking-tight">Mi Perfil</h2>
            <p class="text-muted-foreground text-[11px] font-bold uppercase tracking-wider">Gestión de credenciales y datos de identidad corporativa</p>
         </div>

         <div class="bg-card/40 backdrop-blur-sm rounded-xl shadow-2xl border border-border overflow-hidden">
            
            <!-- Avatar Section with Banner Effect -->
            <div class="relative h-24 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b border-border mb-12">
               <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 group cursor-pointer" (click)="fileInput.click()">
                  <div class="relative h-24 w-24 rounded-full border-4 border-card shadow-xl overflow-hidden bg-muted transition-transform group-hover:scale-105">
                     <img [src]="currentAvatar()" class="h-full w-full object-cover">
                     <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                     </div>
                  </div>
                  <div class="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg border-2 border-card">
                     <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                  </div>
               </div>
               <input #fileInput type="file" class="hidden" accept="image/*" (change)="onFileSelected($event)">
            </div>

            <!-- Form Content -->
            <div class="p-8 pt-4">
              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
                 
                 <div class="grid grid-cols-1 gap-6">
                    <div>
                       <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-0.5">Nombre Completo</label>
                       <input type="text" formControlName="name" class="block w-full rounded-md bg-muted/30 border border-border focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all px-4 py-2.5 text-[11px] font-bold uppercase tracking-tight outline-none placeholder:text-muted-foreground/30">
                    </div>
                    <div>
                       <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-0.5">Email Corporativo (Inmutable)</label>
                       <input type="email" formControlName="email" class="block w-full rounded-md bg-muted border border-border text-muted-foreground/60 px-4 py-2.5 text-[11px] font-bold outline-none cursor-not-allowed">
                    </div>
                 </div>

                 <div class="p-6 bg-muted/30 rounded-xl border border-border space-y-4">
                    <h4 class="text-[9px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                       <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                       Seguridad de Acceso
                    </h4>
                    <div>
                       <label class="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-0.5">Nueva Contraseña</label>
                       <input type="password" formControlName="password" 
                              placeholder="DEJAR EN BLANCO PARA MANTENER ACTUAL" 
                              class="block w-full rounded-md bg-card border border-border focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all px-4 py-2.5 text-[11px] font-bold outline-none placeholder:text-[9px] placeholder:tracking-tighter">
                       <p class="text-[9px] text-muted-foreground/60 mt-2 font-bold uppercase tracking-tighter">Requiere un mínimo de 4 caracteres alfanuméricos.</p>
                    </div>
                 </div>

                 <div class="flex justify-end pt-4">
                    <button type="submit" [disabled]="profileForm.invalid || !profileForm.dirty || isSaving()" 
                            class="h-11 px-8 bg-primary text-primary-foreground rounded-md text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2">
                       @if (isSaving()) {
                          <svg class="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                             <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                             <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Actualizando...
                       } @else {
                          Actualizar Perfil
                       }
                    </button>
                 </div>

              </form>
            </div>
         </div>

      </div>
    </div>
  `,
   styles: []
})
export class ProfileComponent {
   dataService = inject(DataService);
   fb = inject(FormBuilder);

   currentUser = this.dataService.currentUser;
   currentAvatar = signal('');
   isSaving = signal(false);

   profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
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
