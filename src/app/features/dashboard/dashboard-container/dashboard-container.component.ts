import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold mb-4">Dashboard Container</h1>
      <p class="text-gray-600">This is a placeholder for the main dashboard content.</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-semibold mb-2">Count Box 1</h3>
          <p class="text-2xl font-bold text-blue-600">1,234</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-semibold mb-2">Count Box 2</h3>
          <p class="text-2xl font-bold text-green-600">5,678</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="font-semibold mb-2">Count Box 3</h3>
          <p class="text-2xl font-bold text-purple-600">9,012</p>
        </div>
      </div>
    </div>
  `,
})
export class DashboardContainerComponent {}
