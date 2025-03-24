import { CommonModule } from '@angular/common';
import { Component,Input, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isExpanded = true;

  menuItems = [
    { icon: 'show_chart', label: 'Time Series', link: '/time-series' },
    { icon: 'bar_chart', label: 'Regional Comparison', link: '/regional-comparison' },
    { icon: 'stacked_bar_chart', label: 'Top/Bottom Emitters', link: '/top-bottom-emitters' }
  ];
  

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (window.innerWidth <= 768 && (event.target as HTMLElement).closest('.nav-link')) {
      setTimeout(() => {
        this.isExpanded = false;
      }, 150);
    }
  }
}
