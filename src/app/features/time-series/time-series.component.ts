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
import { SelectDropDownModule } from 'ngx-select-dropdown';

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
import { DropdownConfigService } from '../../core/services/dropdown-config.service';

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
  imports: [
    CommonModule, 
    FormsModule,
    SelectDropDownModule
  ],
  templateUrl: './time-series.component.html',
  styleUrls: ['./time-series.component.scss']
})
export class TimeSeriesComponent implements OnInit, AfterViewInit {
  @ViewChild('lineCanvas', { static: false }) lineCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  allData: Co2Entity[] = [];
  entityList: string[] = [];
  entities: any[] = [];
  selectedEntities: any[] = [];
  
  // Configuration for entity dropdown
  dropdownConfig;

  constructor(private dataService: DataService,
    private dropdownService: DropdownConfigService
  ){
    this.dropdownConfig = this.dropdownService.getMultiSelectConfig('Select Entities (max 5)', 'Search Entities');
  }


  ngOnInit(): void {
    this.dataService.loadCSV$().subscribe(data => {
      this.allData = data;
      // Maps each item in data to its Entity name and Removes duplicates
      this.entityList = [...new Set(data.map(d => d.Entity))].sort();
      
      // Create entities array with proper object structure because ngx-s elect-dropdown expects an array of { id, name } objects, not raw strings.
      this.entities = this.entityList.map(entity => ({
        id: entity,
        name: entity
      }));

      // Set default selection to World
      const worldEntity = this.entities.find(e => e.name === 'World');
      if (worldEntity) {
        this.selectedEntities = [worldEntity];
      }

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

  onEntitySelect(event: any): void {
    // Limit selection to 5 entities
    if (this.selectedEntities.length > 5) {
      this.selectedEntities = this.selectedEntities.slice(0, 5);
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
    const selected = this.getSelectedEntityNames();
    const years = [...new Set(this.allData.map(d => d.Year))].sort();
    
    return {
      labels: years,
      datasets: selected.map(entityName => {
        const data = years.map(year => {
          const match = this.allData.find(d => d.Entity === entityName && d.Year === year);
          return match ? match.emissionsPerCapita : null;
        });
  
        return {
          label: entityName,
          data,
          fill: false,
          borderColor: this.getColor(entityName),
          tension: 0.3,
          spanGaps: true
        };
      })
    };
  }

  getSelectedEntityNames(): string[] {
    return this.selectedEntities.map(e => e.name);
  }

  getColor(name: string): string {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `hsl(${hash % 360}, 60%, 50%)`;
  }
}
