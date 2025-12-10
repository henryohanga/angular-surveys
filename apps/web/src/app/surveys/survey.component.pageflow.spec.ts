import { TestBed } from '@angular/core/testing';
import { SurveysModule } from './surveys.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormArray, FormControl } from '@angular/forms';
import { SurveyComponent } from './survey.component';
import { FormStateService } from '../builder/form-state.service';
import { DEMO_FORM } from './demo-data';

describe('SurveyComponent page flow', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveysModule, NoopAnimationsModule],
    }).compileComponents();
  });

  it('jumps to page via radio pageFlow', () => {
    const svc = TestBed.inject(FormStateService);
    svc.setForm(JSON.parse(JSON.stringify(DEMO_FORM)));
    const fixture = TestBed.createComponent(SurveyComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.currentPage).toBe(0);
    comp.form.get('short-text')?.setValue('a');
    comp.form.get('long-text')?.setValue('b');
    let arr = comp.form.get('checkbox-question') as FormArray | null;
    if (!arr) {
      arr = new FormArray([]);
      comp.form.addControl('checkbox-question', arr);
    }
    arr.push(new FormControl('aaaa'));
    comp.form.get('radio-question')?.setValue('bbbb');
    comp.form.markAllAsTouched();
    comp.form.updateValueAndValidity();
    comp.next();
    expect(comp.currentPage).toBe(1);
  });
});
