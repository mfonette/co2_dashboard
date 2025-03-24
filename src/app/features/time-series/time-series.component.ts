import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Co2Entity } from '../../core/models/co2-entity-model';
import { DataService } from '../../core/services/data.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';


import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ChartConfiguration
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);


@Component({
  selector: 'app-time-series',
  standalone: true,
  imports: [CommonModule, FormsModule,  MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatTooltipModule],
  templateUrl: './time-series.component.html',
  styleUrl: './time-series.component.scss'
})
export class TimeSeriesComponent implements OnInit, AfterViewInit {
  @ViewChild('lineCanvas', { static: false }) lineCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  allData: Co2Entity[] = [];
  entities: string[] = [];
  selectedEntities: string[] = ['World'];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.loadCSV$().subscribe(data => {
      this.allData = data;
      this.entities = [...new Set(data.map(d => d.Entity))].sort();
      if (this.chart) this.updateChart();
    });
  }
  

  ngAfterViewInit(): void {
    this.initChart();
  }

  initChart(): void {
    const canvas = this.lineCanvas?.nativeElement;
    if (!canvas) {
      console.warn('Canvas element not ready');
      return;
    }
  
    const ctx = this.lineCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: this.getChartData(),
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Per Capita CO₂ Emissions Over Time' }
        },
        scales: {
          y: { title: { display: true, text: 'Emissions (t/person)' }, beginAtZero: true },
          x: { title: { display: true, text: 'Year' } }
        }
      }
    });
  }

  onEntitySelectionChange(event: any): void {
    if (this.selectedEntities.length > 5) {
      // Remove the last selected item to cap the max at 5
      this.selectedEntities.pop();
    }
  
    this.updateChart();
  }

  updateChart(): void {
    if (!this.chart) return;

    const newData = this.getChartData();
    this.chart.data = newData;
    this.chart.update();
  }

  getChartData(): ChartConfiguration<'line'>['data'] {
    const years = [...new Set(this.allData.map(d => d.Year))].sort((a, b) => a - b);
    
    // Ensure it's always treated as an array
    const selected = Array.isArray(this.selectedEntities)
      ? this.selectedEntities
      : [this.selectedEntities];
  
    return {
      labels: years,
      datasets: selected.map(entity => {
        const data = years.map(year => {
          const match = this.allData.find(d => d.Entity === entity && d.Year === year);
          return match ? match.emissionsPerCapita : null;
        });
  
        return {
          label: entity,
          data,
          fill: false,
          borderColor: this.getColor(entity),
          tension: 0.3,
          spanGaps: true
        };
      })
    };
  }
  

  getColor(name: string): string {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `hsl(${hash % 360}, 60%, 50%)`;
  }
}
