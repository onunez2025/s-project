
import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    theme = signal<Theme>('light');

    constructor() {
        this.loadTheme();
        effect(() => {
            this.applyTheme(this.theme());
            localStorage.setItem('sole_sprojects_theme', this.theme());
        });
    }

    toggleTheme() {
        this.theme.update(current => current === 'light' ? 'dark' : 'light');
    }

    private loadTheme() {
        const saved = localStorage.getItem('sole_sprojects_theme') as Theme | null;
        if (saved === 'dark' || saved === 'light') {
            this.theme.set(saved);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.theme.set(prefersDark ? 'dark' : 'light');
        }
    }

    private applyTheme(theme: Theme) {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }
}
