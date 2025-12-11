import { TestBed } from '@angular/core/testing';
import { SurveysModule } from './surveys.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SurveyComponent } from './survey.component';

describe('SurveyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveysModule, NoopAnimationsModule, RouterTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SurveyComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });
});
