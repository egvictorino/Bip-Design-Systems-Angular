import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

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

/**
 * El panel del calendario vive en el overlay del CDK y se monta tras el clic. Con 300 ms fijos
 * en una máquina lenta (Docker emulado ~3x) axe medía ANTES de que existiera: falso verde que
 * en CI (nativo) se convertía en rojo. Se espera a que el diálogo y sus días estén en el DOM.
 */
const waitForCalendarPanel = async (page: Page) => {
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('.bip-calendar-grid-day').first()).toBeVisible();
};

export const A11Y_STATES: A11yStateEntry[] = [
  ...(['bare', 'soul'] as const).flatMap((variant) => {
    const label = variant === 'bare' ? 'Bare' : 'Soul';
    return [
      {
        name: `button-${variant}-hover`,
        storyId: 'components-button--all-variants',
        setup: async (page: Page) => {
          await page.getByRole('button', { name: label }).hover();
          await settle(page);
        },
      },
      {
        // :active solo dura mientras el botón del mouse sigue presionado.
        name: `button-${variant}-active`,
        storyId: 'components-button--all-variants',
        setup: async (page: Page) => {
          await page.getByRole('button', { name: label }).hover();
          await page.mouse.down();
          await settle(page);
        },
      },
    ];
  }),
  { name: 'calendar-week-today', storyId: 'components-calendar--week-view', frozenTime: true },
  {
    // Arrastre sin soltar (soltar abre el popover): 29-dic..7-ene en el calendario congelado en
    // 2026-01-15, así que el rango incluye fechas de otro mes sobre --color-secondary.
    name: 'calendar-month-range-drag',
    storyId: 'components-calendar--month-view',
    frozenTime: true,
    setup: async (page) => {
      const cells = page.locator('.bip-calendar-month-cell');
      await cells.nth(0).hover();
      await page.mouse.down();
      await cells.nth(9).hover();
      await expect(cells.nth(0)).toHaveClass(/bip-calendar-month-cell--in-range/);
      await expect(cells.nth(9)).toHaveClass(/bip-calendar-month-cell--in-range/);
      await settle(page);
    },
  },
  {
    name: 'calendar-view-btn-active-hover',
    storyId: 'components-calendar--month-view',
    frozenTime: true,
    setup: async (page) => {
      await page.locator('.bip-calendar-view-btn--active').hover();
      await settle(page);
    },
  },
  {
    name: 'calendar-agenda',
    storyId: 'components-calendar--agenda-view',
    frozenTime: true,
    setup: async (page) => {
      await expect(page.locator('.bip-calendar-agenda-event').first()).toBeVisible();
      await settle(page);
    },
  },
  {
    name: 'calendar-agenda-filter-inactive',
    storyId: 'components-calendar--agenda-view',
    frozenTime: true,
    setup: async (page) => {
      await expect(page.locator('.bip-calendar-agenda-event').first()).toBeVisible();
      const filter = page.getByRole('checkbox').first();
      await filter.click();
      await expect(filter).toHaveAttribute('aria-checked', 'false');
      await settle(page);
    },
  },
  {
    // "Cancelada" es el filtro con menos diferencia entre activo e inactivo (surface-4 vs surface-3).
    name: 'calendar-agenda-filter-cancelled-inactive',
    storyId: 'components-calendar--agenda-view',
    frozenTime: true,
    setup: async (page) => {
      await expect(page.locator('.bip-calendar-agenda-event').first()).toBeVisible();
      const filter = page.getByRole('checkbox', { name: 'Cancelada' });
      await filter.click();
      await expect(filter).toHaveAttribute('aria-checked', 'false');
      await settle(page);
    },
  },
  {
    name: 'date-picker-open',
    storyId: 'components-datepicker--default',
    frozenTime: true,
    setup: async (page) => {
      await page.locator('.bip-date-picker-trigger').click();
      await waitForCalendarPanel(page);
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
      await waitForCalendarPanel(page);
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
