/**
 * Manifiesto de cobertura visual por componente — un screenshot canónico por secondary
 * entry point de `projects/bip-angular/` (50, todos salvo `core` — ver SKIP_LIST abajo,
 * mismo criterio que `SKIP_LIST` en `testing/a11y.spec.ts`: no renderiza UI propia), más
 * shots extra (`shot`) para modos con geometría propia que la story canónica no muestra.
 *
 * `storyId` es la story canónica de cada componente (la primera exportada de su
 * `*.stories.ts`) — se extrajo del `index.json` real de Storybook
 * (`storybook-static/index.json` tras `pnpm build-storybook`, o `http://localhost:6006/
 * index.json` con el dev server corriendo) en vez de reimplementar el algoritmo de slugify
 * de Storybook, para no arriesgar un ID mal calculado. Si un componente cambia el nombre de
 * su primera story exportada, el test de este manifiesto fallará con "story not found" en
 * vez de silenciosamente screenshotear la story vieja — ver `component-matrix.spec.ts`.
 *
 * `rtl: true` marca el subset con geometría direccional real — mismo criterio que la
 * referencia React, más `Breadcrumb` y `Pagination` (chevrones espejados con
 * `transform: scaleX(var(--rtl-x))`, confirmado en su CSS) — el resto no gana nada de un
 * segundo shot en RTL porque no tiene margin/padding/inset/transform direccional que espejar.
 */
export interface ComponentMatrixEntry {
  dir: string;
  storyId: string;
  /** Nombre del PNG y del test; por defecto `dir`. Obligatorio (y único) en los shots extra. */
  shot?: string;
  rtl?: true;
}

export const COMPONENT_MATRIX: ComponentMatrixEntry[] = [
  { dir: 'accordion', storyId: 'components-accordion--single' },
  { dir: 'alert', storyId: 'components-alert--info' },
  { dir: 'avatar', storyId: 'components-avatar--initials' },
  { dir: 'badge', storyId: 'components-badge--default' },
  { dir: 'breadcrumb', storyId: 'components-breadcrumb--basic', rtl: true },
  { dir: 'button', storyId: 'components-button--default' },
  { dir: 'calendar', storyId: 'components-calendar--month-view', rtl: true },
  { dir: 'card', storyId: 'components-card--simple' },
  { dir: 'checkbox', storyId: 'components-checkbox--default' },
  { dir: 'confirm-dialog', storyId: 'components-confirmdialog--danger' },
  { dir: 'container', storyId: 'components-container--default' },
  { dir: 'data-table', storyId: 'components-datatable--default' },
  { dir: 'date-picker', storyId: 'components-datepicker--default', rtl: true },
  { dir: 'date-range-picker', storyId: 'components-daterangepicker--default' },
  { dir: 'divider', storyId: 'components-divider--horizontal' },
  { dir: 'drawer-panel', storyId: 'components-drawerpanel--basic', rtl: true },
  { dir: 'dropdown', storyId: 'components-dropdown--basic', rtl: true },
  { dir: 'empty-state', storyId: 'components-emptystate--default' },
  { dir: 'file-upload', storyId: 'components-fileupload--default' },
  { dir: 'grid', storyId: 'components-grid--fixed-columns', rtl: true },
  { dir: 'heading', storyId: 'components-heading--all-levels' },
  { dir: 'input', storyId: 'components-input--default', rtl: true },
  { dir: 'link', storyId: 'components-link--default' },
  { dir: 'modal', storyId: 'components-modal--basic' },
  { dir: 'multi-select', storyId: 'components-multiselect--default', rtl: true },
  {
    dir: 'multi-select',
    shot: 'multi-select-trigger-search',
    storyId: 'components-multiselect--trigger-search',
    rtl: true,
  },
  {
    dir: 'multi-select',
    shot: 'multi-select-variants',
    storyId: 'components-multiselect--variants',
    rtl: true,
  },
  { dir: 'navbar', storyId: 'components-navbar--basic' },
  { dir: 'number-input', storyId: 'components-numberinput--default', rtl: true },
  { dir: 'odontogram', storyId: 'components-odontogram--default' },
  { dir: 'pagination', storyId: 'components-pagination--basic', rtl: true },
  { dir: 'popover', storyId: 'components-popover--basic' },
  { dir: 'progress-bar', storyId: 'components-progressbar--default' },
  { dir: 'radio', storyId: 'components-radio--default' },
  { dir: 'search-input', storyId: 'components-searchinput--default', rtl: true },
  { dir: 'select', storyId: 'components-select--default', rtl: true },
  {
    dir: 'select',
    shot: 'select-searchable-clearable',
    storyId: 'components-select--searchable-clearable',
    rtl: true,
  },
  { dir: 'sidebar', storyId: 'components-sidebar--basic', rtl: true },
  { dir: 'skeleton', storyId: 'components-skeleton--text' },
  { dir: 'slider', storyId: 'components-slider--default' },
  { dir: 'spinner', storyId: 'components-spinner--default' },
  { dir: 'stack', storyId: 'components-stack--row', rtl: true },
  { dir: 'stats-card', storyId: 'components-statscard--default' },
  { dir: 'stepper', storyId: 'components-stepper--circle', rtl: true },
  { dir: 'table', storyId: 'components-table--default' },
  { dir: 'tabs', storyId: 'components-tabs--line', rtl: true },
  { dir: 'text', storyId: 'components-text--default', rtl: true },
  { dir: 'textarea', storyId: 'components-textarea--default' },
  { dir: 'time-picker', storyId: 'components-timepicker--default' },
  { dir: 'timeline', storyId: 'components-timeline--vertical', rtl: true },
  { dir: 'toast', storyId: 'components-toast--basic' },
  { dir: 'toggle', storyId: 'components-toggle--default', rtl: true },
  { dir: 'tooltip', storyId: 'components-tooltip--basic', rtl: true },
];

/** Igual criterio que `SKIP_LIST` en `testing/a11y.spec.ts`: sin UI propia que capturar. */
export const SKIP_LIST = new Set(['core']);
