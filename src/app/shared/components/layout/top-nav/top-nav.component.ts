import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopNavComponent implements OnInit, OnDestroy {
  @Output() menuToggle = new EventEmitter<void>();

  isDark$!: Observable<boolean>;
  showUserMenu = false;
  isMobile = false;

  userName = 'John Doe';
  userRole = 'SuperAdmin';
  get userInitials(): string {
    return this.userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  constructor(
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isDark$ = this.themeService.isDark$;
    this.checkMobile();
  }

  ngOnDestroy(): void {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.cdr.markForCheck();
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
    this.cdr.markForCheck();
  }

  navigateToProfile(): void {
    this.closeUserMenu();
    this.router.navigate(['/profile']);
  }

  navigateToSettings(): void {
    this.closeUserMenu();
    this.router.navigate(['/settings']);
  }

  signOut(): void {
    this.closeUserMenu();
    // In a real app: call AuthService.signOut() then redirect
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.tn-user-btn') && !target.closest('.tn-dropdown')) {
      if (this.showUserMenu) {
        this.showUserMenu = false;
        this.cdr.markForCheck();
      }
    }
  }

  @HostListener('window:resize')
  checkMobile(): void {
    this.isMobile = window.innerWidth < 640;
    this.cdr.markForCheck();
  }
}
