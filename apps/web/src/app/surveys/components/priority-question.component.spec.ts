import { TestBed } from '@angular/core/testing';
import { FormArray, FormGroup } from '@angular/forms';
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
    comp.question = {
      id: 'priority-question',
      text: 'priority',
      type: 'priority',
      required: true,
      priorityList: [
        { id: 'p1', orderNo: 1, value: 'A' },
        { id: 'p2', orderNo: 2, value: 'B' },
      ],
    };
    comp.form = new FormGroup({ 'priority-question': new FormArray([]) });
    fixture.detectChanges();
    expect(comp).toBeTruthy();
  });
});
