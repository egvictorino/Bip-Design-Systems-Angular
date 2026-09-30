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
  card: 'BipCard: clickable añade role="button"+tabindex=0+Enter/Espacio; loading añade aria-busy+aria-label al contenedor del skeleton. CardHeader/Body/Footer/Media son contenedores sin semántica propia.',
  'stats-card': 'BipStatsCard: role="region" + aria-label (title, o locale.statsCard.loading si loading) + aria-busy; icon slot es aria-hidden; trend tiene aria-label localizado con el signo/valor.',
  alert: 'BipAlert: role="status" (info/success, aria-live polite) o role="alert" (warning/danger, aria-live assertive); botón cerrar opcional (closable) con aria-label localizado.',
  button: 'BipButton: selector de atributo sobre button/a nativos — conserva la semántica del elemento host; en <a> emula disabled con aria-disabled+tabindex=-1+bloqueo de click (no existe disabled nativo en anchors); aria-busy durante loading; spinner decorativo aria-hidden.',
  input: 'BipInput: for/id entre label e input; aria-invalid solo con error explícito o NgControl inválido+tocado; aria-describedby al helper/error (role="alert" en error); botones de limpiar/mostrar-ocultar contraseña con aria-label localizado y tabindex=-1 (no roban el foco al flujo del campo).',
  textarea: 'BipTextarea: for/id entre label y textarea; aria-invalid solo con error explícito o NgControl inválido+tocado; aria-describedby al helper/error (role="alert" en error); contador de caracteres es texto normal (no necesita anuncio por cada tecla).',
  checkbox: 'BipCheckbox: checkbox nativo real (input type=checkbox) bajo un box visual — teclado/rol nativos intactos; aria-invalid+aria-describedby igual que Input; indeterminate seteado vía viewChild (propiedad DOM, no atributo). BipCheckboxGroup: <fieldset>+<legend>, aria-describedby al helper/error; cascada size/disabled/error a los checkboxes hijos vía inject(optional), sin defaults silenciosos erróneos (el hijo puede sobreescribir cualquiera explícitamente).',
  radio: 'BipRadio: radio nativo real bajo un ring visual, mismo name compartido vía BipRadioGroup (exclusividad nativa, navegación con flechas del navegador); a propósito NO lleva aria-invalid (regla del CLAUDE.md) — el error se comunica vía aria-describedby del <fieldset> del grupo al mensaje. inject(BipRadioGroup) sin optional lanza si se usa fuera del grupo (compound component, sin default silencioso). BipRadioGroup es ControlValueAccessor (el valor seleccionado vive en el grupo, no en cada radio).',
  toggle: 'BipToggle: input[type=checkbox] nativo con role="switch" bajo un track/thumb visual — aria-invalid+aria-describedby igual que Checkbox; el thumb decorativo es aria-hidden.',
  select: 'BipSelect: <select> nativo (no listbox custom) — teclado/rol de combobox intactos; for/id, aria-invalid+aria-describedby igual que Input; chevron decorativo aria-hidden; placeholder es <option disabled> real, no un truco visual.',
  'number-input': 'BipNumberInput: role="spinbutton" + aria-valuenow/min/max; botones +/- con aria-label localizado y tabindex=-1 (no interrumpen el tab order del formulario); aria-invalid+aria-describedby igual que Input; flechas de teclado incrementan/decrementan con preventDefault.',
  'search-input': 'BipSearchInput: wrapper con role="search"; input[type=search] (rol searchbox nativo) con aria-invalid/aria-describedby/aria-busy igual que Input; ícono de búsqueda y spinner decorativos aria-hidden; botón de limpiar con aria-label localizado.',
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
