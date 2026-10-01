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
  slider: 'BipSlider: <input type="range"> nativo (rol slider, flechas de teclado nativas) — aria-invalid+aria-describedby igual que Input; el valor numérico junto al label es texto normal.',
  'file-upload': 'BipFileUpload: <label> es la zona de drop y dispara el <input type="file"> real (oculto visualmente con el mismo patrón clip-rect de BipVisuallyHidden, no display:none — mantiene foco/teclado nativos); aria-invalid+aria-describedby+aria-busy igual que Input; botón de quitar por archivo con aria-label localizado (incluye el nombre del archivo); iconos e ilustraciones decorativos aria-hidden.',
  modal: 'BipModal: vía BipOverlay + TemplatePortal; role="dialog"+aria-modal+aria-labelledby al título; cdkTrapFocus con autocapture del primer focusable, restaura el foco previo al cerrar; Escape (configurable) y clic en backdrop (configurable) cierran; scroll lock con ScrollStrategyOptions.block(). BipModalHeader: botón de cerrar con aria-label localizado; lanza si se usa fuera de <bip-modal> (sin BIP_MODAL_CONTEXT). BipModalBody/BipModalFooter: contenedores sin semántica propia.',
  'confirm-dialog': 'BipConfirmDialog: composición sobre <bip-modal> (closeOnBackdrop siempre false — evita descartar una acción destructiva con un clic accidental); hereda role="dialog"+aria-modal+aria-labelledby+focus trap+Escape de BipModal; botones de confirmar/cancelar localizados (o custom via inputs).',
  'drawer-panel': 'BipDrawerPanel: vía BipOverlay + TemplatePortal, mismo patrón que BipModal; role="dialog"+aria-modal+aria-label (del título) — sin aria-labelledby porque el título es opcional; cdkTrapFocus con autocapture, restaura el foco previo al cerrar; Escape siempre cierra (sin closeOnEscape, fiel a la referencia), clic en backdrop configurable; botón de cerrar con aria-label localizado, decorativo (aria-hidden) el backdrop mismo (botón no-interactivo salvo clic).',
  toast: 'BipToastRegion: role="region"+aria-label localizado (toast.region), vive en un overlay vía BipOverlay/ComponentPortal (BipToast.show() lo crea perezosamente). BipToastItemComponent: reusa <bip-alert> (role=status/alert según variant, botón de cerrar nativo de Alert con su propio aria-label) — el toast no añade semántica propia encima; la barra de progreso es puramente visual (no lleva aria-* porque Alert ya comunica el mensaje vía su live region).',
  tooltip: 'BipTooltipPanel: role="tooltip" con id estable (BipIdGenerator); la directiva [bipTooltip] (host de la burbuja) añade aria-describedby apuntando a ese id en el trigger, siempre presente (no solo cuando está abierta) — igual que la referencia React. Abre con hover/focus, cierra con mouseleave/blur/Escape (listener de document, limpiado al cerrar/destruir); delay/closeDelay configurables. Flecha decorativa aria-hidden.',
  popover: 'BipPopoverContent: role="dialog"+aria-labelledby apuntando al id del trigger; cdkTrapFocus con autocapture; Escape cierra, clic fuera cierra (overlayRef.outsidePointerEvents(), ignorando clics en el propio trigger para no togglear y cerrar en el mismo evento). BipPopoverTrigger: aria-haspopup="dialog"+aria-expanded+aria-controls sobre el elemento nativo que decora (sin wrapper, a diferencia de React que clona el elemento); lanza si se usa fuera de <bip-popover> (sin BIP_POPOVER_CONTEXT).',
  dropdown: 'Patrón WAI-ARIA Menu Button. BipDropdownMenu: role="menu"+aria-orientation=vertical+aria-labelledby al trigger; navegación con FocusKeyManager (↑↓ con wrap, Home/End, se saltan los items disabled); Escape cierra y devuelve el foco al trigger, Tab cierra sin bloquear el avance natural del foco; clic fuera cierra (outsidePointerEvents, ignorando el trigger). BipDropdownTrigger: aria-haspopup="true"+aria-expanded+aria-controls. BipDropdownItem: role="menuitem" (disabled nativo del <button>, sin necesidad de aria-disabled). BipDropdownItemCheckbox: role="menuitemcheckbox"+aria-checked, indicador de check decorativo aria-hidden. BipDropdownDivider: role="separator"+aria-orientation=horizontal. BipDropdownGroup: role="group"+aria-labelledby a su propio label. BipDropdownSearch: role="searchbox"+aria-label localizado. BipDropdownSubmenu: su trigger es role="menuitem" (uno más en el FocusKeyManager del menú padre, vía BIP_DROPDOWN_MENU_SCOPE) con aria-haspopup="menu"+aria-expanded+aria-controls; el panel anidado es su propio role="menu"+aria-label (el mismo label); ArrowRight en el trigger abre y enfoca el primer item; dentro del panel, FocusKeyManager propio para ↑↓/Home/End, ArrowLeft/Escape cierran y devuelven el foco al trigger sin propagar al menú raíz (no lo cierran a él).',
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
