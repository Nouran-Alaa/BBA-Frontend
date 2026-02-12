import {
  Component,
  Output,
  EventEmitter,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css'],
})
export class TopNavComponent {
  @Output() menuToggle = new EventEmitter<void>();
  @ViewChild('profileDropdown') profileDropdown?: ElementRef;

  isProfileMenuOpen = false;

  // Mock user data - replace with real auth service later
  currentUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'SuperAdmin',
    profileImage: 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff',
  };

  constructor(private router: Router) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isProfileMenuOpen && this.profileDropdown) {
      const clickedInside = this.profileDropdown.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.closeProfileMenu();
      }
    }
  }

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeProfileMenu();
  }

  logout(): void {
    // TODO: Implement real logout logic with auth service
    console.log('Logging out...');
    this.router.navigate(['/login']);
    this.closeProfileMenu();
  }
}
