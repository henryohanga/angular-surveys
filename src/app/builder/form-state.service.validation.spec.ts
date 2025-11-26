import { TestBed } from '@angular/core/testing';
import { FormStateService } from './form-state.service';
import { MWForm } from '../surveys/models';
import { DEMO_FORM } from '../surveys/demo-data';

describe('FormStateService Ajv validation', () => {
  let svc: FormStateService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    svc = TestBed.inject(FormStateService);
  });

  it('returns no errors for a valid form (DEMO_FORM)', () => {
    const errs = svc.validateForm(JSON.parse(JSON.stringify(DEMO_FORM)) as MWForm);
    expect(errs).toEqual([]);
  });

  it('fails when required top-level fields are missing', () => {
    const form = { description: 'x', pages: [] } as unknown as MWForm;
    const errs = svc.validateForm(form);
    expect(errs.length).toBeGreaterThan(0);
    expect(errs.join('\n')).toContain("/: must have required property 'name'");
  });

  it('fails for invalid question type', () => {
    const invalid: unknown = {
      name: 'x',
      pages: [
        {
          id: 'p1',
          number: 1,
          elements: [
            {
              id: 'e1',
              orderNo: 1,
              type: 'question',
              question: { id: 'q1', text: 't', type: 'bad' }
            }
          ]
        }
      ]
    };
    const errs = svc.validateForm(invalid as MWForm);
    expect(errs.length).toBeGreaterThan(0);
    expect(errs.join('\n')).toMatch(/type: must be equal to one of the allowed values/);
  });

  it('requires scale.min and scale.max for scale questions', () => {
    const scaleMissing: unknown = {
      name: 'x',
      pages: [
        {
          id: 'p1',
          number: 1,
          elements: [
            {
              id: 'e1',
              orderNo: 1,
              type: 'question',
              question: { id: 'q1', text: 't', type: 'scale', scale: { step: 1 } }
            }
          ]
        }
      ]
    };
    const errs = svc.validateForm(scaleMissing as MWForm);
    expect(errs.length).toBeGreaterThan(0);
    expect(errs.join('\n')).toMatch(/scale: must have required property 'min'|scale: must have required property 'max'/);
  });
});
