import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import * as Papa from 'papaparse';
import { Co2Entity } from '../models/co2-entity-model';

@Injectable({ providedIn: 'root' })
export class DataService {

  private dataLoaded = false;
  private dataSubject = new BehaviorSubject<Co2Entity[]>([]);
  public data$ = this.dataSubject.asObservable();
  countries = new Set<string>();
regions = new Set<string>();

  constructor(private http: HttpClient) {}

  loadCSV$(): Observable<Co2Entity[]> {
    if (this.dataLoaded) {
      // Already parsed & cached — return from memory
      return this.data$;
    }
  
    return this.http.get('assets/data/co2_emissions.csv', { responseType: 'text' }).pipe(
      map(csvText => {
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        const cleanedData: Co2Entity[] = (parsed.data as any[])
          .filter(row => +row["Year"] >= 1900)
          .map(row => ({
            Entity: row["Entity"].trim(),
            Year: +row["Year"],
            emissionsPerCapita: +row["Annual CO₂ emissions (per capita)"]
          }));
  
        // classify regions
        const allEntities = [...new Set(cleanedData.map(d => d.Entity))];
        allEntities.forEach(entity => {
          if (!this.countries.has(entity)) {
            this.regions.add(entity);
          }
        });
  
        // save & emit
        this.dataLoaded = true;
        this.dataSubject.next(cleanedData);
        return cleanedData;
      })
    );
  }
  

  fetchCountries$(): Observable<Set<string>> {
    return this.http.get<any[]>('https://restcountries.com/v3.1/all').pipe(
      map(response => {
        const countryNames = response.map(c => c.name.common.trim());
        this.countries = new Set(countryNames);
        return this.countries;
      })
    );
  }
  

  // loadCSV(): void {
  //   this.http.get('assets/data/co2_emissions.csv', { responseType: 'text' })
  //     .subscribe(csvText => {
  //       Papa.parse(csvText, {
  //         header: true,
  //         skipEmptyLines: true,
  //         complete: (result) => {
  //           const cleanedData: Co2Entity[] = (result.data as any[]).map(row => ({
  //             Entity: row["Entity"],
  //             Year: +row["Year"],
  //             emissionsPerCapita: +row["Annual CO₂ emissions (per capita)"]
  //           })).filter(entry => entry.Year >= 1900);
  //           this.dataSubject.next(cleanedData);
  //         }
  //       });
  //     });
  // }

  // fetchCountries(): void {
  //   this.http.get<any[]>('https://restcountries.com/v3.1/all').subscribe(response => {
  //     const countryNames = response.map(c => c.name.common.trim());
  //     this.countries = new Set(countryNames);
  
  //     // Separate entities into countries and regions
  //     const allEntities = [...new Set(this.dataSubject.value.map(d => d.Entity.trim()))];
  //     allEntities.forEach(entity => {
  //       if (!this.countries.has(entity)) {
  //         this.regions.add(entity);
  //       }
  //     });
  //   });
  // }
}
