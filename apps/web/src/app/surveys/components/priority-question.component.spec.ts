import { TestBed } from '@angular/core/testing';
import { SurveysModule } from '../surveys.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PriorityQuestionComponent } from './priority-question.component';

describe('PriorityQuestionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveysModule, NoopAnimationsModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PriorityQuestionComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });
});
