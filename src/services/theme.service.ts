
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
        // Always set to light
        this.theme.set('light');
    }

    private applyTheme(theme: Theme) {
        document.documentElement.classList.remove('dark');
    }
}
