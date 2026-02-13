
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
   selector: 'app-login',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule],
   template: `
    <div class="h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
       
       <!-- Background Image Layer -->
       <div class="absolute inset-0 z-0">
          <!-- Using a reliable high-quality Unsplash image for corporate feel to ensure visibility -->
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
               class="w-full h-full object-cover object-center transition-opacity duration-700 opacity-100" 
               alt="S-Project Background">
          
           <!-- Gradient Overlay for better text contrast and blue branding tint -->
           <div class="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/50 to-slate-900/90 backdrop-blur-[2px]"></div>
        </div>

        <!-- Login Card with Glassmorphism -->
        <div class="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/20 w-full max-w-md p-8 md:p-10 animate-fade-in border border-white/50 relative z-10">
           
           <!-- Brand / Logo -->
           <div class="flex flex-col items-center mb-10">
              <div class="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-600/30 mb-4 transform rotate-3">
                S
              </div>
              <h1 class="text-3xl font-bold text-slate-800">S-Project</h1>
              <p class="text-slate-500 font-medium italic">Sistema de Gestión de Proyectos Corporativos</p>
           </div>

          <!-- Error Alert -->
          @if (errorMsg()) {
            <div class="bg-red-50 text-blue-600 p-3 rounded-xl text-sm font-medium mb-6 flex items-center gap-2 border border-red-100 animate-pulse">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               {{ errorMsg() }}
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
             <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Email Corporativo</label>
                <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                   </div>
                   <input type="email" formControlName="email" class="pl-10 block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 font-medium outline-none" placeholder="nombre@sole.com">
                </div>
             </div>

             <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Contraseña</label>
                <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                   </div>
                   <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" class="pl-10 pr-10 block w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all border p-3 text-slate-900 font-medium outline-none" placeholder="••••••••">
                   
                   <button type="button" (click)="showPassword.set(!showPassword())" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                      @if(showPassword()) {
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                      } @else {
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      }
                   </button>
                </div>
             </div>

             <button type="submit" [disabled]="loginForm.invalid || isLoading()" class="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:shadow-none mt-2 flex items-center justify-center gap-2">
                @if (isLoading()) {
                   <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                     <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Iniciando Sesión...
                } @else {
                   Ingresar
                }
             </button>

             <p class="text-center text-xs text-slate-400 mt-6">
                © 2026 Grupo SOLE. Todos los derechos reservados.
             </p>
          </form>
       </div>
    </div>
  `,
   styles: [`
    .animate-fade-in { animation: fadeIn 0.6s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LoginComponent {
   fb = inject(FormBuilder);
   dataService = inject(DataService);

   showPassword = signal(false);
   errorMsg = signal('');
   isLoading = signal(false);

   loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
   });

   async onSubmit() {
      if (this.loginForm.valid) {
         this.isLoading.set(true);
         this.errorMsg.set('');

         try {
            const val = this.loginForm.value;
            const success = await this.dataService.login(val.email!, val.password!);

            if (!success) {
               this.errorMsg.set('Credenciales inválidas. Verifica tu email y contraseña.');
            }
         } catch (err: any) {
            console.error('Login error:', err);
            this.errorMsg.set('Error de conexión. Por favor, intenta de nuevo más tarde.');
         } finally {
            this.isLoading.set(false);
         }
      }
   }
}
