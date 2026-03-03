/**
 * main-layout.component.ts
 * Adds canvas-based meteor shower animation (dark mode only).
 * All original sidebar logic unchanged.
 */
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { TopNavComponent } from '../../shared/components/layout/top-nav/top-nav.component';
import { SideNavComponent } from '../../shared/components/layout/side-nav/side-nav.component';
import { ToastComponent } from '../../shared/components/layout/toast/toast.component';
import { Subscription } from 'rxjs';

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  maxOpacity: number;
  width: number;
  phase: 'fade-in' | 'travel' | 'fade-out' | 'dead';
  life: number;
  maxLife: number;
  color: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TopNavComponent, SideNavComponent, ToastComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('meteorCanvas') meteorCanvasRef!: ElementRef<HTMLCanvasElement>;

  isSideNavCollapsed = false;
  isMobileView = false;
  isSideNavOpen = false;

  private meteors: Meteor[] = [];
  private rafId = 0;
  private ctx!: CanvasRenderingContext2D;
  private isDark = true;
  private themeSub?: Subscription;
  private resizeBound = () => this.onResize();

  constructor(
    public themeService: ThemeService,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.themeSub = this.themeService.isDark$.subscribe((dark) => {
      this.isDark = dark;
      if (!dark) this.stopMeteors();
      else this.startMeteors();
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.meteorCanvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeBound);
    if (this.isDark) this.startMeteors();
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
    this.stopMeteors();
    window.removeEventListener('resize', this.resizeBound);
  }

  // ── Sidebar logic (unchanged) ──────────────────────────────────────────────
  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
    this.resizeCanvas();
  }

  checkScreenSize(): void {
    this.isMobileView = window.innerWidth < 1024;
    if (!this.isMobileView) {
      this.isSideNavOpen = true;
      this.isSideNavCollapsed = false;
    } else {
      this.isSideNavOpen = false;
    }
  }

  toggleSideNav(): void {
    if (this.isMobileView) {
      this.isSideNavOpen = !this.isSideNavOpen;
    } else {
      this.isSideNavCollapsed = !this.isSideNavCollapsed;
    }
  }

  // ── Meteor canvas ─────────────────────────────────────────────────────────
  private resizeCanvas(): void {
    const canvas = this.meteorCanvasRef?.nativeElement;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private spawnMeteor(): Meteor {
    const angle = 15 + Math.random() * 10; // 15-25° diagonal
    const rad = (angle * Math.PI) / 180;
    const speed = 6 + Math.random() * 10;
    const maxLife = 60 + Math.random() * 80;
    const colors = ['#ffffff', '#00c8ff', '#a78bfa', '#67e8f9'];

    return {
      x: Math.random() * window.innerWidth * 1.3,
      y: -50 - Math.random() * 200,
      vx: Math.cos(rad) * speed,
      vy: Math.sin(rad) * speed,
      length: 60 + Math.random() * 120,
      opacity: 0,
      maxOpacity: 0.5 + Math.random() * 0.5,
      width: 0.5 + Math.random() * 1.5,
      phase: 'fade-in',
      life: 0,
      maxLife,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  }

  private startMeteors(): void {
    if (this.rafId) return;
    this.meteors = Array.from({ length: 8 }, () => {
      const m = this.spawnMeteor();
      m.life = Math.random() * m.maxLife; // stagger initial positions
      return m;
    });
    this.ngZone.runOutsideAngular(() => this.animateMeteors());
  }

  private stopMeteors(): void {
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    if (this.ctx) {
      const canvas = this.meteorCanvasRef?.nativeElement;
      if (canvas) this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  private animateMeteors(): void {
    const canvas = this.meteorCanvasRef?.nativeElement;
    if (!canvas || !this.ctx || !this.isDark) {
      this.rafId = 0;
      return;
    }

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < this.meteors.length; i++) {
      const m = this.meteors[i];
      m.life++;
      m.x += m.vx;
      m.y += m.vy;

      // Phase transitions
      const fadeFrames = 12;
      if (m.phase === 'fade-in') {
        m.opacity = Math.min(m.maxOpacity, m.opacity + m.maxOpacity / fadeFrames);
        if (m.opacity >= m.maxOpacity) m.phase = 'travel';
      } else if (m.phase === 'travel') {
        if (m.life > m.maxLife * 0.72) m.phase = 'fade-out';
      } else if (m.phase === 'fade-out') {
        m.opacity = Math.max(0, m.opacity - m.maxOpacity / fadeFrames);
        if (m.opacity <= 0) m.phase = 'dead';
      }

      // Respawn dead or out-of-bounds meteors
      if (m.phase === 'dead' || m.x > canvas.width + 200 || m.y > canvas.height + 200) {
        this.meteors[i] = this.spawnMeteor();
        continue;
      }

      // Draw meteor: trailing gradient line
      const tailX = m.x - Math.cos((25 * Math.PI) / 180) * m.length;
      const tailY = m.y - Math.sin((25 * Math.PI) / 180) * m.length;

      const grad = this.ctx.createLinearGradient(tailX, tailY, m.x, m.y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(
        0.6,
        m.color +
          Math.round(m.opacity * 0.4 * 255)
            .toString(16)
            .padStart(2, '0'),
      );
      grad.addColorStop(
        1,
        m.color +
          Math.round(m.opacity * 255)
            .toString(16)
            .padStart(2, '0'),
      );

      this.ctx.beginPath();
      this.ctx.moveTo(tailX, tailY);
      this.ctx.lineTo(m.x, m.y);
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = m.width;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();

      // Bright head dot
      this.ctx.beginPath();
      this.ctx.arc(m.x, m.y, m.width * 1.2, 0, Math.PI * 2);
      this.ctx.fillStyle =
        m.color +
        Math.round(m.opacity * 255)
          .toString(16)
          .padStart(2, '0');
      this.ctx.fill();
    }

    this.rafId = requestAnimationFrame(() => this.animateMeteors());
  }
}
