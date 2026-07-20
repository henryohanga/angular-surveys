import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IWorkspaceService } from '@angular-surveys/shared-types';

@Injectable()
export class NullWorkspaceService implements IWorkspaceService {
  readonly workspaceId$: Observable<string | null> = of(null);
  readonly workspaceId: string | null = null;
}
