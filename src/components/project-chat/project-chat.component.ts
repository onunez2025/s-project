
import { Component, inject, input, signal, computed, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, ProjectMessage } from '../../services/data.service';

@Component({
    selector: 'app-project-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <!-- Chat Header -->
      <div class="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
         <div class="flex items-center gap-2">
            <div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            </div>
            <div>
               <h3 class="font-bold text-slate-800 text-sm uppercase tracking-wide">Conversaciones del Equipo</h3>
               <p class="text-[10px] text-slate-500 font-medium">Solo visible para miembros del proyecto</p>
            </div>
         </div>
         <span class="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">
            {{ messages().length }} Mensajes
         </span>
      </div>

      <!-- Messages List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/20" #scrollContainer>
         @for (msg of messages(); track msg.id) {
            <div class="flex gap-3" [class.flex-row-reverse]="isMyMessage(msg)">
               <!-- Avatar -->
               <img [src]="getUserAvatar(msg.userId)" class="h-8 w-8 rounded-full border border-slate-200 mt-1 flex-shrink-0">
               
               <!-- Message Bubble -->
               <div class="max-w-[80%] space-y-1">
                  <div class="flex items-center gap-2" [class.justify-end]="isMyMessage(msg)">
                     <span class="text-[10px] font-bold text-slate-600">{{ getUserName(msg.userId) }}</span>
                     <span class="text-[9px] text-slate-400">{{ formatTime(msg.createdAt) }}</span>
                  </div>
                  
                  <div class="p-3 rounded-2xl shadow-sm text-sm leading-relaxed"
                       [class.bg-blue-600]="isMyMessage(msg)"
                       [class.text-white]="isMyMessage(msg)"
                       [class.rounded-tr-none]="isMyMessage(msg)"
                       [class.bg-white]="!isMyMessage(msg)"
                       [class.text-slate-700]="!isMyMessage(msg)"
                       [class.border]="!isMyMessage(msg)"
                       [class.border-slate-100]="!isMyMessage(msg)"
                       [class.rounded-tl-none]="!isMyMessage(msg)">
                     {{ msg.content }}
                  </div>
               </div>

               <!-- Delete Button (Only for own messages or Admin) -->
               @if (isMyMessage(msg) || dataService.currentUser()?.role === 'ADMIN') {
                  <button (click)="deleteMessage(msg.id)" class="opacity-0 group-hover:opacity-100 self-center text-slate-300 hover:text-red-500 p-1 transition-all">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
               }
            </div>
         } @empty {
            <div class="h-full flex flex-col items-center justify-center text-center p-10 opacity-50">
               <div class="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
               </div>
               <p class="font-bold text-slate-600">No hay mensajes aún</p>
               <p class="text-sm text-slate-500">Sé el primero en iniciar la conversación sobre este proyecto.</p>
            </div>
         }
      </div>

      <!-- Message Input -->
      <div class="p-4 bg-white border-t border-slate-100">
         <form (ngSubmit)="sendMessage()" class="flex items-center gap-3">
            <input type="text" [(ngModel)]="newMessage" name="newMessage"
                   placeholder="Escribe un mensaje..."
                   class="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all text-slate-700 font-medium">
            <button type="submit" [disabled]="!newMessage().trim()"
                    class="h-11 w-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all disabled:opacity-50 disabled:shadow-none">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
         </form>
      </div>
    </div>
  `,
    styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
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
