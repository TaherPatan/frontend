import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngestionStatusComponent } from './ingestion-status.component';

describe('IngestionStatusComponent', () => {
  let component: IngestionStatusComponent;
  let fixture: ComponentFixture<IngestionStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngestionStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngestionStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
