import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TopNavComponent } from '../../shared/components/layout/top-nav/top-nav.component';
import { SideNavComponent } from '../../shared/components/layout/side-nav/side-nav.component';
import { ToastComponent } from '../../shared/components/layout/toast/toast.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TopNavComponent, SideNavComponent, ToastComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent implements OnInit {
  isSideNavCollapsed: boolean = false;
  isMobileView: boolean = false;
  isSideNavOpen: boolean = false;
  isSmallScreen: boolean = false;

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isMobileView = window.innerWidth < 1024;
    this.isSmallScreen = window.innerWidth < 640;

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
}
