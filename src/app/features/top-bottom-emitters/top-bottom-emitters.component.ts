import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  BarController,
} from 'chart.js';
import { Co2Entity } from '../../core/models/co2-entity-model';
import { DataService } from '../../core/services/data.service';
import { SelectDropDownModule } from 'ngx-select-dropdown';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

@Component({
  selector: 'app-top-bottom-emitters',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    SelectDropDownModule
  ],
  templateUrl: './top-bottom-emitters.component.html',
  styleUrls: ['./top-bottom-emitters.component.scss']
})
export class TopBottomEmittersComponent implements OnInit, AfterViewInit {
  @ViewChild('emittersCanvas') emittersCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  allData: Co2Entity[] = [];
  yearList: number[] = [];
  years: any[] = [];
  selectedYear: any = null;

  // Configuration for year dropdown
  yearDropdownConfig = {
    displayKey: 'name',
    search: true,
    height: '300px',
    placeholder: 'Select Year',
    searchPlaceholder: 'Search Year',
    limitTo: 0,
    moreText: 'more',
    noResultsFound: 'No results found!',
    searchOnKey: 'name',
    clearOnSelection: false,
    inputDirection: 'ltr',
    enableSelectAll: false,
    multiple: false,
    allowRemoveSelection: false
  };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.loadCSV$().subscribe(data => {
      this.allData = data;
      this.yearList = [...new Set(data.map(d => d.Year))].sort((a, b) => b - a);
      
      // Create years array with proper object structure
      this.years = this.yearList.map(year => ({
        id: year,
        name: year.toString()
      }));

      // Set default year
      const defaultYear = this.years.find(y => y.id === 2020) || this.years[0];
      this.selectedYear = defaultYear;
      this.updateChart();
    });
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  onYearSelect(event: any): void {
    this.updateChart();
  }

  getSelectedYear(): number {
    return this.selectedYear?.id || 2020;
  }

  initChart(): void {
    const canvas = this.emittersCanvas?.nativeElement;
    if (!canvas) {
      console.warn('Canvas element not ready');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: this.getChartData(),
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Top and Bottom CO₂ Emitters'
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'CO₂ emissions per capita (t/person)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Entity'
            }
          }
        }
      }
    });
  }

  updateChart(): void {
    if (!this.chart) return;
    this.chart.data = this.getChartData();
    this.chart.update();
  }

  getChartData() {
    const year = this.getSelectedYear();
    const yearData = this.allData.filter(d => d.Year === year);
    
    // Sort by emissions and get top/bottom 10
    const sortedData = yearData.sort((a, b) => b.emissionsPerCapita - a.emissionsPerCapita);
    const top10 = sortedData.slice(0, 10);
    const bottom10 = sortedData.slice(-10);
    
    const allData = [...top10, ...bottom10];
    
    return {
      labels: allData.map(d => d.Entity),
      datasets: [{
        data: allData.map(d => d.emissionsPerCapita),
        backgroundColor: allData.map((_, i) => i < 10 ? '#F87A63' : '#03CF9E'),
        borderWidth: 1
      }]
    };
  }
}
