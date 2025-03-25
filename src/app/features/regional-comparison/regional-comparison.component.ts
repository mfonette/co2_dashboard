import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Co2Entity } from '../../core/models/co2-entity-model';
import { DataService } from '../../core/services/data.service';
import { combineLatest } from 'rxjs';
import { DropdownConfigService } from '../../core/services/dropdown-config.service';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

@Component({
  selector: 'app-regional-comparison',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectDropDownModule
  ],
  templateUrl: './regional-comparison.component.html',
  styleUrls: ['./regional-comparison.component.scss']
})
export class RegionalComparisonComponent implements OnInit, AfterViewInit {
  // Data
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  allData: Co2Entity[] = [];
  yearList: number[] = [];
  countryList: string[] = [];
  regionList: string[] = [];
  maxTotalSelection = 30;

  // Dropdown data
  countries: any[] = [];
  selectedCountries: any[] = [];
  regions: any[] = [];
  selectedRegions: any[] = [];
  years: any[] = [];
  selectedYear: any = 2020;

  // Configuration for dropdowns
  dropdownConfig;
  yearDropdownConfig;
  regionDropdownConfig;
  constructor(private dataService: DataService,
    private dropdownService: DropdownConfigService
  ) { this.dropdownConfig = this.dropdownService.getMultiSelectConfig('Select Countries', 'Search Countries');
    this.yearDropdownConfig = this.dropdownService.getYearConfig();
    this.regionDropdownConfig = this.dropdownService.getMultiSelectConfig('Select Regions', 'Search Regions');
  }

  ngOnInit(): void {
    combineLatest([
      this.dataService.fetchCountries$(),
      this.dataService.loadCSV$()
    ]).subscribe(([countrySet, data]) => {
      this.allData = data;
      this.yearList = [...new Set(data.map(d => d.Year))].sort((a, b) => b - a);
      
      // Set default year immediately
      const defaultYear = {
        id: 2020,
        name: '2020'
      };
      this.selectedYear = defaultYear;
      
      const allEntities = [...new Set(data.map(d => d.Entity.trim()))];
      this.countryList = allEntities.filter(e => countrySet.has(e)).sort();
      this.regionList = allEntities.filter(e => !countrySet.has(e)).sort();

      // Update dropdown data
      this.countries = this.countryList.map(country => ({ 
        id: country,
        name: country 
      }));
      
      this.regions = this.regionList.map(region => ({
        id: region,
        name: region
      }));

      this.years = this.yearList.map(year => ({
        id: year,
        name: year.toString()
      }));

      this.updateChart();
    });
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  get selectedEntities(): string[] {
    return [
      ...(this.selectedCountries || []).map(c => c.name),
      ...(this.selectedRegions || []).map(r => r.name)
    ];
  }

  initChart(): void {
    const canvas = this.barCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: this.getChartData(),
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Regional CO₂ Emissions Comparison'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'CO₂ emissions per capita (t/person)'
            }
          }
        }
      }
    });
  }

  // Generic handler for all selection changes
  onSelectionChange(): void {
    this.updateChart();
  }

  getSelectedYear(): number {
    return this.selectedYear?.id || 2020;
  }

  updateChart(): void {
    if (!this.chart) return;
    this.chart.data = this.getChartData();
    this.chart.update();
  }
  
  getChartData() {
    const filtered = this.allData.filter(d => d.Year === this.getSelectedYear());
    const relevantEntities = this.selectedEntities;
    const selectedData = filtered.filter(d => relevantEntities.includes(d.Entity));
    const topEntities = selectedData
      .sort((a, b) => b.emissionsPerCapita - a.emissionsPerCapita)
      .slice(0, 30);
    
    const barCount = topEntities.length;
    return {
      labels: topEntities.map(e => e.Entity),
      datasets: [
        {
          label: `CO₂ emissions in ${this.getSelectedYear()}`,
          data: topEntities.map(e => e.emissionsPerCapita),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          barThickness: barCount <= 10 ? 60 : ('flex' as const)
        }
      ]
    };
  }
}
