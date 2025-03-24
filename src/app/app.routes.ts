import { Routes } from '@angular/router';

export const routes: Routes = [
      {
        path: 'time-series',
        loadComponent: () =>
          import('./features/time-series/time-series.component').then(m => m.TimeSeriesComponent)
      },
      {
        path: 'regional-comparison',
        loadComponent: () =>
          import('./features/regional-comparison/regional-comparison.component').then(m => m.RegionalComparisonComponent)
      },
      {
        path: 'top-bottom-emitters',
        loadComponent: () =>
          import('./features/top-bottom-emitters/top-bottom-emitters.component').then(m => m.TopBottomEmittersComponent)
      },
      { path: '', redirectTo: 'time-series', pathMatch: 'full' },
    
  { path: '**', redirectTo: 'time-series' }
];

