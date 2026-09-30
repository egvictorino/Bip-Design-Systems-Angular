import { relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findFiles } from './find-css-files';

const SRC_DIR = resolve(__dirname, '..');

/**
 * Registro de cobertura de a11y — un componente no está terminado (DoD del CLAUDE.md, punto 4)
 * hasta que tiene una entrada aquí. La nota es libre (qué cubre su a11y: roles, manejo de
 * teclado, anuncios...); lo que importa es que exista una entrada por cada `*.component.ts`
 * real del árbol. `color-contrast` se deja deshabilitado hasta el Bloque 11 (axe en navegador
 * real vía Playwright — ver visual/a11y-browser.spec.ts), porque en Vitest/happy-dom
 * `getComputedStyle` no resuelve `color-mix()`/custom properties con fidelidad suficiente para
 * confiar en ese resultado.
 */
const A11Y_REGISTRY: Record<string, string> = {
  a11y: 'BipVisuallyHidden: span recortado visualmente (clip-rect), siempre expuesto a lectores de pantalla.',
  container: 'BipContainer: sin semántica propia, solo layout — el elemento host la conserva.',
  stack: 'BipStack: sin semántica propia, solo layout — el elemento host la conserva.',
  grid: 'BipGrid: sin semántica propia, solo layout — el elemento host la conserva.',
  divider: 'BipDivider: role="separator" + aria-orientation (hr nativo cuando es horizontal sin label).',
  text: 'BipText: sin semántica propia, solo tipografía — el elemento host la conserva.',
  heading: 'BipHeading: infiere aria-level del tag h1-h6; añade role="heading"/aria-level cuando el host no es un tag de heading nativo.',
  link: 'BipLink: aria-disabled+tabindex=-1 cuando disabled; hint accesible "abre en pestaña nueva" (bip-visually-hidden) cuando external.',
  spinner: 'BipSpinner: role="status" + aria-label (locale o custom); SVG interno decorativo aria-hidden.',
  skeleton: 'BipSkeleton: aria-hidden="true" en la raíz — placeholder puramente decorativo.',
  badge: 'BipBadge: contenido de texto normal; el dot decorativo es aria-hidden.',
  avatar: 'BipAvatar: role="img"+aria-label cuando no es <img> (iniciales/ícono); status es aria-hidden. BipAvatarGroup: role="group"; overflow "+N" es role="img"+aria-label con el conteo.',
  'progress-bar': 'BipProgressBar: role="progressbar" + aria-valuemin/max/now (omitido si indeterminate) + aria-label (locale o custom) + aria-valuetext opcional + aria-busy si indeterminate + aria-describedby al helperText.',
  'empty-state': 'BipEmptyState: icon box decorativo aria-hidden="true"; título/descripción son texto normal.',
};

/**
 * `theme` (BipThemeProvider) es un componente de contexto sin superficie visual propia — no
 * renderiza nada perceptible por sí mismo (envuelve `<ng-content>`), así que no aplica un
 * registro de a11y como el de un componente de UI. `foundations` son demos de Storybook, no
 * componentes publicados de la librería (no viajan al consumidor) — ver DoD del CLAUDE.md.
 * Cualquier otro `*.component.ts` nuevo debe tener entrada en A11Y_REGISTRY.
 */
const SKIP_LIST = new Set<string>(['theme', 'foundations']);

/**
 * Deriva la "clave de componente" de la ruta de un `*.component.ts`:
 * - Dentro de `core/src/<feature>/...` (theme, a11y...) → `<feature>` (todavía no hay
 *   secondary entry propio para esas features, viven agrupadas en `core`).
 * - En cualquier otro directorio de primer nivel (`button/`, `input/`... a partir del Bloque
 *   4) → ese directorio, que sí es un secondary entry propio (`@bip-design-systems/angular/button`).
 */
function componentKey(relPath: string): string {
  const segments = relPath.split('/');
  if (segments[0] === 'core' && segments[1] === 'src') {
    return segments[2];
  }
  return segments[0];
}

function findComponentFiles(dir: string): string[] {
  return findFiles(dir, (name) => name.endsWith('.component.ts'));
}

describe('registro de cobertura de a11y', () => {
  it('todo *.component.ts (salvo SKIP_LIST) tiene una entrada en A11Y_REGISTRY', () => {
    const keys = new Set(
      findComponentFiles(SRC_DIR)
        .map((path) => relative(SRC_DIR, path).replace(/\\/g, '/'))
        .map(componentKey)
        .filter((key) => !SKIP_LIST.has(key))
    );

    const missing = [...keys].filter((key) => !(key in A11Y_REGISTRY));
    expect(missing).toEqual([]);
  });

  it('A11Y_REGISTRY no tiene entradas huérfanas (sin *.component.ts que las respalde)', () => {
    const keys = new Set(
      findComponentFiles(SRC_DIR)
        .map((path) => relative(SRC_DIR, path).replace(/\\/g, '/'))
        .map(componentKey)
    );

    const orphans = Object.keys(A11Y_REGISTRY).filter((key) => !keys.has(key));
    expect(orphans).toEqual([]);
  });
});
