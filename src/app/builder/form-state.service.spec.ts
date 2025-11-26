import { TestBed } from '@angular/core/testing';
import { FormStateService } from './form-state.service';

describe('FormStateService import/export', () => {
  let svc: FormStateService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    svc = TestBed.inject(FormStateService);
  });

  it('exports and imports JSON', () => {
    const json = svc.exportJson();
    expect(json).toContain('pages');
    const parsed = JSON.parse(json);
    parsed.name = 'updated';
    svc.importJson(JSON.stringify(parsed));
    expect(svc.getForm().name).toBe('updated');
  });
});

