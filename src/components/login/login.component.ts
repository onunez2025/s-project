
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ThemeService } from '../../services/theme.service';

@Component({
   selector: 'app-login',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule],
   template: `
    <div class="min-h-screen flex flex-col md:flex-row bg-background text-foreground transition-colors duration-300">
       
       <!-- Left Side - Brand / Visual -->
       <div class="hidden md:flex flex-col justify-between w-1/2 bg-slate-900 text-white p-12 relative overflow-hidden">
          <!-- Abstract Background Pattern -->
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+IDxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPiA8ZyBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjIiPiA8cGF0aCBkPSJNMCAzdjU0TTMgMGg1NCIvPiA8L2c+IDwvc3ZnPg==')] bg-[size:60px_60px]"></div>
          <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900/50"></div>

          <div class="relative z-10">
             <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl shadow-sm">S</div>
                <span class="text-2xl font-bold tracking-tight">S-Project</span>
             </div>
             <h1 class="text-5xl font-bold mb-4 leading-tight">
                Sistema de<br/>Gestión de<br/>Proyectos
             </h1>
             <div class="text-slate-400 text-lg max-w-md space-y-6">
                <p>Supervisión integral de proyectos, presupuestos, equipos y métricas de impacto corporativo.</p>
                <div class="flex flex-col w-fit gap-2">
                   <span class="text-2xl font-bold text-slate-100 tracking-tight">Gerencia de Atención al Cliente</span>
                   <img 
                       src="/Logo.png" 
                       alt="S-Project Logo" 
                       class="h-auto max-w-[12rem] object-contain drop-shadow-xl animate-in zoom-in duration-500"
                   >
                </div>
             </div>
          </div>

          <div class="relative z-10 text-sm text-slate-500">
             © 2026 GAC - Grupo Sole. Rinnai Corporation. Todos los derechos reservados.
          </div>
       </div>

       <!-- Right Side - Login Form -->
       <div class="flex-1 flex flex-col justify-center items-center p-8 bg-background relative">
          <!-- Top Right Controls -->
          <div class="absolute top-6 right-6 flex items-center gap-4">
             <button (click)="themeService.toggleTheme()"
                     class="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors"
                     title="Toggle Theme">
                @if (themeService.theme() === 'dark') {
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                } @else {
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                }
             </button>
             <!-- Language Toggle Para Paridad Visual -->
             <button
                 class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:bg-accent text-sm font-medium transition-colors opacity-50 cursor-not-allowed"
                 disabled
             >
                 ES
             </button>
          </div>

          <div class="w-full max-w-md space-y-8">
             <div class="text-center">
                <h2 class="text-3xl font-bold tracking-tight">Bienvenido</h2>
                <p class="mt-2 text-muted-foreground text-sm">
                   Ingresa tus credenciales para acceder al sistema
                </p>
             </div>

             <!-- Error Alert -->
             @if (errorMsg()) {
               <div class="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium text-center animate-in fade-in">
                  {{ errorMsg() }}
               </div>
             }

             <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6 mt-8">
                <div class="space-y-4">
                   <div>
                      <label class="block text-sm font-medium mb-1.5 ml-1">Usuario</label>
                      <div class="relative">
                         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                         </div>
                         <input type="email" formControlName="email" 
                                class="block w-full pl-10 pr-3 py-2.5 bg-input/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-foreground text-sm"
                                placeholder="Ingrese usuario">
                      </div>
                   </div>

                   <div>
                      <label class="block text-sm font-medium mb-1.5 ml-1">Contraseña</label>
                      <div class="relative">
                         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                         </div>
                         <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" 
                                class="block w-full pl-10 pr-10 py-2.5 bg-input/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-foreground text-sm"
                                placeholder="Ingrese contraseña">
                         
                         <button type="button" (click)="showPassword.set(!showPassword())" class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                            @if(showPassword()) {
                               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                            } @else {
                               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            }
                         </button>
                      </div>
                   </div>
                </div>

                <div class="flex items-center justify-between text-sm">
                   <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" class="w-4 h-4 rounded border-input text-primary focus:ring-primary">
                      <span class="text-muted-foreground">Recordarme</span>
                   </label>
                   <button type="button" 
                           class="font-medium text-primary hover:text-primary/80 transition-colors bg-transparent border-none p-0 cursor-pointer"
                           (click)="errorMsg.set('Por favor, contacta a tu administrador de sistemas para que te asigne una nueva contraseña temporal.')">
                      ¿Olvidaste tu contraseña?
                   </button>
                </div>

                <button type="submit" [disabled]="loginForm.invalid || isLoading()" 
                        class="w-full flex justify-center h-9 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-primary-foreground bg-gradient-to-r from-primary/80 to-primary hover:from-primary/80 hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed items-center"
                        [class.animate-pulse]="isLoading()">
                   {{ isLoading() ? 'Iniciando Sesión...' : 'Ingresar' }}
                </button>
             </form>
          </div>
       </div>
    </div>
  `,
   styles: []
})
export class LoginComponent {
   fb = inject(FormBuilder);
   dataService = inject(DataService);
   themeService = inject(ThemeService);

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
