import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartType, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from 'chart.js';
import { Co2Entity } from '../../core/models/co2-entity-model';
import { DataService } from '../../core/services/data.service';
import { combineLatest } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';


Chart.register(BarElement,  BarController, CategoryScale, LinearScale, Tooltip, Legend, Title);

@Component({
  selector: 'app-regional-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  templateUrl: './regional-comparison.component.html',
  styleUrl: './regional-comparison.component.scss'
})
export class RegionalComparisonComponent implements OnInit, AfterViewInit {
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  allData: Co2Entity[] = [];
  yearList: number[] = [];
  selectedYear: number = 2020;

  countryList: string[] = [];
  regionList: string[] = [];

  searchText: string = '';
  selectedCountries: string[] = [];
  selectedRegions: string[] = [];
  maxTotalSelection = 30;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    combineLatest([
      this.dataService.fetchCountries$(),
      this.dataService.loadCSV$()
    ]).subscribe(([countrySet, data]) => {
      this.allData = data;
      this.yearList = [...new Set(data.map(d => d.Year))].sort((a, b) => a - b);

      const allEntities = [...new Set(data.map(d => d.Entity.trim()))];
      this.countryList = allEntities.filter(e => countrySet.has(e)).sort();
      this.regionList = allEntities.filter(e => !countrySet.has(e)).sort();

      if (this.chart) this.updateChart();
    });
  }



  ngAfterViewInit(): void {
    this.initChart();
  }

  get selectedEntities(): string[] {
    return [...this.selectedCountries, ...this.selectedRegions].slice(0, 30);
  }

  initChart(): void {
    const canvas = this.barCanvas?.nativeElement;
    if (!canvas) {
      console.warn('Canvas element not ready');
      return;
    }
  
    const ctx = this.barCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: this.getChartData(),
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Regional CO₂ Emissions Per Capita' }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Emissions (t/person)' }
          },
          x: {
            title: { display: true, text: 'Entity' },
            ticks: { autoSkip: false }
          }
        }
      }
    });
  }

  onCountrySelectionChange(event: any) {
    const total = event.value.length + this.selectedRegions.length;
    if (total <= this.maxTotalSelection) {
      this.selectedCountries = event.value;
      this.updateChart();
    } else {
      // Revert to previous value
      event.source.writeValue(this.selectedCountries);
    }
  }

  onRegionSelectionChange(event: any) {
    const total = this.selectedCountries.length + event.value.length;
    if (total <= this.maxTotalSelection) {
      this.selectedRegions = event.value;
      this.updateChart();
    } else {
      // Revert to previous value
      event.source.writeValue(this.selectedRegions);
    }
  }

  updateChart(): void {
    if (!this.chart) return;
    console.log('Updating chart for year:', this.selectedYear);
    this.chart.data = this.getChartData();
    this.chart.update();
  }
  
  getChartData() {
    const filtered = this.allData.filter(d => d.Year === this.selectedYear);

    const relevantEntities = this.selectedEntities;
    const selectedData = filtered.filter(d => relevantEntities.includes(d.Entity));
    const topEntities = selectedData.sort((a, b) => b.emissionsPerCapita - a.emissionsPerCapita).slice(0, 30);
    
  const barCount = topEntities.length;
    const isFewBars = barCount <= 10;
    return {
      labels: topEntities.map(e => e.Entity),
      datasets: [
        {
          label: `CO₂ emissions in ${this.selectedYear}`,
          data: topEntities.map(e => e.emissionsPerCapita),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          barThickness: isFewBars ? 60 : ('flex' as const)
        }
      ]
    };
  }
}
