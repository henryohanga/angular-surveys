import { AppEnvironment } from '@angular-surveys/shared-types';

export const environment: AppEnvironment = {
  production: true,
  apiUrl: '/api',
  sentryDsn: '',
  authProviderUrl: undefined,
  features: {
    workspaces: false,
    externalAuth: false,
    customQuestionTypes: false,
    uiExtensions: false,
  },
};
