import type { Page } from '@playwright/test';

/**
 * Stories/estados donde `visual/a11y-browser.spec.ts` debe correr axe además de la story
 * canónica de `COMPONENT_MATRIX`: aquí se ven hover, selected, active, outline y los paneles
 * abiertos (calendario, time-picker, dropdown…) cuyo texto usa tokens de marca y es donde el
 * contraste dark falla primero. `storyId` sale de `storybook-static/index.json`, nunca a mano.
 */
export interface A11yStateEntry {
  name: string;
  storyId: string;
  /** El calendario depende de "hoy": se congela igual que en la suite principal. */
  frozenTime?: true;
  /**
   * Reglas de axe a omitir en ESTE estado, solo con motivo documentado en la entrada
   * (hallazgos estructurales conocidos, ajenos al contraste, con su propio seguimiento).
   */
  disableRules?: string[];
  /** Lleva la story al estado a auditar (abrir panel, hover, seleccionar…). */
  setup?: (page: Page) => Promise<void>;
}

/**
 * Espera a que el panel/estado termine de transicionar antes de que axe mida el contraste.
 * `getAnimations()` y los frames no bastan (el overlay del CDK empieza a transicionar después
 * del clic y axe mide colores intermedios: falsos positivos); 300 ms deja asentadas las
 * transiciones `--duration-*` del sistema.
 */
const settle = async (page: Page) => {
  // eslint-disable-next-line playwright/no-wait-for-timeout -- ver el comentario de arriba
  await page.waitForTimeout(300);
};

export const A11Y_STATES: A11yStateEntry[] = [
  {
    name: 'button-bare-soul-hover',
    storyId: 'components-button--all-variants',
    setup: async (page) => {
      await page.getByRole('button', { name: 'Bare' }).hover();
      await settle(page);
    },
  },
  { name: 'calendar-week-today', storyId: 'components-calendar--week-view', frozenTime: true },
  {
    name: 'date-picker-open',
    storyId: 'components-datepicker--default',
    frozenTime: true,
    setup: async (page) => {
      await page.locator('.bip-date-picker-trigger').click();
      await settle(page);
    },
  },
  {
    name: 'date-range-picker-open',
    storyId: 'components-daterangepicker--default',
    frozenTime: true,
    setup: async (page) => {
      await page
        .getByRole('button', { name: /seleccion|rango|fecha/i })
        .first()
        .click();
      await settle(page);
    },
  },
  {
    name: 'time-picker-open',
    storyId: 'components-timepicker--default',
    setup: async (page) => {
      await page.locator('.bip-time-picker-trigger').click();
      await settle(page);
    },
  },
  { name: 'stepper-with-status', storyId: 'components-stepper--with-status' },
  {
    name: 'odontogram-tooth-detail',
    storyId: 'components-odontogram--with-data',
    setup: async (page) => {
      await page.locator('button.bip-odontogram-tooth-cell--button[aria-label*="46"]').click();
      await settle(page);
    },
  },
  {
    name: 'dropdown-open-checked',
    storyId: 'components-dropdown--basic',
    setup: async (page) => {
      await page.getByRole('button', { name: /Opciones/ }).click();
      await page.getByRole('menuitemcheckbox', { name: 'Notificarme' }).click();
      await page.getByRole('button', { name: /Opciones/ }).click();
      await settle(page);
    },
  },
  {
    name: 'table-sorted',
    storyId: 'components-table--default',
    setup: async (page) => {
      await page.locator('th.bip-table-header--sortable').first().click();
      await settle(page);
    },
  },
  {
    name: 'select-open',
    storyId: 'components-select--default',
    setup: async (page) => {
      await page.getByRole('combobox').first().click();
      await settle(page);
    },
  },
  { name: 'multi-select-preselected', storyId: 'components-multiselect--preselected' },
];
