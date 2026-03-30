
import { Component, inject, input, signal, computed, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, ProjectMessage } from '../../services/data.service';

@Component({
    selector: 'app-project-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="flex flex-col h-[600px] bg-card rounded-lg shadow-sm border border-border overflow-hidden font-sans">
      <!-- Chat Header -->
      <div class="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
         <div class="flex items-center gap-3">
            <div class="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground shadow-sm">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            </div>
            <div>
               <h3 class="font-black text-foreground text-[11px] uppercase tracking-widest leading-tight">Canal de Comunicación</h3>
               <p class="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter italic">Privado • Solo Miembros del Proyecto</p>
            </div>
         </div>
         <span class="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/20">
            {{ messages().length }} Mensajes
         </span>
      </div>

      <!-- Messages List -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-background/50" #scrollContainer>
         @for (msg of messages(); track msg.id) {
            <div class="flex gap-3 group" [class.flex-row-reverse]="isMyMessage(msg)">
               <!-- Avatar -->
               <div class="shrink-0 mt-1">
                  <img [src]="getUserAvatar(msg.userId)" class="h-8 w-8 rounded-full border border-border shadow-sm ring-2 ring-background">
               </div>
               
               <!-- Message Bubble -->
               <div class="max-w-[75%] space-y-1.5">
                  <div class="flex items-center gap-2 px-1" [class.justify-end]="isMyMessage(msg)">
                     <span class="text-[10px] font-black text-foreground uppercase tracking-tighter">{{ getUserName(msg.userId) }}</span>
                     <span class="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">{{ formatTime(msg.createdAt) }}</span>
                  </div>
                  
                  <div class="p-3.5 rounded-lg shadow-sm text-xs leading-relaxed font-medium transition-all"
                       [class.bg-primary]="isMyMessage(msg)"
                       [class.text-primary-foreground]="isMyMessage(msg)"
                       [class.rounded-tr-none]="isMyMessage(msg)"
                       [class.bg-card]="!isMyMessage(msg)"
                       [class.text-foreground]="!isMyMessage(msg)"
                       [class.border]="!isMyMessage(msg)"
                       [class.border-border]="!isMyMessage(msg)"
                       [class.rounded-tl-none]="!isMyMessage(msg)">
                     {{ msg.content }}
                  </div>
               </div>

               <!-- Delete Button (Only for own messages or Admin) -->
               @if (isMyMessage(msg) || dataService.currentUser()?.role === 'ADMIN') {
                  <button (click)="deleteMessage(msg.id)" class="opacity-0 group-hover:opacity-100 self-end mb-1 text-muted-foreground hover:text-destructive p-1.5 transition-all transform hover:scale-110" title="Eliminar mensaje">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
               }
            </div>
         } @empty {
            <div class="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
               <div class="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground border border-border/50 animate-pulse">
                  <svg class="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
               </div>
               <div class="max-w-[200px]">
                  <p class="font-black text-foreground text-[11px] uppercase tracking-widest mb-1">Silencio en el Canal</p>
                  <p class="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter leading-tight">Sé el primero en iniciar la conversación estratégica sobre este proyecto.</p>
               </div>
            </div>
         }
      </div>

      <!-- Message Input -->
      <div class="p-5 bg-card border-t border-border">
         <form (ngSubmit)="sendMessage()" class="flex items-center gap-3">
            <input type="text" [(ngModel)]="newMessage" name="newMessage"
                   placeholder="ESCRIBE UN MENSAJE..."
                   class="flex-1 px-4 py-3 bg-muted/30 border border-border rounded-md text-[11px] placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground font-black uppercase tracking-widest">
            <button type="submit" [disabled]="!newMessage().trim()"
                    class="h-[42px] px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-lg shadow-primary/20 flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale disabled:shadow-none group">
               <svg class="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
         </form>
      </div>
    </div>
  `,
    styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary) / 0.5); }
  `]
})
export class ProjectChatComponent {
    projectId = input.required<number>();
    dataService = inject(DataService);

    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    newMessage = signal('');

    messages = computed(() => this.dataService.getMessagesByProject(this.projectId()));

    constructor() {
        // Auto-scroll to bottom when new messages arrive
        effect(() => {
            if (this.messages().length > 0) {
                setTimeout(() => this.scrollToBottom(), 50);
            }
        });
    }

    isMyMessage(msg: ProjectMessage) {
        return msg.userId === this.dataService.currentUser()?.id;
    }

    getUserName(id: number) {
        return this.dataService.getUserById(id)?.name || 'Usuario';
    }

    getUserAvatar(id: number) {
        return this.dataService.getUserById(id)?.avatar || 'https://i.pravatar.cc/150';
    }

    formatTime(isoStr: string) {
        const date = new Date(isoStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    async sendMessage() {
        if (!this.newMessage().trim()) return;
        const content = this.newMessage().trim();
        this.newMessage.set('');
        await this.dataService.addMessage(this.projectId(), content);
    }

    async deleteMessage(id: number) {
        if (confirm('¿Eliminar este mensaje?')) {
            await this.dataService.deleteMessage(id);
        }
    }

    private scrollToBottom() {
        if (this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }
    }
}
