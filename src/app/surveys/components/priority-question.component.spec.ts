import { TestBed } from '@angular/core/testing';
import { SurveysModule } from '../surveys.module';
import { PriorityQuestionComponent } from './priority-question.component';

describe('PriorityQuestionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveysModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PriorityQuestionComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });
});

