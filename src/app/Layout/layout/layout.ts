import { Component, OnInit } from '@angular/core'; // Removed EventEmitter from here
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { CommonModule } from '@angular/common'; // Add this for *ngIf if needed

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, CommonModule], // Added CommonModule
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class Layout implements OnInit {
  userName: string = '';
  isSidebarCollapsed = false;

  onSidebarToggled(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
    console.log('Sidebar collapsed state:', collapsed); // Add for debugging
  }

  ngOnInit() {
    // Get user name from localStorage or a service
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.userName = user.name || 'User';
    } else {
      this.userName = 'Guest';
    }
  }

  getUserInitials(): string {
    return this.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}