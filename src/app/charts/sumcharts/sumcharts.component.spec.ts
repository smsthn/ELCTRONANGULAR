import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SumchartsComponent } from './sumcharts.component';


describe('SumchartsComponent', () => {
  let component: SumchartsComponent;
  let fixture: ComponentFixture<SumchartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SumchartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SumchartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
