import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionConfigComponent } from './session-config.component';

describe('SessionConfigComponent', () => {
  let component: SessionConfigComponent;
  let fixture: ComponentFixture<SessionConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
