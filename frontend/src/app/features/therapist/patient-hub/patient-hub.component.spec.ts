import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientHubComponent } from './patient-hub.component';

describe('PatientHubComponent', () => {
  let component: PatientHubComponent;
  let fixture: ComponentFixture<PatientHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
