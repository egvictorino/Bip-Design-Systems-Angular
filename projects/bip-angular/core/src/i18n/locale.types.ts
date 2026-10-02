import type {
  CalendarEventStatus,
  CalendarView,
  ToothCondition,
  ToothImageType,
  ToothSurface,
} from '../types';

/**
 * Diccionario completo consumido por cada componente vía `injectBipLocale()`. `locale` es un
 * tag BCP-47 que alimenta todo `Intl.*` de la librería (Calendar/DatePicker/DateRangePicker,
 * pipes `bipCurrency`/`bipDate`) — no es solo una etiqueta, también dirige el formateo de
 * fechas y números.
 *
 * Puerto exacto de bip-design-system (React) src/i18n/types.ts — misma forma, para que migrar
 * un diccionario de una librería a otra sea un copy-paste literal.
 */
export interface BipLocale {
  locale: string;

  alert: {
    close: string;
  };

  avatar: {
    /** ej. (n) => `${n} más` */
    overflow: (count: number) => string;
    /** Fallback de `alt`/`aria-label` cuando no se provee `alt` ni `name` — la referencia React
     * hardcodea `'Avatar'`; aquí pasa por el diccionario para cumplir el guard
     * `no-hardcoded-strings`. */
    fallbackAlt: string;
  };

  breadcrumb: {
    nav: string;
  };

  card: {
    loading: string;
  };

  confirmDialog: {
    confirm: string;
    cancel: string;
  };

  dataTable: {
    emptyMessage: string;
    searchPlaceholder: string;
    columnVisibility: string;
    columnVisibilityToggle: string;
    selectAllRows: string;
    selectRow: (rowIndex: number) => string;
    resultsSummary: (shown: number, total: number) => string;
    selectedCount: (count: number) => string;
    clearSelection: string;
  };

  datePicker: {
    prevYear: string;
    nextYear: string;
    selectMonth: string;
    monthOfYear: (month: string, year: number) => string;
    prevMonth: string;
    nextMonth: string;
    selectMonthAndYear: (month: string, year: number) => string;
    selectYear: string;
    prevYears: string;
    nextYears: string;
    yearRange: (fromYear: number, toYear: number) => string;
    placeholder: string;
    clear: string;
    calendar: string;
    today: string;
    monthNames: string[];
    monthNamesShort: string[];
    dayLabels: string[];
  };

  dateRangePicker: {
    prevYear: string;
    nextYear: string;
    selectMonth: string;
    monthOfYear: (month: string, year: number) => string;
    prevMonth: string;
    nextMonth: string;
    selectMonthAndYear: (month: string, year: number) => string;
    selectYear: string;
    prevYears: string;
    nextYears: string;
    yearRange: (fromYear: number, toYear: number) => string;
    placeholder: string;
    selectRange: string;
    clearSelection: string;
    monthNames: string[];
    monthNamesShort: string[];
    dayLabels: string[];
  };

  drawerPanel: {
    close: string;
  };

  dropdown: {
    search: string;
    searchPlaceholder: string;
  };

  fileUpload: {
    remove: (fileName: string) => string;
    dropHere: string;
    dragHere: string;
    clickToSelect: string;
    formats: (accept: string) => string;
    maxSize: (size: string) => string;
    uploading: string;
  };

  input: {
    clear: string;
    showPassword: string;
    hidePassword: string;
  };

  link: {
    opensInNewTab: string;
  };

  modal: {
    close: string;
  };

  multiSelect: {
    placeholder: string;
    searchPlaceholder: string;
    selectAll: string;
    selectVisible: (count: number) => string;
    remove: (label: string) => string;
    overflow: (count: number) => string;
    overflowChip: (count: number) => string;
    removeAll: string;
    search: string;
    loading: string;
    loadingText: string;
    options: string;
    noResults: string;
  };

  select: {
    options: string;
    noResults: string;
  };

  navbar: {
    mainNav: string;
    closeMenu: string;
    openMenu: string;
  };

  numberInput: {
    decrement: string;
    increment: string;
  };

  odontogram: {
    conditionLabels: Record<ToothCondition, string>;
    surfaceLabels: Record<ToothSurface, string>;
    imageTypeLabels: Record<ToothImageType, string>;
    toothNames: Record<number, string>;
    selectTooth: (toothNumber: number, selected: boolean) => string;
    toothImages: (toothNumber: number) => string;
    closeImages: string;
    attachedImages: string;
    viewImage: (index: number, typeLabel: string) => string;
    removeImage: (index: number) => string;
    noImagesAttached: string;
    newImage: string;
    imageType: string;
    selectImageFile: string;
    previewAlt: string;
    changeFile: string;
    selectFile: string;
    toothNote: (toothNumber: number) => string;
    tooth: (toothNumber: number) => string;
    imagePreviewAlt: (typeLabel: string, toothNumber: number) => string;
    closeNote: string;
    closeDetail: string;
    conditions: string;
    noteWithState: (toothNumber: number, hasNote: boolean) => string;
    imagesWithCount: (toothNumber: number, count: number) => string;
    toothLabel: (toothNumber: number, isMissing: boolean, name: string) => string;
    noteLabel: string;
    imagesLabel: (count: number) => string;
    notePlaceholder: string;
    save: string;
    imagesGalleryTitle: (toothNumber: number) => string;
    cancel: string;
    add: string;
    addImage: string;
    invalidImageType: string;
    imageTooLarge: (maxSizeLabel: string) => string;
  };

  pagination: {
    nav: string;
    prevPage: string;
    nextPage: string;
    page: (n: number) => string;
  };

  progressBar: {
    defaultLabel: string;
  };

  searchInput: {
    clear: string;
  };

  sidebar: {
    nav: string;
    navLandmark: string;
    expand: string;
    collapse: string;
    /** Sufijo de notificaciones del badge cuando el sidebar está colapsado (solo el ícono es
     * visible) — la referencia React lo hardcodea en español; aquí pasa por el diccionario para
     * cumplir el guard `no-hardcoded-strings`. */
    badgeCount: (count: number) => string;
  };

  spinner: {
    defaultLabel: string;
  };

  statsCard: {
    loading: string;
    trend: (trend: number) => string;
  };

  stepper: {
    nav: string;
  };

  table: {
    emptyMessage: string;
  };

  timePicker: {
    placeholder: string;
    openPicker: string;
    selectTime: string;
    hours: string;
    minutes: string;
    amPm: string;
    hourSelectedAnnouncement: (hour: string) => string;
    timeSelectedAnnouncement: (time: string) => string;
    periodSelectedAnnouncement: (period: string) => string;
    /** Atajo "hora actual" dentro del panel. La referencia React lo hardcodea como literal
     * "Ahora"; aquí pasa por el diccionario para cumplir el guard `no-hardcoded-strings`. */
    now: string;
  };

  toast: {
    region: string;
  };

  calendar: {
    dayNames: string[];
    views: Record<CalendarView, string>;
    statusLabels: Record<CalendarEventStatus, string>;
    upcomingEvents: string;
    prevPeriod: string;
    nextPeriod: string;
    selectedDateRange: string;
    close: string;
    monthLabel: (month: string) => string;
    calendarLabel: string;
    today: string;
    createEvent: string;
    overflowCount: (count: number) => string;
    noEventsFiltered: string;
    noEventsUpcoming: string;
  };
}

/** Deep partial para overrides parciales (ver `mergeLocale()`). */
export type PartialBipLocale = {
  [K in keyof BipLocale]?: BipLocale[K] extends (...args: never[]) => unknown
    ? BipLocale[K]
    : BipLocale[K] extends object
      ? Partial<BipLocale[K]>
      : BipLocale[K];
};
