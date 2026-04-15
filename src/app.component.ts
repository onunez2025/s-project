import { Component, inject, signal, ElementRef, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, User } from './services/data.service';
import { ThemeService } from './services/theme.service';
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
import { AppSwitcherComponent } from './components/app-switcher/app-switcher.component';

// SIATC PREMIUM MASTER — AppComponent v2.0 (Platinum Adaptación Angular)
// Sincronizado para PARIDAD ABSOLUTA con el estándar EBM.

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent, ProjectDetailComponent, UserManagementComponent, AreaManagementComponent, BiDashboardComponent, KanbanBoardComponent, LoginComponent, ProfileComponent, ManualComponent, NotificationComponent, AppSwitcherComponent],
  template: `
    @if (dataService.isAuthenticated()) {
      <!-- Main Application Layout SIATC Platinum -->
      <div class="h-screen w-full flex bg-[#F8FAFC] dark:bg-[#020617] text-foreground font-sans overflow-hidden transition-all duration-500">
        
        <!-- Mobile Sidebar Overlay -->
        <div
          class="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md lg:hidden transition-opacity duration-500"
          [class.opacity-100]="sidebarOpen()"
          [class.opacity-0]="!sidebarOpen()"
          [class.pointer-events-none]="!sidebarOpen()"
          (click)="sidebarOpen.set(false)">
        </div>

        <!-- Sidebar Container: SIATC Platinum look -->
        <aside
          class="fixed inset-y-0 left-0 z-[70] w-72 transition-transform duration-500 ease-in-out lg:static lg:translate-x-0 force-gpu p-4 bg-transparent"
          [class.translate-x-0]="sidebarOpen()"
          [class.-translate-x-full]="!sidebarOpen()">
          
          <div class="h-full flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative group/sidebar">
            
            <!-- Close button (mobile) -->
            <div class="flex items-center justify-end p-6 lg:hidden">
              <button (click)="sidebarOpen.set(false)" class="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-2xl transition-all">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Header / Logo -->
            <div class="p-6 flex items-center gap-4 border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
              <div class="w-12 h-12 flex items-center justify-center shrink-0 overflow-hidden bg-white rounded-2xl shadow-lg shadow-primary/5 border border-primary/10 p-1.5 transition-transform hover:scale-105">
                  <img src="/ecosystem-logos/s-project.png" alt="S-Project Logo" class="h-full w-full object-contain">
              </div>
              <div class="flex flex-col">
                <h1 class="font-bold text-lg leading-none tracking-tight text-foreground uppercase pt-1">S-PROJECT</h1>
                <p class="text-[10px] font-black text-primary tracking-[0.2em] uppercase mt-1 opacity-70">Project Core</p>
              </div>
            </div>

            <!-- Navigation SIATC Standard -->
            <nav class="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
              <p class="text-[10px] font-black text-muted-foreground tracking-[0.2em] px-4 py-2 uppercase opacity-40">Operaciones</p>
              
              <!-- BI Dashboard -->
              <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('BI'); sidebarOpen.set(false)" 
                 class="group/item flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden"
                 [class.bg-primary]="dataService.currentView() === 'BI'"
                 [class.text-primary-foreground]="dataService.currentView() === 'BI'"
                 [class.shadow-lg]="dataService.currentView() === 'BI'"
                 [class.translate-x-1]="dataService.currentView() === 'BI'"
                 [class.text-muted-foreground]="dataService.currentView() !== 'BI'"
                 [class.hover:bg-muted]="dataService.currentView() !== 'BI'"
                 [class.hover:text-foreground]="dataService.currentView() !== 'BI'">
                <div class="flex items-center gap-3 relative z-10">
                  <svg class="w-5 h-5 transition-transform duration-500 group-hover/item:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span class="tracking-tight uppercase">Dashboard</span>
                </div>
              </a>

              <!-- Projects List -->
              <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('LIST'); sidebarOpen.set(false)" 
                 class="group/item flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden"
                 [class.bg-primary]="dataService.currentView() === 'LIST' || dataService.currentView() === 'DETAIL'"
                 [class.text-primary-foreground]="dataService.currentView() === 'LIST' || dataService.currentView() === 'DETAIL'"
                 [class.translate-x-1]="dataService.currentView() === 'LIST' || dataService.currentView() === 'DETAIL'"
                 [class.text-muted-foreground]="dataService.currentView() !== 'LIST' && dataService.currentView() !== 'DETAIL'"
                 [class.hover:bg-muted]="dataService.currentView() !== 'LIST' && dataService.currentView() !== 'DETAIL'">
                <div class="flex items-center gap-3 relative z-10">
                  <svg class="w-5 h-5 transition-transform duration-500 group-hover/item:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                  <span class="tracking-tight uppercase">Proyectos</span>
                </div>
              </a>
              
              <!-- Mis Tareas (KANBAN) -->
              <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('KANBAN'); sidebarOpen.set(false)" 
                 class="group/item flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden"
                 [class.bg-primary]="dataService.currentView() === 'KANBAN'"
                 [class.text-primary-foreground]="dataService.currentView() === 'KANBAN'"
                 [class.translate-x-1]="dataService.currentView() === 'KANBAN'"
                 [class.text-muted-foreground]="dataService.currentView() !== 'KANBAN'"
                 [class.hover:bg-muted]="dataService.currentView() !== 'KANBAN'">
                <div class="flex items-center gap-3 relative z-10">
                  <svg class="w-5 h-5 transition-transform duration-500 group-hover/item:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                  <span class="tracking-tight uppercase">Mis Tareas</span>
                </div>
              </a>

              <!-- Manual de Uso -->
              <a href="#" (click)="$event.preventDefault(); dataService.goToManual(); sidebarOpen.set(false)" 
                 class="group/item flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden"
                 [class.bg-primary]="dataService.currentView() === 'MANUAL'"
                 [class.text-primary-foreground]="dataService.currentView() === 'MANUAL'"
                 [class.translate-x-1]="dataService.currentView() === 'MANUAL'"
                 [class.text-muted-foreground]="dataService.currentView() !== 'MANUAL'"
                 [class.hover:bg-muted]="dataService.currentView() !== 'MANUAL'">
                <div class="flex items-center gap-3 relative z-10">
                  <svg class="w-5 h-5 transition-transform duration-500 group-hover/item:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                  <span class="tracking-tight uppercase">Ayuda</span>
                </div>
              </a>

              <!-- ADMIN SECTION -->
              @if (dataService.currentUser()?.role === 'ADMIN') {
                <div class="pt-6 mt-4 border-t border-border/50">
                  <p class="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">Administración</p>
                </div>
                
                <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('USERS'); sidebarOpen.set(false)" 
                   class="group/item flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden"
                   [class.bg-primary]="dataService.currentView() === 'USERS'"
                   [class.text-primary-foreground]="dataService.currentView() === 'USERS'"
                   [class.translate-x-1]="dataService.currentView() === 'USERS'"
                   [class.text-muted-foreground]="dataService.currentView() !== 'USERS'"
                   [class.hover:bg-muted]="dataService.currentView() !== 'USERS'">
                  <div class="flex items-center gap-3 relative z-10">
                    <svg class="w-5 h-5 transition-transform duration-500 group-hover/item:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    <span class="tracking-tight uppercase">Teams</span>
                  </div>
                </a>

                <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('AREAS'); sidebarOpen.set(false)" 
                   class="group/item flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden"
                   [class.bg-primary]="dataService.currentView() === 'AREAS'"
                   [class.text-primary-foreground]="dataService.currentView() === 'AREAS'"
                   [class.translate-x-1]="dataService.currentView() === 'AREAS'"
                   [class.text-muted-foreground]="dataService.currentView() !== 'AREAS'"
                   [class.hover:bg-muted]="dataService.currentView() !== 'AREAS'">
                  <div class="flex items-center gap-3 relative z-10">
                    <svg class="w-5 h-5 transition-transform duration-500 group-hover/item:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    <span class="tracking-tight uppercase">Áreas</span>
                  </div>
                </a>
              }
            </nav>

            <!-- Logout Footer -->
            <div class="p-4 border-t border-border/50 bg-muted/20">
              <button (click)="dataService.logout()" 
                      class="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-rose-500/10 hover:shadow-lg uppercase tracking-[0.2em]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </aside>

        <!-- Main Content Viewport -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          
          <!-- Global Header SIATC Platinum — h-20 stardarized -->
          <header class="h-20 shrink-0 px-8 flex items-center justify-between sticky top-0 z-40 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl border-b border-border/50">
            <div class="flex items-center gap-6">
              <button (click)="sidebarOpen.set(true)" class="p-3 -ml-3 text-muted-foreground hover:bg-white dark:hover:bg-white/5 rounded-2xl lg:hidden shadow-sm transition-all border border-transparent hover:border-border/50">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
              
              <div class="flex items-center gap-4 group cursor-default">
                <div class="w-12 h-12 rounded-[1.25rem] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                  <img src="/ecosystem-logos/s-project.png" alt="Logo" class="w-7 h-7 object-contain">
                </div>
                <div class="flex flex-col">
                  <span class="font-black text-sm tracking-tight text-foreground uppercase pt-1">S-PROJECT — SIATC</span>
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span class="text-[10px] font-black text-muted-foreground tracking-widest uppercase opacity-60">Sincronizado</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Header Actions Glassmorphism -->
            <div class="flex items-center p-1.5 gap-2 rounded-[2rem] border border-white dark:border-white/5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-none">
              
              <!-- Dark Mode Toggle -->
              <button (click)="themeService.toggleTheme()"
                      class="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300"
                      title="Alternar Tema">
                @if (themeService.theme() === 'dark') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
                } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                }
              </button>

              <app-switcher currentAppId="s-project"></app-switcher>

              <div class="w-px h-6 bg-border/50 mx-1"></div>

              <!-- Profile -->
              <button (click)="dataService.currentView.set('PROFILE')" 
                      class="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full group transition-all duration-300 border border-transparent hover:bg-white dark:hover:bg-white/5"
                      title="Mi Perfil">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary/20 ring-2 ring-white dark:ring-slate-900 overflow-hidden shrink-0">
                  @if (dataService.currentUser()?.avatar) {
                    <img [src]="dataService.currentUser()?.avatar" alt="Profile" class="w-full h-full object-cover">
                  } @else {
                    {{ dataService.currentUser()?.name?.substring(0, 2).toUpperCase() || 'SP' }}
                  }
                </div>
                <div class="flex flex-col min-w-0 hidden md:flex text-right">
                  <span class="text-[11px] font-black text-foreground truncate uppercase tracking-tight">{{ dataService.currentUser()?.name }}</span>
                  <span class="text-[9px] font-black text-primary/70 uppercase tracking-widest">{{ dataService.currentUser()?.role || 'User' }}</span>
                </div>
              </button>

              <app-notification></app-notification>
            </div>
          </header>

          <!-- Content Area Platinum -->
          <main class="flex-1 overflow-y-auto px-8 pb-8 flex flex-col custom-scrollbar relative">
            <div class="flex-1 w-full max-w-[1600px] mx-auto flex flex-col min-h-0 animate-in fade-in duration-700">
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

          <!-- Ambient Background -->
          <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10 pointer-events-none"></div>
          <div class="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 -z-10 pointer-events-none"></div>
        </div>
      </div>
    } @else {
      <!-- Login View SIATC Standard -->
      <app-login></app-login>
    }
  `,
  styles: [`
    :host { display: block; height: 100vh; }
  `]
})
export class AppComponent implements OnDestroy {
  dataService = inject(DataService);
  themeService = inject(ThemeService);
  sidebarOpen = signal(false);

  private timeoutId: any;
  private readonly INACTIVITY_TIME = 5 * 60 * 1000;
  private readonly activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

  constructor() {
    effect(() => {
      if (this.dataService.isAuthenticated()) {
        this.setupInactivityTimer();
      } else {
        this.clearInactivityTimer();
      }
    });
  }

  private setupInactivityTimer() {
    this.clearInactivityTimer();
    this.activityEvents.forEach(event => {
      window.addEventListener(event, this.handleUserActivity);
    });
    this.resetTimer();
  }

  private clearInactivityTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.activityEvents.forEach(event => {
      window.removeEventListener(event, this.handleUserActivity);
    });
  }

  private handleUserActivity = () => {
    this.resetTimer();
  };

  private resetTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.dataService.logout();
    }, this.INACTIVITY_TIME);
  }

  ngOnDestroy() {
    this.clearInactivityTimer();
  }
}
