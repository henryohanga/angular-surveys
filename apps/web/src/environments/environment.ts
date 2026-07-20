import { AppEnvironment } from '@angular-surveys/shared-types';

export const environment: AppEnvironment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  sentryDsn: '',
  authProviderUrl: undefined,
  features: {
    workspaces: false,
    externalAuth: false,
    customQuestionTypes: false,
    uiExtensions: false,
  },
};
