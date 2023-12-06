import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SerietvComponent } from './serietv.component';

describe('SerietvComponent', () => {
  let component: SerietvComponent;
  let fixture: ComponentFixture<SerietvComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SerietvComponent]
    });
    fixture = TestBed.createComponent(SerietvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
