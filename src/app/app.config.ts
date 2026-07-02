import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeng/themes/aura';

// Aura's default primary.color ({primary.500} = emerald #10b981) renders white button text
// at ~2.6:1 contrast, below the WCAG AA 4.5:1 minimum for normal text. Shifting the light
// color-scheme's primary.color to {primary.700} (same emerald palette PrimeNG already
// generates) fixes contrast without hard-coding a hex value.
const AccessibleAura = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '{primary.700}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.800}',
          activeColor: '{primary.900}',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // Angular 21 default: zoneless change detection via Signals.
    // Removes dependency on zone.js and enables better performance.
    // All components must use OnPush or Signals for change detection.
    provideZonelessChangeDetection(),
    providePrimeNG({ theme: { preset: AccessibleAura } }),
  ],
};
