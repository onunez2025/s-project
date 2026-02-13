
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
            localStorage.setItem('sole_theme_preference', this.theme());
        });
    }

    toggleTheme() {
        this.theme.update(current => current === 'light' ? 'dark' : 'light');
    }

    private loadTheme() {
        const saved = localStorage.getItem('sole_theme_preference') as Theme;
        if (saved) {
            this.theme.set(saved);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.theme.set('dark');
        }
    }

    private applyTheme(theme: Theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
}
