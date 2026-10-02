import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideBipLocale, provideBipTheme, esMX } from '@bip-design-systems/angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Zoneless a propósito: valida que la librería funcione "con y sin zone.js" (CLAUDE.md
    // § Stack) también a través del tarball publicado, no solo en los specs de Vitest.
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    provideBipTheme({}),
    provideBipLocale(esMX),
  ],
};
