import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopBottomEmittersComponent } from './top-bottom-emitters.component';

describe('TopBottomEmittersComponent', () => {
  let component: TopBottomEmittersComponent;
  let fixture: ComponentFixture<TopBottomEmittersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBottomEmittersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopBottomEmittersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
