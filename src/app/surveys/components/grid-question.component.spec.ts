import { TestBed } from '@angular/core/testing';
import { SurveysModule } from '../surveys.module';
import { GridQuestionComponent } from './grid-question.component';

describe('GridQuestionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveysModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(GridQuestionComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });
});

