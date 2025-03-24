import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionalComparisonComponent } from './regional-comparison.component';

describe('RegionalComparisonComponent', () => {
  let component: RegionalComparisonComponent;
  let fixture: ComponentFixture<RegionalComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegionalComparisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegionalComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
