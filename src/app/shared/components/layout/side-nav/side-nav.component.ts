import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { Dashboard } from '../../../../core/models/dashboard.model';
import { UserRole } from '../../../../core/models/user.model';
import { DashboardTemplatesModalComponent } from '../../modals/dashboard-templates-modal/dashboard-templates-modal.component';
import { DashboardMenuModalComponent } from '../../modals/dashboard-menu-modal/dashboard-menu-modal.component';
import {
  DashboardTemplateService,
  DashboardTemplate,
} from '../../../../core/services/dashboard-template.service';
import { DashboardStateService } from '../../../../core/services/dashboard-state.service';
import { DashboardIconService } from '../../../../core/services/dashboard-icon.service';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    DashboardTemplatesModalComponent,
    DashboardMenuModalComponent,
  ],
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css'],
})
export class SideNavComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Output() toggle = new EventEmitter<void>();

  showTemplatesModal: boolean = false;
  showDashboardMenu: boolean = false;
  selectedDashboardForMenu: Dashboard | null = null;
  companyLogo: string | null = null;
  activeMenu: string | null = null;
  fallbackLogo: string =
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%230099cc" width="100" height="100"/><text x="50" y="50" font-size="40" fill="white" text-anchor="middle" dy=".3em">MC</text></svg>';
  currentUserRole: UserRole = UserRole.SuperAdmin;

  icons = { Plus };

  showCreateDashboardModal: boolean = false;

  dashboards: Dashboard[] = [
    {
      id: '1',
      name: 'Social Media Overview',
      companyId: 'company-1',
      createdBy: 'user-1',
      widgets: [],
      isDefault: true,
      iconId: 'users',
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
      iconId: 'facebook',
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
      iconId: 'youtube',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  activeDashboardId: string = '1';

  constructor(
    private router: Router,
    private templateService: DashboardTemplateService,
    private dashboardState: DashboardStateService,
    public dashboardIconService: DashboardIconService,
  ) {}

  ngOnInit(): void {}

  isSuperAdmin(): boolean {
    return this.currentUserRole === UserRole.SuperAdmin;
  }

  // Method to get icon for template
  getDashboardIcon(iconId: string) {
    return this.dashboardIconService.getIcon(iconId);
  }

  selectDashboard(dashboardId: string): void {
    this.activeDashboardId = dashboardId;
    this.router.navigate(['/dashboard', dashboardId]);
  }

  addNewDashboard(): void {
    if (this.isSuperAdmin()) {
      this.showTemplatesModal = true;
    }
  }

  onDashboardCreated(data: { name: string; description: string; iconId: string }): void {
    const newDashboard: Dashboard = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      iconId: data.iconId,
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

  onTemplateSelected(template: DashboardTemplate | null): void {
    this.showTemplatesModal = false;

    if (!template) return;

    // Create new dashboard with unique ID
    const dashboardId = Date.now().toString();
    const newDashboard: Dashboard = {
      id: dashboardId,
      name: template.name,
      description: template.description || `Created from ${template.name} template`,
      iconId: template.iconId,
      companyId: 'company-1',
      createdBy: 'user-1',
      widgets: [],
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Creating new dashboard:', dashboardId, 'with template:', template.name);

    this.dashboards.push(newDashboard);
    this.activeDashboardId = dashboardId;

    // Set template widgets IMMEDIATELY before navigation
    if (template.widgets && template.widgets.length > 0) {
      console.log(
        'Setting template widgets:',
        template.widgets.length,
        'widgets for dashboard:',
        dashboardId,
      );
      this.templateService.setTemplateWidgets(dashboardId, template.widgets);

      // Small delay to ensure service updates before navigation
      setTimeout(() => {
        console.log('Navigating to dashboard:', dashboardId);
        this.router.navigate(['/dashboard', dashboardId]);
      }, 50);
    } else {
      // No widgets, navigate immediately
      this.router.navigate(['/dashboard', dashboardId]);
    }
  }

  openDashboardMenu(dashboard: Dashboard, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedDashboardForMenu = dashboard;
    this.showDashboardMenu = true;
  }

  onDashboardRename(data: { name: string; iconId: string }): void {
    if (this.selectedDashboardForMenu) {
      this.selectedDashboardForMenu.name = data.name;
      this.selectedDashboardForMenu.iconId = data.iconId;
      this.selectedDashboardForMenu.updatedAt = new Date();
    }
    this.showDashboardMenu = false;
  }

  onDashboardDuplicate(dashboard: Dashboard): void {
    this.onDuplicateDashboard(dashboard);
    this.activeMenu = null;
    this.showDashboardMenu = false;
  }

  onDuplicateDashboard(dashboard: Dashboard): void {
    const duplicatedDashboard: Dashboard = {
      ...dashboard,
      id: Date.now().toString(),
      name: `${dashboard.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dashboards.push(duplicatedDashboard);
    this.activeDashboardId = duplicatedDashboard.id;

    // use DashboardStateService instead of reading localStorage directly
    const originalWidgets = this.dashboardState.allDashboardsData[dashboard.id] || [];
    if (originalWidgets.length > 0) {
      console.log('Duplicating dashboard widgets:', originalWidgets);
      this.templateService.setTemplateWidgets(duplicatedDashboard.id, originalWidgets);
    }

    this.router.navigate(['/dashboard', duplicatedDashboard.id]);
  }

  onDashboardDelete(): void {
    if (this.selectedDashboardForMenu) {
      this.dashboards = this.dashboards.filter((d) => d.id !== this.selectedDashboardForMenu!.id);
      if (
        this.activeDashboardId === this.selectedDashboardForMenu.id &&
        this.dashboards.length > 0
      ) {
        this.selectDashboard(this.dashboards[0].id);
      }
    }
    this.showDashboardMenu = false;
    this.activeMenu = null;
  }
}
