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
        <div class="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0F172A]/95 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div class="p-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-[#1E293B]/50">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-200">Más aplicaciones</h3>
          </div>
          <div class="p-3 grid grid-cols-2 gap-2">
            @for (app of otherApps; track app.id) {
              <a [href]="app.url"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="group flex flex-col items-center justify-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-inner transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-600/50">
                <div class="w-12 h-12 mb-2 flex items-center justify-center overflow-hidden drop-shadow-md group-hover:scale-110 group-hover:drop-shadow-xl transition-transform duration-300">
                  <img [src]="app.logo" [alt]="app.name + ' logo'" class="w-full h-full object-contain">
                </div>
                <span class="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-center">
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
