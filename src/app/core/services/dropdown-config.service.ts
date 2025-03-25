import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DropdownConfigService {
  private baseConfig = {
    displayKey: 'name',
    search: true,
    height: '300px',
    limitTo: 0,
    moreText: 'more',
    noResultsFound: 'No results found!',
    searchOnKey: 'name',
    clearOnSelection: false,
    inputDirection: 'ltr',
    enableSelectAll: false
  };

  getYearConfig() {
    return {
      ...this.baseConfig,
      placeholder: 'Select Year',
      searchPlaceholder: 'Search Year',
      multiple: false,
      allowRemoveSelection: false
    };
  }

  getMultiSelectConfig(placeholder: string, searchPlaceholder: string) {
    return {
      ...this.baseConfig,
      placeholder,
      searchPlaceholder,
      multiple: true
    };
  }
}
