import { InjectionToken } from '@angular/core';
import {
  AuthRoutes,
  IAuthService,
  ICapabilityService,
  IWorkspaceService,
  QuestionTypeDefinition,
  UiExtension,
} from '@angular-surveys/shared-types';

export const AUTH_SERVICE = new InjectionToken<IAuthService>('AUTH_SERVICE');

export const WORKSPACE_SERVICE = new InjectionToken<IWorkspaceService>('WORKSPACE_SERVICE');

export const CAPABILITY_SERVICE = new InjectionToken<ICapabilityService>('CAPABILITY_SERVICE');

export const QUESTION_TYPE_REGISTRY = new InjectionToken<QuestionTypeDefinition[]>(
  'QUESTION_TYPE_REGISTRY'
);

export const UI_EXTENSIONS = new InjectionToken<UiExtension[]>('UI_EXTENSIONS');

export const AUTH_ROUTES = new InjectionToken<AuthRoutes>('AUTH_ROUTES');

export const DEFAULT_AUTH_ROUTES: AuthRoutes = {
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
};
