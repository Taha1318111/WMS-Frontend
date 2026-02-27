import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  isCollapsed = false;
  
  @Output() collapsedChange = new EventEmitter<boolean>();

  // Helper method to check if a route is active
  isActive(route: string): boolean {
    return window.location.pathname.includes(route);
  }

  // Method to toggle sidebar - FIXED: Added emit
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed); // THIS WAS MISSING
  }

  // Method to close sidebar on mobile - FIXED: Added emit
  closeSidebar() {
    if (window.innerWidth < 1024) {
      this.isCollapsed = true;
      this.collapsedChange.emit(this.isCollapsed); // THIS WAS MISSING
    }
  }
}