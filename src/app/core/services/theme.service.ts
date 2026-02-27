import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type Theme = 'cupcake' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly STORAGE_KEY = 'theme';

  readonly darkMode = signal(false);

  constructor() {
    if (this.isBrowser) {
      const saved = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
      if (saved === 'dark') {
        this.darkMode.set(true);
        this.applyTheme('dark');
      }
    }
  }

  toggle(): void {
    const newDark = !this.darkMode();
    this.darkMode.set(newDark);
    const theme: Theme = newDark ? 'dark' : 'cupcake';
    this.applyTheme(theme);
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }

  setTheme(theme: 'cupcake' | 'dark'): void {
    const isDark = theme === 'dark';
    this.darkMode.set(isDark);
    this.applyTheme(theme);
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }

  private applyTheme(theme: Theme): void {
    if (this.isBrowser) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
}
