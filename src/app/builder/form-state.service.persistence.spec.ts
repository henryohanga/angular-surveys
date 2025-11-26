import { FormStateService } from './form-state.service';

describe('FormStateService localStorage persistence', () => {
  it('loads from localStorage when available', () => {
    const key = 'angular-surveys-form';
    const sample = { name: 'persisted', description: '', pages: [] };
    localStorage.setItem(key, JSON.stringify(sample));
    const svc = new FormStateService();
    expect(svc.getForm().name).toBe('persisted');
    localStorage.removeItem(key);
  });
});
