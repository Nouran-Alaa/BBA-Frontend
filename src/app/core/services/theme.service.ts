/**
 * theme.service.ts
 * ONE change only: added `isDark$` observable derived from existing BehaviorSubject.
 * All original code preserved exactly.
 */
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme = new BehaviorSubject<'light' | 'dark'>('light');
  theme$ = this.currentTheme.asObservable();

  // ── ADD THIS: boolean stream for chart re-rendering on theme toggle ────────
  readonly isDark$: Observable<boolean> = this.currentTheme.pipe(map((t) => t === 'dark'));
  // ─────────────────────────────────────────────────────────────────────────

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (systemDark ? 'dark' : 'light');
    this.setTheme(initial);
  }

  get isDark(): boolean {
    return this.currentTheme.value === 'dark';
  }

  setTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);

    if (theme === 'dark') {
      document.body.style.background = `
        radial-gradient(ellipse 65% 45% at 12% 18%, rgba(0,200,255,0.09) 0%, transparent 55%),
        radial-gradient(ellipse 55% 40% at 88% 80%, rgba(0,229,204,0.07) 0%, transparent 55%),
        #080e1f`;
    } else {
      document.body.style.background = `
        radial-gradient(ellipse 65% 45% at 12% 18%, rgba(0,188,212,0.12) 0%, transparent 58%),
        radial-gradient(ellipse 55% 40% at 88% 80%, rgba(76,175,80,0.08) 0%, transparent 55%),
        #e8f2f8`;
    }

    this.currentTheme.next(theme);
    localStorage.setItem('theme', theme);
  }

  toggleTheme(): void {
    this.setTheme(this.isDark ? 'light' : 'dark');
  }
}
