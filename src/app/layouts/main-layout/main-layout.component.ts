import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TopNavComponent } from '../../shared/components/top-nav/top-nav.component';
import { SideNavComponent } from '../../shared/components/side-nav/side-nav.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

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

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
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

  getSidebarClasses(): string {
    if (this.isMobileView) {
      // Mobile: fixed overlay sidebar
      return `fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 
              z-50 transition-transform duration-300 ease-in-out ${
                this.isSideNavOpen ? 'translate-x-0' : '-translate-x-full'
              }`;
    } else {
      // Desktop: relative sidebar with collapse
      return `relative h-full bg-gradient-to-b from-gray-900 to-gray-800 flex-shrink-0
              transition-all duration-300 ease-in-out ${this.isSideNavCollapsed ? 'w-20' : 'w-64'}`;
    }
  }
}
