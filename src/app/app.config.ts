import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

import { routes } from './app.routes';
import { apiKeyInterceptor } from './core/interceptors/api-key-interceptor';

const SNACKBAR_DURATION_MS = 2500;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiKeyInterceptor])),
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: SNACKBAR_DURATION_MS } },
  ],
};
