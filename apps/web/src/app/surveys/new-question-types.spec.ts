import { TestBed } from '@angular/core/testing';
import { SurveysModule } from './surveys.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SurveyComponent } from './survey.component';

describe('SurveyComponent new question types', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveysModule, NoopAnimationsModule, RouterTestingModule],
    }).compileComponents();
  });

  it('creates form controls for various question types from DEMO_FORM', () => {
    const fixture = TestBed.createComponent(SurveyComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    // SurveyComponent uses DEMO_FORM which includes date, scale, rating, nps question types
    // Check that the component initializes successfully with a valid form
    expect(comp.form).toBeTruthy();
    expect(comp.currentPage).toBe(0);
    // The form should have controls for the questions on the first page
    expect(Object.keys(comp.form.controls).length).toBeGreaterThan(0);
  });
});
