import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Dashboard } from '../../../core/models/dashboard.model';
import { UserRole } from '../../../core/models/user.model';
import { CreateDashboardModalComponent } from '../create-dashboard-modal/create-dashboard-modal.component';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, CreateDashboardModalComponent],
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css'],
})
export class SideNavComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Output() toggle = new EventEmitter<void>();

  companyLogo: string | null = null;
  fallbackLogo: string =
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%233b82f6" width="100" height="100"/><text x="50" y="50" font-size="40" fill="white" text-anchor="middle" dy=".3em">MC</text></svg>';
  currentUserRole: UserRole = UserRole.SuperAdmin;

  showCreateDashboardModal: boolean = false;

  dashboards: Dashboard[] = [
    {
      id: '1',
      name: 'Social Media Overview',
      companyId: 'company-1',
      createdBy: 'user-1',
      widgets: [],
      isDefault: true,
      icon: '📊',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Facebook Analytics',
      companyId: 'company-1',
      createdBy: 'user-1',
      widgets: [],
      isDefault: false,
      icon: '📘',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'YouTube Metrics',
      companyId: 'company-1',
      createdBy: 'user-1',
      widgets: [],
      isDefault: false,
      icon: '📹',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  activeDashboardId: string = '1';

  constructor(private router: Router) {}

  ngOnInit(): void {}

  isSuperAdmin(): boolean {
    return this.currentUserRole === UserRole.SuperAdmin;
  }

  selectDashboard(dashboardId: string): void {
    this.activeDashboardId = dashboardId;
    this.router.navigate(['/dashboard', dashboardId]);
  }

  addNewDashboard(): void {
    if (this.isSuperAdmin()) {
      this.showCreateDashboardModal = true;
    }
  }

  onDashboardCreated(data: { name: string; description: string; icon: string }): void {
    const newDashboard: Dashboard = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      icon: data.icon,
      companyId: 'company-1',
      createdBy: 'user-1',
      widgets: [],
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dashboards.push(newDashboard);
    this.showCreateDashboardModal = false;
    this.selectDashboard(newDashboard.id);
  }

  uploadLogo(event: Event): void {
    if (!this.isSuperAdmin()) return;

    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.companyLogo = e.target.result as string;
          console.log('Logo uploaded:', file.name);
        }
      };

      reader.readAsDataURL(file);
    }
  }

  toggleSidebar(): void {
    this.toggle.emit();
  }
}
