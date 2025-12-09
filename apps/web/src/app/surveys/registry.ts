import { InjectionToken, Type } from '@angular/core';
import { MWTextType } from './models';

export type QuestionComponentRegistry = Record<MWTextType, Type<unknown>>;

export const QUESTION_COMPONENTS = new InjectionToken<QuestionComponentRegistry>('QUESTION_COMPONENTS');
