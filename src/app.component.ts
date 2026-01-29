
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, User } from './services/data.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { AreaManagementComponent } from './components/area-management/area-management.component';
import { BiDashboardComponent } from './components/bi-dashboard/bi-dashboard.component';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ManualComponent } from './components/manual/manual.component';
import { NotificationComponent } from './components/notification/notification.component';

type ViewState = 'BI' | 'LIST' | 'DETAIL' | 'USERS' | 'AREAS' | 'KANBAN' | 'PROFILE' | 'MANUAL';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent, ProjectDetailComponent, UserManagementComponent, AreaManagementComponent, BiDashboardComponent, KanbanBoardComponent, LoginComponent, ProfileComponent, ManualComponent, NotificationComponent],
  template: `
    @if (dataService.isAuthenticated()) {
      <!-- Main Application Layout -->
      <div class="h-screen w-full flex bg-[#F3F4F6] font-sans overflow-hidden">
        
        <!-- Sidebar -->
        <aside class="w-72 bg-[#0F172A] text-slate-300 hidden md:flex flex-col shadow-2xl z-20 transition-all font-medium relative h-full">
          <div class="h-20 flex items-center px-8 border-b border-slate-800/50 bg-[#0F172A] shrink-0">
            <div class="flex items-center gap-2">
              <div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
              <span class="text-2xl font-bold tracking-tight text-white">
                S-Project
              </span>
            </div>
          </div>
          
          <nav class="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
            
            <div class="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menu Principal</div>
            
            <!-- BI Dashboard -->
            <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('BI')" 
               class="flex items-center px-4 py-3 rounded-xl transition-all group duration-200"
               [class.bg-blue-600]="dataService.currentView() === 'BI'"
               [class.text-white]="dataService.currentView() === 'BI'"
               [class.shadow-lg]="dataService.currentView() === 'BI'"
               [class.shadow-blue-900/50]="dataService.currentView() === 'BI'"
               [class.hover:bg-slate-800]="dataService.currentView() !== 'BI'"
               [class.text-slate-400]="dataService.currentView() !== 'BI'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </a>

            <!-- Projects List -->
            <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('LIST')" 
               class="flex items-center px-4 py-3 rounded-xl transition-all group duration-200"
               [class.bg-blue-600]="dataService.currentView() === 'LIST' || dataService.currentView() === 'DETAIL'"
               [class.text-white]="dataService.currentView() === 'LIST' || dataService.currentView() === 'DETAIL'"
               [class.shadow-lg]="dataService.currentView() === 'LIST' || dataService.currentView() === 'DETAIL'"
               [class.shadow-blue-900/50]="dataService.currentView() === 'LIST' || dataService.currentView() === 'DETAIL'"
               [class.hover:bg-slate-800]="dataService.currentView() !== 'LIST' && dataService.currentView() !== 'DETAIL'"
               [class.text-slate-400]="dataService.currentView() !== 'LIST' && dataService.currentView() !== 'DETAIL'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Proyectos
            </a>
            
            <!-- Mis Tareas (KANBAN) -->
            <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('KANBAN')" 
               class="flex items-center px-4 py-3 rounded-xl transition-all group duration-200"
               [class.bg-blue-600]="dataService.currentView() === 'KANBAN'"
               [class.text-white]="dataService.currentView() === 'KANBAN'"
               [class.shadow-lg]="dataService.currentView() === 'KANBAN'"
               [class.shadow-blue-900/50]="dataService.currentView() === 'KANBAN'"
               [class.hover:bg-slate-800]="dataService.currentView() !== 'KANBAN'"
               [class.text-slate-400]="dataService.currentView() !== 'KANBAN'">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
               </svg>
               Mis Tareas
            </a>

            <div class="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-8">Soporte</div>

            <!-- Manual de Uso -->
            <a href="#" (click)="$event.preventDefault(); dataService.goToManual()" 
               class="flex items-center px-4 py-3 rounded-xl transition-all group duration-200"
               [class.bg-blue-600]="dataService.currentView() === 'MANUAL'"
               [class.text-white]="dataService.currentView() === 'MANUAL'"
               [class.shadow-lg]="dataService.currentView() === 'MANUAL'"
               [class.hover:bg-slate-800]="dataService.currentView() !== 'MANUAL'"
               [class.text-slate-400]="dataService.currentView() !== 'MANUAL'">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
               </svg>
               Manual de Uso
            </a>

            <!-- ADMIN ONLY MENU -->
            @if (dataService.currentUser()?.role === 'ADMIN') {
              <div class="mt-8 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Administración</div>
              
              <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('USERS')" 
                 class="flex items-center px-4 py-3 rounded-xl transition-all group duration-200"
                 [class.bg-blue-600]="dataService.currentView() === 'USERS'"
                 [class.text-white]="dataService.currentView() === 'USERS'"
                 [class.shadow-lg]="dataService.currentView() === 'USERS'"
                 [class.hover:bg-slate-800]="dataService.currentView() !== 'USERS'"
                 [class.text-slate-400]="dataService.currentView() !== 'USERS'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Equipos y Usuarios
              </a>

              <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('AREAS')" 
                 class="flex items-center px-4 py-3 rounded-xl transition-all group duration-200"
                 [class.bg-blue-600]="dataService.currentView() === 'AREAS'"
                 [class.text-white]="dataService.currentView() === 'AREAS'"
                 [class.shadow-lg]="dataService.currentView() === 'AREAS'"
                 [class.hover:bg-slate-800]="dataService.currentView() !== 'AREAS'"
                 [class.text-slate-400]="dataService.currentView() !== 'AREAS'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Config Áreas
              </a>
            }
          </nav>

          <!-- User Profile Bottom Section (Interactive) -->
          <div class="relative shrink-0">
             @if(showUserMenu()) {
                <!-- Popover Menu -->
                <div class="absolute bottom-full left-4 w-64 mb-2 bg-[#1E293B] rounded-xl shadow-xl border border-slate-700/50 overflow-hidden animate-fade-in z-30">
                   <button (click)="dataService.currentView.set('PROFILE'); showUserMenu.set(false)" class="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-2 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      Mi Perfil
                   </button>
                   <div class="h-px bg-slate-700/50 mx-2"></div>
                   <button (click)="dataService.logout()" class="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Cerrar Sesión
                   </button>
                </div>
                
                <!-- Overlay to close menu when clicking outside -->
                <div class="fixed inset-0 z-20 cursor-default" (click)="showUserMenu.set(false)"></div>
             }

             <!-- Trigger Bar -->
             <div (click)="showUserMenu.set(!showUserMenu())" class="p-6 border-t border-slate-800/50 bg-[#0F172A] cursor-pointer hover:bg-slate-800/50 transition-colors group z-30 relative">
                <div class="flex items-center gap-3">
                  <div class="relative">
                     <img [src]="dataService.currentUser()?.avatar" class="h-10 w-10 rounded-full bg-slate-700 border-2 border-slate-600 object-cover group-hover:border-blue-500 transition-colors">
                     <div class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#0F172A]"></div>
                  </div>
                  <div class="overflow-hidden flex-1">
                    <p class="text-sm font-semibold text-white truncate">{{ dataService.currentUser()?.name }}</p>
                    <p class="text-xs text-slate-400 truncate">{{ dataService.currentUser()?.subRole || 'Administrador' }}</p>
                  </div>
                  <div class="text-slate-500 group-hover:text-white transition-colors">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
             </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative h-full">
          
          <!-- Mobile Header -->
          <header class="md:hidden bg-[#0F172A] border-b border-slate-800 h-16 flex items-center px-4 justify-between shadow-md z-30 shrink-0">
             <span class="text-xl font-bold text-white">S-Project</span>
             <div class="flex items-center gap-3">
               <app-notification></app-notification>
               <img [src]="dataService.currentUser()?.avatar" (click)="dataService.currentView.set('PROFILE')" class="h-8 w-8 rounded-full border border-slate-500 cursor-pointer">
             </div>
          </header>

          <!-- Desktop Header Bar -->
          <header class="hidden md:flex h-16 bg-white border-b border-slate-100 items-center justify-between px-8 shrink-0 z-10">
             <div class="flex items-center gap-4 text-slate-500">
               <span class="text-sm font-medium">Dashboard</span>
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
               <span class="text-sm font-bold text-slate-800">{{ dataService.currentView() }}</span>
             </div>
             
             <div class="flex items-center gap-4">
                <app-notification></app-notification>
                <div class="h-8 w-px bg-slate-100"></div>
                <!-- Profile Link / Quick Settings -->
                <button (click)="dataService.currentView.set('PROFILE')" class="text-slate-400 hover:text-blue-600 transition-colors">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
             </div>
          </header>

          <div class="flex-1 overflow-auto p-4 sm:p-8 relative custom-scrollbar">
             @switch (dataService.currentView()) {
               @case ('BI') {
                  <app-bi-dashboard 
                     (selectProject)="dataService.goToDetail($event)"
                     (goToProjects)="dataService.currentView.set('LIST')"
                     (goToManual)="dataService.goToManual('projects')">
                  </app-bi-dashboard>
               }
               @case ('LIST') {
                 <app-dashboard 
                    (onSelect)="dataService.goToDetail($event)"
                    (goToManual)="dataService.goToManual('projects')"
                 ></app-dashboard>
               }
               @case ('DETAIL') {
                 <app-project-detail
                    [projectId]="dataService.selectedProjectId()!"
                    (back)="dataService.currentView.set('LIST')"
                    (goToManual)="dataService.goToManual($event)"
                 ></app-project-detail>
               }
               @case ('KANBAN') {
                 <app-kanban-board></app-kanban-board>
               }
               @case ('USERS') {
                 <app-user-management></app-user-management>
               }
               @case ('AREAS') {
                 <app-area-management></app-area-management>
               }
               @case ('PROFILE') {
                 <app-profile></app-profile>
               }
               @case ('MANUAL') {
                 <app-manual [section]="dataService.manualSection()"></app-manual>
               }
             }
          </div>
        </main>
      </div>
    } @else {
      <!-- Login View -->
      <app-login></app-login>
    }
  `,
  styles: [`
     .custom-scrollbar::-webkit-scrollbar { width: 6px; }
     .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
     .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
     .animate-fade-in { animation: fadeIn 0.2s ease-out; }
     @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AppComponent {
  dataService = inject(DataService);
  showUserMenu = signal(false);
}
