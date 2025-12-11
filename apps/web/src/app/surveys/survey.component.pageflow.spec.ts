import { TestBed } from '@angular/core/testing';
import { SurveysModule } from './surveys.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SurveyComponent } from './survey.component';

describe('SurveyComponent page flow', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveysModule, NoopAnimationsModule, RouterTestingModule],
    }).compileComponents();
  });

  it('navigates between pages using next() and prev()', () => {
    const fixture = TestBed.createComponent(SurveyComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    // Start at page 0
    expect(comp.currentPage).toBe(0);

    // Fill required fields on page 1 (from DEMO_FORM)
    comp.form.get('name')?.setValue('Test User');
    comp.form.get('email')?.setValue('test@example.com');
    comp.form.markAllAsTouched();
    comp.form.updateValueAndValidity();

    // Move to next page
    comp.next();
    expect(comp.currentPage).toBe(1);
  });
});
