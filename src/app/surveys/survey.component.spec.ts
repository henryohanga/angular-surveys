import { TestBed } from '@angular/core/testing';
import { SurveysModule } from './surveys.module';
import { SurveyComponent } from './survey.component';

describe('SurveyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveysModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SurveyComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });
});

