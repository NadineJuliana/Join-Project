import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalnoticePageComponent } from './legalnotice-page.component';

describe('LegalnoticePageComponent', () => {
  let component: LegalnoticePageComponent;
  let fixture: ComponentFixture<LegalnoticePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalnoticePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalnoticePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
