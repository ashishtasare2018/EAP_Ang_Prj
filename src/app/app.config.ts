import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // Angular 21 default: zoneless change detection via Signals.
    // Removes dependency on zone.js and enables better performance.
    // All components must use OnPush or Signals for change detection.
    provideZonelessChangeDetection(),
    providePrimeNG({ theme: { preset: Aura } }),
  ],
};
