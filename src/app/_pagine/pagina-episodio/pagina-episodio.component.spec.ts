import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaEpisodioComponent } from './pagina-episodio.component';

describe('PaginaEpisodioComponent', () => {
  let component: PaginaEpisodioComponent;
  let fixture: ComponentFixture<PaginaEpisodioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaginaEpisodioComponent]
    });
    fixture = TestBed.createComponent(PaginaEpisodioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
