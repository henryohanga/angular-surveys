import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ICapabilityService } from '@angular-surveys/shared-types';

@Injectable()
export class NullCapabilityService implements ICapabilityService {
  isCapable(_capability: string): Observable<boolean> {
    return of(false);
  }

  isCapableSync(_capability: string): boolean {
    return false;
  }
}
