
import { Component, inject, signal } from '@angular/core';
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

type ViewState = 'BI' | 'LIST' | 'DETAIL' | 'USERS' | 'AREAS' | 'KANBAN' | 'PROFILE' | 'MANUAL';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent, ProjectDetailComponent, UserManagementComponent, AreaManagementComponent, BiDashboardComponent, KanbanBoardComponent, LoginComponent, ProfileComponent, ManualComponent, NotificationComponent, AppSwitcherComponent],
  template: `
    @if (dataService.isAuthenticated()) {
      <!-- Main Application Layout -->
      <div class="h-screen w-full flex bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
        
        <!-- Mobile Sidebar Overlay -->
        <div
          class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          [class.opacity-100]="sidebarOpen()"
          [class.opacity-0]="!sidebarOpen()"
          [class.pointer-events-none]="!sidebarOpen()"
          (click)="sidebarOpen.set(false)">
        </div>

        <!-- Sidebar -->
        <aside
          class="fixed inset-y-0 left-0 z-50 w-64 border-r border-border transition-all duration-300 lg:static lg:translate-x-0 flex flex-col h-full"
          [class.bg-card]="themeService.theme() === 'dark'"
          [class.text-card-foreground]="themeService.theme() === 'dark'"
          [class.bg-slate-50\/80]="themeService.theme() !== 'dark'"
          [class.text-slate-800]="themeService.theme() !== 'dark'"
          [class.translate-x-0]="sidebarOpen()"
          [class.-translate-x-full]="!sidebarOpen()">
          
          <!-- Close button (mobile) -->
          <div class="flex items-center justify-end p-4 lg:hidden">
            <button (click)="sidebarOpen.set(false)" class="text-muted-foreground hover:text-foreground">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div class="p-6 flex items-center gap-3">
            <div class="w-10 h-10 flex items-center justify-center shrink-0 overflow-hidden">
                <img src="/Logo.png" alt="Logo" class="h-full w-full object-contain">
            </div>
            <div>
              <h1 class="font-bold text-lg leading-none tracking-tight">S-Project</h1>
              <p class="text-xs text-muted-foreground">Gestión de Proyectost</p>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            
            <!-- BI Dashboard -->
            <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('BI'); sidebarOpen.set(false)" 
               class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
               [class.bg-primary]="dataService.currentView() === 'BI'"
               [class.text-primary-foreground]="dataService.currentView() === 'BI'"
               [class.shadow-sm]="dataService.currentView() === 'BI'"
               [class.text-muted-foreground]="dataService.currentView() !== 'BI'"
               [class.hover:bg-accent]="dataService.currentView() !== 'BI'"
               [class.hover:text-accent-foreground]="dataService.currentView() !== 'BI'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Dashboard
            </a>

            <!-- Projects List -->
            <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('LIST'); sidebarOpen.set(false)" 
               class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
               [class.bg-primary]="dataService.currentView() === 'LIST' || dataService.currentView() === 'DETAIL'"
               [class.text-primary-foreground]="dataService.currentView() === 'LIST' || dataService.currentView() === 'DETAIL'"
               [class.shadow-sm]="dataService.currentView() === 'LIST' || dataService.currentView() === 'DETAIL'"
               [class.text-muted-foreground]="dataService.currentView() !== 'LIST' && dataService.currentView() !== 'DETAIL'"
               [class.hover:bg-accent]="dataService.currentView() !== 'LIST' && dataService.currentView() !== 'DETAIL'"
               [class.hover:text-accent-foreground]="dataService.currentView() !== 'LIST' && dataService.currentView() !== 'DETAIL'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              Proyectos
            </a>
            
            <!-- Mis Tareas (KANBAN) -->
            <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('KANBAN'); sidebarOpen.set(false)" 
               class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
               [class.bg-primary]="dataService.currentView() === 'KANBAN'"
               [class.text-primary-foreground]="dataService.currentView() === 'KANBAN'"
               [class.shadow-sm]="dataService.currentView() === 'KANBAN'"
               [class.text-muted-foreground]="dataService.currentView() !== 'KANBAN'"
               [class.hover:bg-accent]="dataService.currentView() !== 'KANBAN'"
               [class.hover:text-accent-foreground]="dataService.currentView() !== 'KANBAN'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
              Mis Tareas
            </a>

            <!-- Manual de Uso -->
            <a href="#" (click)="$event.preventDefault(); dataService.goToManual(); sidebarOpen.set(false)" 
               class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
               [class.bg-primary]="dataService.currentView() === 'MANUAL'"
               [class.text-primary-foreground]="dataService.currentView() === 'MANUAL'"
               [class.shadow-sm]="dataService.currentView() === 'MANUAL'"
               [class.text-muted-foreground]="dataService.currentView() !== 'MANUAL'"
               [class.hover:bg-accent]="dataService.currentView() !== 'MANUAL'"
               [class.hover:text-accent-foreground]="dataService.currentView() !== 'MANUAL'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              Manual de Uso
            </a>

            <!-- ADMIN ONLY MENU -->
            @if (dataService.currentUser()?.role === 'ADMIN') {
              <div class="pt-4 mt-4 border-t border-border">
                <p class="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Administración</p>
              </div>
              
              <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('USERS'); sidebarOpen.set(false)" 
                 class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
                 [class.bg-primary]="dataService.currentView() === 'USERS'"
                 [class.text-primary-foreground]="dataService.currentView() === 'USERS'"
                 [class.shadow-sm]="dataService.currentView() === 'USERS'"
                 [class.text-muted-foreground]="dataService.currentView() !== 'USERS'"
                 [class.hover:bg-accent]="dataService.currentView() !== 'USERS'"
                 [class.hover:text-accent-foreground]="dataService.currentView() !== 'USERS'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                Equipos y Usuarios
              </a>

              <a href="#" (click)="$event.preventDefault(); dataService.currentView.set('AREAS'); sidebarOpen.set(false)" 
                 class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
                 [class.bg-primary]="dataService.currentView() === 'AREAS'"
                 [class.text-primary-foreground]="dataService.currentView() === 'AREAS'"
                 [class.shadow-sm]="dataService.currentView() === 'AREAS'"
                 [class.text-muted-foreground]="dataService.currentView() !== 'AREAS'"
                 [class.hover:bg-accent]="dataService.currentView() !== 'AREAS'"
                 [class.hover:text-accent-foreground]="dataService.currentView() !== 'AREAS'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                Config Áreas
              </a>
            }
          </nav>

              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Cerrar Sesión
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          <!-- Global Header -->
          <header class="flex items-center justify-between px-4 py-2 border-b border-border bg-card sticky top-0 z-30">
            <div class="flex items-center gap-4">
              <button (click)="sidebarOpen.set(true)" class="p-2 -ml-2 text-muted-foreground hover:bg-accent rounded-md lg:hidden">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="/Logo.png" alt="Logo" class="h-full w-full object-contain">
                </div>
                <span class="font-semibold text-lg hidden sm:inline-block">S-Project</span>
              </div>
            </div>
            
            <div class="flex-1 flex justify-end items-center gap-2 sm:gap-4">
              <!-- Dark Mode Toggle -->
              <button (click)="themeService.toggleTheme()"
                      class="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-full transition-colors duration-200 focus:outline-none"
                      title="Cambiar Tema">
                @if (themeService.theme() === 'dark') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
                } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                }
              </button>

              <!-- App Switcher -->
              <app-switcher currentAppId="s-project"></app-switcher>

              <!-- Mi Perfil Avatar -->
              <button (click)="dataService.currentView.set('PROFILE')" 
                      class="flex items-center gap-2 p-1.5 rounded-full hover:bg-accent group transition-all"
                      title="Mi Perfil">
                <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0 border border-transparent group-hover:border-primary/50">
                  @if (dataService.currentUser()?.avatar) {
                    <img [src]="dataService.currentUser()?.avatar" alt="Profile" class="w-full h-full object-cover">
                  } @else {
                    {{ dataService.currentUser()?.name?.substring(0, 2).toUpperCase() || 'SP' }}
                  }
                </div>
              </button>

              <app-notification></app-notification>
            </div>
          </header>

          <!-- Content Area -->
          <main class="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col">
            <div class="flex-1 mx-auto max-w-7xl w-full flex flex-col min-h-0 animate-in fade-in zoom-in-95">
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
      </div>
    } @else {
      <!-- Login View -->
      <app-login></app-login>
    }
  `,
  styles: []
})
export class AppComponent {
  dataService = inject(DataService);
  themeService = inject(ThemeService);
  sidebarOpen = signal(false);
}
