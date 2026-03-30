
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, AppNotification } from '../../services/data.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <!-- Bell Icon Button -->
      <button (click)="toggleDropdown()" 
              class="relative p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-all active:scale-95">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        
        <!-- Badge -->
        @if (unreadCount() > 0) {
          <span class="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-card">
            {{ unreadCount() > 9 ? '9+' : unreadCount() }}
          </span>
        }
      </button>

      <!-- Dropdown -->
      @if (isOpen()) {
        <div class="absolute right-0 mt-2 w-80 bg-card rounded-lg shadow-lg border overflow-hidden z-50 animate-slide-down">
          <div class="p-3 border-b border-border flex items-center justify-between">
             <h3 class="font-bold text-sm">Notificaciones</h3>
             @if (notifications().length > 0) {
                <button (click)="markAllAsRead()" class="text-xs text-primary font-medium hover:underline">Marcar todo como leído</button>
             }
          </div>

          <div class="max-h-[400px] overflow-y-auto">
             @for (n of notifications(); track n.id) {
                <div class="p-3 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer group relative"
                     [class.bg-primary/5]="!n.isRead"
                     (click)="handleNotificationClick(n)">
                   
                   <div class="flex gap-3">
                      <!-- Icon by Type -->
                      <div class="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center"
                           [class.bg-primary/10]="n.type === 'CHAT'"
                           [class.text-primary]="n.type === 'CHAT'"
                           [class.bg-green-100]="n.type === 'PROJECT_UPDATE'"
                           [class.text-green-600]="n.type === 'PROJECT_UPDATE'"
                           [class.dark:bg-green-900/20]="n.type === 'PROJECT_UPDATE'"
                           [class.bg-amber-100]="n.type === 'TASK_ASSIGNED'"
                           [class.text-amber-600]="n.type === 'TASK_ASSIGNED'"
                           [class.dark:bg-amber-900/20]="n.type === 'TASK_ASSIGNED'">
                         
                         @if (n.type === 'CHAT') {
                           <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                         } @else if (n.type === 'PROJECT_UPDATE') {
                           <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                         } @else {
                           <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                         }
                      </div>

                      <div class="flex-1 min-w-0 pr-4">
                         <p class="text-sm font-medium truncate">{{ n.title }}</p>
                         <p class="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{{ n.message }}</p>
                         <p class="text-[10px] text-muted-foreground mt-1 font-medium">{{ n.createdAt | date:'short' }}</p>
                      </div>
                   </div>

                   <!-- Actions -->
                   <div class="absolute top-3 right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button (click)="$event.stopPropagation(); deleteNotification(n.id)" class="text-muted-foreground hover:text-destructive p-1">
                         <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                   </div>
                   
                   @if (!n.isRead) {
                      <div class="absolute top-1/2 -translate-y-1/2 right-3 h-2 w-2 bg-primary rounded-full group-hover:hidden"></div>
                   }
                </div>
             } @empty {
                <div class="py-10 flex flex-col items-center justify-center text-center px-6">
                   <div class="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-3">
                      <svg class="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                   </div>
                   <p class="text-muted-foreground text-sm font-medium">No tienes notificaciones pendientes.</p>
                </div>
             }
          </div>
          
          @if (notifications().length > 0) {
            <div class="p-2.5 bg-muted/50 text-center border-t border-border">
               <button class="text-xs font-medium text-muted-foreground hover:text-foreground">Ver todas las notificaciones</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: []
})
export class NotificationComponent {
  dataService = inject(DataService);

  isOpen = signal(false);
  notifications = this.dataService.allNotifications;
  unreadCount = this.dataService.unreadNotificationsCount;

  toggleDropdown() {
    this.isOpen.set(!this.isOpen());
  }

  handleNotificationClick(n: AppNotification) {
    this.dataService.markNotificationAsRead(n.id);
    this.isOpen.set(false);

    if (n.linkId) {
      this.dataService.goToDetail(n.linkId);
    }
  }

  markAllAsRead() {
    this.dataService.markAllNotificationsAsRead();
  }

  deleteNotification(id: number) {
    this.dataService.deleteNotification(id);
  }
}
