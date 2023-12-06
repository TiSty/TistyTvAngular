import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredenzialiComponent } from './credenziali.component';

describe('CredenzialiComponent', () => {
  let component: CredenzialiComponent;
  let fixture: ComponentFixture<CredenzialiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CredenzialiComponent]
    });
    fixture = TestBed.createComponent(CredenzialiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
