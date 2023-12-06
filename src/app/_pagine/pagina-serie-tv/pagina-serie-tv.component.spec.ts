import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaSerieTvComponent } from './pagina-serie-tv.component';

describe('PaginaSerieTvComponent', () => {
  let component: PaginaSerieTvComponent;
  let fixture: ComponentFixture<PaginaSerieTvComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaginaSerieTvComponent]
    });
    fixture = TestBed.createComponent(PaginaSerieTvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
