import { TestBed } from '@angular/core/testing';
import { SurveysModule } from './surveys.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SurveyComponent } from './survey.component';
import { FormStateService } from '../builder/form-state.service';

describe('SurveyComponent new question types', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveysModule, NoopAnimationsModule],
    }).compileComponents();
  });

  it('renders date, time, and scale components', () => {
    const svc = TestBed.inject(FormStateService);
    svc.setForm({
      name: 'spec form',
      pages: [
        {
          id: 'p1',
          number: 1,
          elements: [
            { id: 'e2', orderNo: 2, type: 'question', question: { id: 'qdate', text: 'Pick a date', type: 'date' } },
            { id: 'e3', orderNo: 3, type: 'question', question: { id: 'qtime', text: 'Pick a time', type: 'time' } },
            { id: 'e4', orderNo: 4, type: 'question', question: { id: 'qscale', text: 'Rate 1-5', type: 'scale', scale: { min: 1, max: 5 } } },
          ],
        },
      ],
    });

    const fixture = TestBed.createComponent(SurveyComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-date-question')).toBeTruthy();
    expect(el.querySelector('app-time-question')).toBeTruthy();
    expect(el.querySelector('app-scale-question')).toBeTruthy();
  });
});

