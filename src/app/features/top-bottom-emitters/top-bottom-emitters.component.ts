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
  ChartType
} from 'chart.js';
import { Co2Entity } from '../../core/models/co2-entity-model';
import { DataService } from '../../core/services/data.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';


Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

@Component({
  selector: 'app-top-bottom-emitters',
  standalone: true,
  imports: [CommonModule, FormsModule,  MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule],
  templateUrl: './top-bottom-emitters.component.html',
  styleUrl: './top-bottom-emitters.component.scss'
})
export class TopBottomEmittersComponent implements OnInit, AfterViewInit {
  @ViewChild('emittersCanvas') emittersCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;

  allData: Co2Entity[] = [];
  yearList: number[] = [];
  selectedYear: number = 2020;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
  this.dataService.loadCSV$().subscribe(data => {
    this.allData = data;
    this.yearList = [...new Set(data.map(d => d.Year))].sort((a, b) => a - b);
    if (this.chart) this.updateChart();
  });
}


  ngAfterViewInit(): void {
    setTimeout(() => this.initChart(), 0);
  }

  initChart(): void {
    const ctx = this.emittersCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: this.getChartData(),
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: `Top & Bottom CO₂ Emitters - ${this.selectedYear}` }
        },
        scales: {
          x: {
            title: { display: true, text: 'Emissions (t/person)' },
            beginAtZero: true
          },
          y: {
            title: { display: true, text: 'Entity' }
          }
        }
      }
    });
  }

  updateChart(): void {
    if (!this.chart) return;

    const newData = this.getChartData();
    this.chart.data = newData;
    this.chart.update();
  }

  getChartData() {
    const yearData = this.allData.filter(d => d.Year === this.selectedYear && d.emissionsPerCapita !== null);
    const sorted = [...yearData].sort((a, b) => b.emissionsPerCapita - a.emissionsPerCapita);

    const top10 = sorted.slice(0, 10);
    const bottom10 = sorted.slice(-10);

    const combined = [...top10, ...bottom10];

    return {
      labels: combined.map(d => d.Entity),
      datasets: [
        {
          label: `Emissions in ${this.selectedYear}`,
          data: combined.map(d => d.emissionsPerCapita),
          backgroundColor: combined.map((_, i) => i < 10 ? '#F87A63' : '#03CF9E')
        }
      ]
    };
  }
}
