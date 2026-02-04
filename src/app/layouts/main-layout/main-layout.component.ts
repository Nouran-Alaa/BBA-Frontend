import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { TopNavComponent } from '../../shared/components/top-nav/top-nav.component';
import { SideNavComponent } from '../../shared/components/side-nav/side-nav.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TopNavComponent, SideNavComponent],
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

    if (this.isMobileView) {
      this.isSideNavOpen = false;
    } else {
      this.isSideNavOpen = true;
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
    const baseClasses = 'flex flex-col transition-all duration-300 ease-in-out bg-white shadow-lg';

    if (this.isMobileView) {
      return `${baseClasses} fixed top-0 left-0 h-full w-64 z-40 transform ${
        this.isSideNavOpen ? 'translate-x-0' : '-translate-x-full'
      }`;
    } else {
      return `${baseClasses} relative ${this.isSideNavCollapsed ? 'w-20' : 'w-64'}`;
    }
  }
}
