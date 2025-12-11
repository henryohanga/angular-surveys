import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { SurveysModule } from '../surveys.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GridQuestionComponent } from './grid-question.component';

describe('GridQuestionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveysModule, NoopAnimationsModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(GridQuestionComponent);
    const comp = fixture.componentInstance;
    comp.question = {
      id: 'grid-question',
      text: 'grid',
      type: 'grid',
      required: true,
      grid: {
        cellInputType: 'radio',
        rows: [{ id: 'row1', orderNo: 1, label: 'row 1' }],
        cols: [{ id: 'col1', orderNo: 1, label: 'col 1' }],
      },
    };
    comp.form = new FormGroup({
      'grid-question': new FormGroup({
        row1: new FormControl('')
      })
    });
    fixture.detectChanges();
    expect(comp).toBeTruthy();
  });
});
