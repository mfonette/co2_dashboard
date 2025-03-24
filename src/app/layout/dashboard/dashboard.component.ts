import { Component, HostListener} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  isSidebarExpanded = window.innerWidth > 768;
  private mobileBreakpoint = 768;

  constructor() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const isMobile = window.innerWidth <= this.mobileBreakpoint;
    const wasExpanded = this.isSidebarExpanded;
    
    if (isMobile && wasExpanded) {
      this.isSidebarExpanded = false;
    } else if (!isMobile && !wasExpanded) {
      this.isSidebarExpanded = true;
    }
  }

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }
}
