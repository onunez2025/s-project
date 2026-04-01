import { Component, ElementRef, HostListener, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AppItem {
  id: string;
  name: string;
  url: string;
  logo: string;
}

@Component({
  selector: 'app-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block">
      <button 
        (click)="toggle()"
        class="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center"
        title="Ecosistema de Aplicaciones"
        type="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>
      </button>

      @if (isOpen()) {
        <div class="absolute right-0 mt-2 w-[432px] bg-white dark:bg-slate-950 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div class="p-5 border-b border-black/5 dark:border-white/5 bg-[#2563EB]">
            <h3 class="text-base font-bold text-white tracking-tight">Más aplicaciones</h3>
          </div>
          <div class="p-4 grid grid-cols-2 gap-4">
            @for (app of otherApps; track app.id) {
              <a [href]="app.url"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="group relative flex flex-col items-center justify-center p-6 rounded-xl hover:bg-blue-600/10 dark:hover:bg-blue-500/10 transition-all duration-500 border border-transparent hover:border-blue-200/50 dark:hover:border-blue-800/30 hover:shadow-[0_8px_30px_rgb(37,99,235,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                
                <!-- Glow Effect Background -->
                <div class="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                
                <div class="relative w-20 h-20 mb-3 flex items-center justify-center overflow-hidden drop-shadow-md group-hover:scale-110 group-hover:drop-shadow-[0_15px_25px_rgba(37,99,235,0.4)] transition-all duration-500 ease-out">
                  <img [src]="app.logo" [alt]="app.name + ' logo'" class="w-full h-full object-contain">
                </div>
                <span class="relative text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-center">
                  {{ app.name }}
                </span>
              </a>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class AppSwitcherComponent {
  @Input() currentAppId: string = 's-project';
  
  isOpen = signal(false);

  apps: AppItem[] = [
    { id: 's-project', name: 'S-Project', url: 'https://gac-sole-sproject.jppsfv.easypanel.host/', logo: '/ecosystem-logos/s-project.png' },
    { id: 'gestor-fsm', name: 'Gestor FSM', url: 'https://gac-sole-gestor-de-tickets-fsm.jppsfv.easypanel.host/', logo: '/ecosystem-logos/gestor-fsm.png' },
    { id: 'liquidaciones', name: 'Liquidaciones', url: 'https://gac-sole-liquidaciones.jppsfv.easypanel.host/', logo: '/ecosystem-logos/liquidaciones.png' },
    { id: 'tablero-control', name: 'Tablero Control', url: 'https://gac-sole-tablero-control.jppsfv.easypanel.host/', logo: '/ecosystem-logos/tablero-control.png' },
    { id: 'ebm', name: 'EBM', url: 'https://gac-sole-ebm.jppsfv.easypanel.host/', logo: '/ecosystem-logos/ebm.png' }
  ];

  get otherApps() {
    return this.apps.filter(app => app.id !== this.currentAppId);
  }

  constructor(private elementRef: ElementRef) {}

  toggle() {
    this.isOpen.update(v => !v);
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
