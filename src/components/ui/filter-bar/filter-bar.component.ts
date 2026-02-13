import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Area, User } from '../../../services/data.service';

export interface FilterState {
    searchText: string;
    status: string[];
    areaId: number | null;
    userId: number | null;
}

@Component({
    selector: 'app-filter-bar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="bg-white border-b border-slate-200 px-6 py-3 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0 z-20">
      
      <!-- Search -->
      <div class="relative w-full md:w-64">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          [(ngModel)]="searchText"
          (ngModelChange)="onSearchChange($event)"
          placeholder="Buscar proyectos..." 
          class="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
        >
      </div>

      <!-- Filters Group -->
      <div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        
        <!-- Status Filter -->
        <div class="relative group">
            <button class="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Estado</span>
                <span *ngIf="selectedStatus.length > 0" class="ml-1 bg-blue-100 text-blue-800 text-xs font-bold px-1.5 rounded-full">{{ selectedStatus.length }}</span>
            </button>
            <!-- Dropdown -->
            <div class="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg hidden group-hover:block z-50 p-2">
                <div class="flex flex-col gap-1">
                    <label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">
                        <input type="checkbox" [checked]="selectedStatus.includes('PLANIFICACION')" (change)="toggleStatus('PLANIFICACION')" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                        <span class="text-sm text-slate-600">Planificación</span>
                    </label>
                    <label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">
                        <input type="checkbox" [checked]="selectedStatus.includes('EN_PROCESO')" (change)="toggleStatus('EN_PROCESO')" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                        <span class="text-sm text-slate-600">En Proceso</span>
                    </label>
                    <label class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">
                        <input type="checkbox" [checked]="selectedStatus.includes('FINALIZADO')" (change)="toggleStatus('FINALIZADO')" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                        <span class="text-sm text-slate-600">Finalizado</span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Area Filter -->
        <div class="relative">
            <select 
                [(ngModel)]="selectedAreaId" 
                (change)="emitFilters()"
                class="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
                <option [ngValue]="null">Todas las Áreas</option>
                <option *ngFor="let area of areas()" [ngValue]="area.id">{{ area.name }}</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>

        <!-- User Filter -->
        <div class="relative">
            <select 
                [(ngModel)]="selectedUserId" 
                (change)="emitFilters()"
                class="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[150px]">
                <option [ngValue]="null">Todos los Responsables</option>
                <option *ngFor="let user of users()" [ngValue]="user.id">{{ user.name }}</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>

        <!-- Clear Button -->
        <button *ngIf="hasActiveFilters()" (click)="clearFilters()" class="text-sm text-red-500 hover:text-red-700 font-medium px-2">
            Limpiar
        </button>

      </div>
    </div>
  `
})
export class FilterBarComponent {
    areas = input.required<Area[]>();
    users = input.required<User[]>();
    filtersChanged = output<FilterState>();

    searchText = '';
    selectedStatus: string[] = [];
    selectedAreaId: number | null = null;
    selectedUserId: number | null = null;

    private searchDebounce: any;

    onSearchChange(val: string) {
        this.searchText = val;
        clearTimeout(this.searchDebounce);
        this.searchDebounce = setTimeout(() => {
            this.emitFilters();
        }, 300);
    }

    toggleStatus(status: string) {
        if (this.selectedStatus.includes(status)) {
            this.selectedStatus = this.selectedStatus.filter(s => s !== status);
        } else {
            this.selectedStatus.push(status);
        }
        this.emitFilters();
    }

    clearFilters() {
        this.searchText = '';
        this.selectedStatus = [];
        this.selectedAreaId = null;
        this.selectedUserId = null;
        this.emitFilters();
    }

    hasActiveFilters() {
        return this.searchText || this.selectedStatus.length > 0 || this.selectedAreaId || this.selectedUserId;
    }

    emitFilters() {
        this.filtersChanged.emit({
            searchText: this.searchText,
            status: this.selectedStatus,
            areaId: this.selectedAreaId,
            userId: this.selectedUserId
        });
    }
}
