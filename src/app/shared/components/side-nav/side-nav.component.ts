import { DashboardTemplatesModalComponent, DashboardTemplate } from '../dashboard-templates-modal/dashboard-templates-modal.component';
import { DashboardMenuModalComponent } from '../dashboard-menu-modal/dashboard-menu-modal.component';

// Add to imports array
imports: [CommonModule, RouterLink, RouterLinkActive, CreateDashboardModalComponent, DashboardTemplatesModalComponent, DashboardMenuModalComponent],

// Add properties
showTemplatesModal: boolean = false;
showDashboardMenu: boolean = false;
selectedDashboardForMenu: Dashboard | null = null;

// Update addNewDashboard method
addNewDashboard(): void {
  if (this.isSuperAdmin()) {
    this.showTemplatesModal = true;
  }
}

// Add new methods
onTemplateSelected(template: DashboardTemplate | null): void {
  this.showTemplatesModal = false;
  
  if (!template) return;

  const newDashboard: Dashboard = {
    id: Date.now().toString(),
    name: template.name,
    description: `Created from ${template.name} template`,
    icon: template.icon,
    companyId: 'company-1',
    createdBy: 'user-1',
    widgets: template.widgets.map((w, i) => ({
      widgetId: `widget-${Date.now()}-${i}`,
      type: w.type as any,
      ...w
    })),
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  this.dashboards.push(newDashboard);
  this.selectDashboard(newDashboard.id);
}

openDashboardMenu(dashboard: Dashboard, event: MouseEvent): void {
  event.stopPropagation();
  this.selectedDashboardForMenu = dashboard;
  this.showDashboardMenu = true;
}

onDashboardRename(data: { name: string; icon: string }): void {
  if (this.selectedDashboardForMenu) {
    this.selectedDashboardForMenu.name = data.name;
    this.selectedDashboardForMenu.icon = data.icon;
    this.selectedDashboardForMenu.updatedAt = new Date();
  }
  this.showDashboardMenu = false;
}

onDashboardDuplicate(): void {
  if (this.selectedDashboardForMenu) {
    const duplicated: Dashboard = {
      ...this.selectedDashboardForMenu,
      id: Date.now().toString(),
      name: `${this.selectedDashboardForMenu.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.dashboards.push(duplicated);
    this.selectDashboard(duplicated.id);
  }
}

onDashboardShare(): void {
  if (this.selectedDashboardForMenu) {
    const shareUrl = `${window.location.origin}/dashboard/${this.selectedDashboardForMenu.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(`Dashboard link copied to clipboard!\n\n${shareUrl}`);
    });
  }
  this.showDashboardMenu = false;
}

onDashboardDelete(): void {
  if (this.selectedDashboardForMenu) {
    this.dashboards = this.dashboards.filter(d => d.id !== this.selectedDashboardForMenu!.id);
    if (this.activeDashboardId === this.selectedDashboardForMenu.id && this.dashboards.length > 0) {
      this.selectDashboard(this.dashboards[0].id);
    }
  }
}