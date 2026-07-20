import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ICapabilityService } from '@angular-surveys/shared-types';

@Injectable()
export class NullCapabilityService implements ICapabilityService {
  isCapable(_: string): Observable<boolean> {
    return of(false);
  }

  isCapableSync(_: string): boolean {
    return false;
  }
}
