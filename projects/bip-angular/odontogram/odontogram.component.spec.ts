import { Component } from '@angular/core';
import { render, screen, within, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { BipSize } from '@bip-design-systems/angular/core';
import { BipOdontogram } from './odontogram.component';
import type { DentitionMode, OdontogramValue, ToothImage } from './odontogram.types';

const SAMPLE_IMG: ToothImage = { type: 'radiograph', url: 'data:image/png;base64,abc123' };
const SAMPLE_IMG2: ToothImage = { type: 'photo', url: 'data:image/png;base64,xyz789' };

@Component({
  imports: [BipOdontogram],
  template: `
    <bip-odontogram
      [value]="value"
      (valueChange)="onValueChange($event)"
      [disabled]="disabled"
      [dentition]="dentition"
      [label]="label"
      [size]="size"
    />
  `,
})
class HostComponent {
  value: OdontogramValue = {};
  disabled = false;
  dentition: DentitionMode = 'permanent';
  label = '';
  size: BipSize = 'md';
  onChange = vi.fn<(value: OdontogramValue) => void>();

  onValueChange(next: OdontogramValue): void {
    this.value = next;
    this.onChange(next);
  }
}

const getToothSVG = (toothNumber: number) =>
  screen.getByRole('img', { name: new RegExp(`Diente ${toothNumber}`) });
const getToothSVGQuery = (toothNumber: number) =>
  screen.queryByRole('img', { name: new RegExp(`Diente ${toothNumber}`) });
const getToothButton = (toothNumber: number) =>
  screen.getByRole('button', { name: new RegExp(`Seleccionar diente ${toothNumber}`) });

const openDetailPanel = async (user: ReturnType<typeof userEvent.setup>, toothNumber: number) => {
  await user.click(getToothButton(toothNumber));
  return screen.getByTestId('tooth-detail-panel');
};

describe('BipOdontogram — render', () => {
  it('renderiza sin errores', async () => {
    await render(HostComponent);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('renderiza las 32 piezas permanentes', async () => {
    await render(HostComponent);
    const allTeeth = [
      11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37,
      38, 41, 42, 43, 44, 45, 46, 47, 48,
    ];
    allTeeth.forEach((n) => expect(getToothSVGQuery(n)).toBeInTheDocument());
  });

  it('muestra el número FDI de cada cuadrante', async () => {
    await render(HostComponent);
    expect(screen.getAllByText('11').length).toBeGreaterThan(0);
    expect(screen.getAllByText('21').length).toBeGreaterThan(0);
    expect(screen.getAllByText('31').length).toBeGreaterThan(0);
    expect(screen.getAllByText('41').length).toBeGreaterThan(0);
  });

  it('renderiza el label y lo vincula al grupo vía aria-labelledby', async () => {
    await render(HostComponent, { componentProperties: { label: 'Odontograma del paciente' } });
    const label = screen.getByText('Odontograma del paciente');
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-labelledby', label.id);
  });

  it('no renderiza el label cuando se omite', async () => {
    await render(HostComponent);
    expect(screen.queryByText(/Odontograma/)).not.toBeInTheDocument();
  });
});

describe('BipOdontogram — condiciones y colores', () => {
  it('aplica la clase de caries a la superficie correspondiente', async () => {
    await render(HostComponent, {
      componentProperties: { value: { 11: { surfaces: { occlusal: 'caries' } } }, disabled: true },
    });
    const surface = getToothSVG(11).querySelector('[aria-label="Oclusal"]');
    expect(surface).toHaveClass('bip-tooth-fill-caries');
  });

  it('aplica la clase de corona a todas las superficies', async () => {
    await render(HostComponent, {
      componentProperties: { value: { 16: { condition: 'crown' } }, disabled: true },
    });
    const surfaces = getToothSVG(16).querySelectorAll('polygon');
    surfaces.forEach((s) => expect(s).toHaveClass('bip-tooth-fill-crown'));
  });

  it('aplica la clase de ausente a todas las superficies', async () => {
    await render(HostComponent, {
      componentProperties: { value: { 18: { condition: 'missing' } }, disabled: true },
    });
    const surfaces = getToothSVG(18).querySelectorAll('polygon');
    surfaces.forEach((s) => expect(s).toHaveClass('bip-tooth-fill-missing'));
  });

  it('renderiza superficies sanas con la clase healthy por defecto', async () => {
    await render(HostComponent);
    const surfaces = getToothSVG(11).querySelectorAll('polygon');
    surfaces.forEach((s) => expect(s).toHaveClass('bip-tooth-fill-healthy'));
  });

  it('renderiza las líneas X de marcador para pieza ausente', async () => {
    await render(HostComponent, {
      componentProperties: { value: { 18: { condition: 'missing' } }, disabled: true },
    });
    expect(getToothSVG(18).querySelectorAll('line')).toHaveLength(2);
  });
});

describe('BipOdontogram — accesibilidad', () => {
  it('cada SVG de diente tiene aria-label con el número y su ausencia', async () => {
    await render(HostComponent, {
      componentProperties: { value: { 18: { condition: 'missing' } }, disabled: true },
    });
    expect(getToothSVG(18)).toHaveAttribute('aria-label', expect.stringContaining('Ausente'));
  });

  it('las superficies en la cuadrícula principal NO tienen role="button"', async () => {
    await render(HostComponent);
    expect(getToothSVG(11).querySelectorAll('[role="button"]')).toHaveLength(0);
  });

  it('las superficies en modo disabled NO tienen role="button"', async () => {
    await render(HostComponent, { componentProperties: { disabled: true } });
    expect(getToothSVG(11).querySelectorAll('[role="button"]')).toHaveLength(0);
  });

  it('las superficies del panel de detalle tienen role="button" cuando es interactivo', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    const surfaces = within(panel)
      .getByRole('group', { name: /Diente 11/ })
      .querySelectorAll('[role="button"]');
    expect(surfaces.length).toBe(5);
  });

  it('las superficies activas tienen aria-pressed="true" en el panel', async () => {
    const user = userEvent.setup();
    await render(HostComponent, {
      componentProperties: { value: { 11: { surfaces: { occlusal: 'caries' } } } },
    });
    const panel = await openDetailPanel(user, 11);
    const occlusal = within(panel)
      .getByRole('group', { name: /Diente 11/ })
      .querySelector('[aria-label="Oclusal"]');
    expect(occlusal).toHaveAttribute('aria-pressed', 'true');
  });

  it('el diente del panel es role="group" con sus 5 superficies button; la cuadrícula sigue siendo img (nested-interactive)', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    const group = within(panel).getByRole('group', { name: /Diente 11/ });
    expect(group.tagName.toLowerCase()).toBe('svg');
    ['Oclusal', 'Bucal', 'Lingual', 'Mesial', 'Distal'].forEach((name) =>
      expect(within(group).getByRole('button', { name })).toBeInTheDocument()
    );
    expect(within(panel).queryByRole('img', { name: /Diente 11/ })).toBeNull();
    expect(getToothSVG(11).closest('[data-testid="tooth-detail-panel"]')).toBeNull();
  });

  it('los botones de diente indican selección con aria-pressed', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const toothBtn = getToothButton(11);
    expect(toothBtn).toHaveAttribute('aria-pressed', 'false');
    await user.click(toothBtn);
    expect(toothBtn).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('BipOdontogram — interactividad', () => {
  it('clic en un diente abre el panel de detalle', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    await user.click(getToothButton(11));
    expect(screen.getByTestId('tooth-detail-panel')).toBeInTheDocument();
  });

  it('el panel muestra el número de diente', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    await user.click(getToothButton(16));
    expect(screen.getByTestId('tooth-detail-panel')).toHaveTextContent('Diente 16');
  });

  it('emite valueChange con condición caries al clicar una superficie', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    const occlusal = within(panel)
      .getByRole('group', { name: /Diente 11/ })
      .querySelector('[aria-label="Oclusal"]')!;
    await user.click(occlusal);

    expect(fixture.componentInstance.onChange).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.value[11]?.surfaces?.occlusal).toBe('caries');
  });

  it('emite condición de todo el diente tras elegirla en la toolbar', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent);
    const panel = await openDetailPanel(user, 16);
    await user.click(within(panel).getByRole('button', { name: 'Ausente' }));
    const anyPolygon = within(panel)
      .getByRole('group', { name: /Diente 16/ })
      .querySelector('polygon')!;
    await user.click(anyPolygon);

    expect(fixture.componentInstance.value[16]?.condition).toBe('missing');
  });

  it('no permite abrir el panel cuando está disabled', async () => {
    await render(HostComponent, { componentProperties: { disabled: true } });
    expect(screen.queryAllByRole('button', { name: /Seleccionar diente/ })).toHaveLength(0);
  });

  it('seleccionar Sano en la toolbar quita la condición de superficie existente', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent, {
      componentProperties: { value: { 11: { surfaces: { occlusal: 'caries' } } } },
    });
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: 'Sano' }));
    const occlusal = within(panel)
      .getByRole('group', { name: /Diente 11/ })
      .querySelector('[aria-label="Oclusal"]')!;
    await user.click(occlusal);

    expect(fixture.componentInstance.value[11]?.surfaces?.occlusal).toBeUndefined();
  });

  it('preserva el valor de otras piezas al cambiar una', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent, {
      componentProperties: { value: { 21: { surfaces: { occlusal: 'restoration' } } } },
    });
    const panel = await openDetailPanel(user, 11);
    const occlusal = within(panel)
      .getByRole('group', { name: /Diente 11/ })
      .querySelector('[aria-label="Oclusal"]')!;
    await user.click(occlusal);

    expect(fixture.componentInstance.value[21]?.surfaces?.occlusal).toBe('restoration');
    expect(fixture.componentInstance.value[11]?.surfaces?.occlusal).toBe('caries');
  });

  it('clicar el mismo diente lo deselecciona y cierra el panel', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    await user.click(getToothButton(11));
    expect(screen.getByTestId('tooth-detail-panel')).toBeInTheDocument();
    await user.click(getToothButton(11));
    expect(screen.queryByTestId('tooth-detail-panel')).not.toBeInTheDocument();
  });

  it('el botón Cerrar detalle cierra el panel', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    await openDetailPanel(user, 11);
    await user.click(screen.getByRole('button', { name: 'Cerrar detalle' }));
    expect(screen.queryByTestId('tooth-detail-panel')).not.toBeInTheDocument();
  });

  it('la toolbar tiene todos los botones de condición', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    expect(within(panel).getByRole('button', { name: 'Sano' })).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Caries' })).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Corona' })).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Ausente' })).toBeInTheDocument();
  });

  it('la herramienta activa por defecto es Caries', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    expect(within(panel).getByRole('button', { name: 'Caries' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(within(panel).getByRole('button', { name: 'Sano' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });
});

describe('BipOdontogram — tamaño', () => {
  it('sm renderiza SVG de 24px', async () => {
    await render(HostComponent, { componentProperties: { size: 'sm' } });
    const svg = getToothSVG(11);
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('md (default) renderiza SVG de 32px', async () => {
    await render(HostComponent);
    expect(getToothSVG(11)).toHaveAttribute('width', '32');
  });

  it('lg renderiza SVG de 40px', async () => {
    await render(HostComponent, { componentProperties: { size: 'lg' } });
    expect(getToothSVG(11)).toHaveAttribute('width', '40');
  });

  it('el panel de detalle renderiza el SVG grande (xl=120px)', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    const detailSvg = within(panel).getByRole('group', { name: /Diente 11/ });
    expect(detailSvg).toHaveAttribute('width', '120');
    expect(screen.getAllByRole('img', { name: /Diente 11/ }).length).toBe(1);
  });
});

describe('BipOdontogram — dentición primaria', () => {
  const PRIMARY_TEETH = [
    51, 52, 53, 54, 55, 61, 62, 63, 64, 65, 71, 72, 73, 74, 75, 81, 82, 83, 84, 85,
  ];
  const PERMANENT_TEETH = [11, 12, 21, 22, 31, 32, 41, 42];

  it('renderiza 20 piezas en modo primario', async () => {
    await render(HostComponent, { componentProperties: { dentition: 'primary' } });
    expect(screen.getAllByRole('img')).toHaveLength(20);
  });

  it('renderiza todos los números FDI primarios', async () => {
    await render(HostComponent, { componentProperties: { dentition: 'primary' } });
    PRIMARY_TEETH.forEach((n) => expect(getToothSVG(n)).toBeInTheDocument());
  });

  it('no renderiza piezas permanentes en modo primario', async () => {
    await render(HostComponent, { componentProperties: { dentition: 'primary' } });
    PERMANENT_TEETH.forEach((n) => expect(getToothSVGQuery(n)).not.toBeInTheDocument());
  });

  it('funciona interactivamente con piezas primarias vía el panel', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent, {
      componentProperties: { dentition: 'primary' },
    });
    const panel = await openDetailPanel(user, 51);
    const occlusal = within(panel)
      .getByRole('group', { name: /Diente 51/ })
      .querySelector('[aria-label="Oclusal"]')!;
    await user.click(occlusal);

    expect(fixture.componentInstance.onChange).toHaveBeenCalledTimes(1);
    expect(Object.values(fixture.componentInstance.value)[0]?.surfaces?.occlusal).toBe('caries');
  });

  it('disabled evita cambios en modo primario', async () => {
    const { fixture } = await render(HostComponent, {
      componentProperties: { dentition: 'primary', disabled: true },
    });
    expect(screen.queryAllByRole('button', { name: /Seleccionar diente/ })).toHaveLength(0);
    expect(fixture.componentInstance.onChange).not.toHaveBeenCalled();
  });
});

describe('BipOdontogram — notas por diente', () => {
  it('el panel tiene el botón de Nota en modo interactivo', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    expect(within(panel).getByRole('button', { name: /Nota del diente 11/ })).toBeInTheDocument();
  });

  it('el aria-label de Nota indica cuando la pieza tiene nota', async () => {
    const user = userEvent.setup();
    await render(HostComponent, {
      componentProperties: { value: { 11: { notes: 'fractura leve' } } },
    });
    const panel = await openDetailPanel(user, 11);
    expect(within(panel).getByRole('button', { name: /tiene nota/ })).toBeInTheDocument();
  });

  it('clicar Nota abre el popover con el textarea', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Nota del diente 11/ }));

    expect(screen.getByRole('dialog', { name: /Nota del diente 11/ })).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('el textarea se precarga con la nota existente', async () => {
    const user = userEvent.setup();
    await render(HostComponent, {
      componentProperties: { value: { 16: { notes: 'corona temporal' } } },
    });
    const panel = await openDetailPanel(user, 16);
    await user.click(within(panel).getByRole('button', { name: /Nota del diente 16/ }));

    expect(screen.getByRole('textbox')).toHaveValue('corona temporal');
  });

  it('cerrar con ✕ no llama a onChange', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Nota del diente 11/ }));
    await user.click(screen.getByRole('button', { name: 'Cerrar nota' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fixture.componentInstance.onChange).not.toHaveBeenCalled();
  });

  it('Escape cierra el popover sin llamar a onChange', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Nota del diente 11/ }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fixture.componentInstance.onChange).not.toHaveBeenCalled();
  });

  it('clic en el backdrop cierra el popover sin llamar a onChange', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Nota del diente 11/ }));
    const backdrop = document.querySelector('.bip-note-popover-backdrop') as HTMLElement;
    await user.click(backdrop);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fixture.componentInstance.onChange).not.toHaveBeenCalled();
  });

  it('Guardar emite valueChange con la nota actualizada', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Nota del diente 11/ }));
    await user.type(screen.getByRole('textbox'), 'caries interproximal');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(fixture.componentInstance.onChange).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.value[11]?.notes).toBe('caries interproximal');
  });

  it('guardar texto vacío borra la clave notes', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent, {
      componentProperties: { value: { 11: { notes: 'nota a borrar' } } },
    });
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Nota del diente 11/ }));
    await user.clear(screen.getByRole('textbox'));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(fixture.componentInstance.value[11]?.notes).toBeUndefined();
  });

  it('guardar cierra el popover', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Nota del diente 11/ }));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('guardar preserva condición/superficies existentes', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent, {
      componentProperties: { value: { 16: { condition: 'crown', surfaces: {} } } },
    });
    const panel = await openDetailPanel(user, 16);
    await user.click(within(panel).getByRole('button', { name: /Nota del diente 16/ }));
    await user.type(screen.getByRole('textbox'), 'corona provisional');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(fixture.componentInstance.value[16]?.condition).toBe('crown');
    expect(fixture.componentInstance.value[16]?.notes).toBe('corona provisional');
  });

  it('el textarea recibe el foco al abrirse', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Nota del diente 11/ }));

    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('cerrar con ✕ devuelve el foco al botón Nota', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    const noteBtn = within(panel).getByRole('button', { name: /Nota del diente 11/ });
    await user.click(noteBtn);
    await user.click(screen.getByRole('button', { name: 'Cerrar nota' }));

    expect(noteBtn).toHaveFocus();
  });
});

describe('BipOdontogram — imágenes por diente', () => {
  it('el panel tiene el botón de Imágenes en modo interactivo', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    expect(
      within(panel).getByRole('button', { name: /Imágenes del diente 11/ })
    ).toBeInTheDocument();
  });

  it('el aria-label incluye el conteo de imágenes', async () => {
    const user = userEvent.setup();
    await render(HostComponent, {
      componentProperties: { value: { 16: { images: [SAMPLE_IMG, SAMPLE_IMG2] } } },
    });
    const panel = await openDetailPanel(user, 16);
    const btn = within(panel).getByRole('button', { name: /Imágenes del diente 16/ });
    expect(btn.getAttribute('aria-label')).toMatch(/2 imagen/);
  });

  it('el aria-label no menciona imágenes cuando no hay ninguna', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    expect(within(panel).getByRole('button', { name: 'Imágenes del diente 11' })).toHaveAttribute(
      'aria-label',
      'Imágenes del diente 11'
    );
  });

  it('clicar Imágenes abre el popover', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Imágenes del diente 11/ }));

    expect(screen.getByRole('dialog', { name: /Imágenes del diente 11/ })).toBeInTheDocument();
  });

  it('en modo editable muestra el selector de tipo y el botón de archivo', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Imágenes del diente 11/ }));

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Seleccionar archivo/ })).toBeInTheDocument();
  });

  it('el selector de tipo tiene las 3 opciones correctas', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Imágenes del diente 11/ }));

    expect(screen.getByRole('option', { name: 'Radiografía' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Fotografía' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Otra' })).toBeInTheDocument();
  });

  it('Escape cierra el popover de imágenes sin llamar a onChange', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Imágenes del diente 11/ }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fixture.componentInstance.onChange).not.toHaveBeenCalled();
  });

  it('muestra miniaturas con aria-label cuando hay imágenes', async () => {
    const user = userEvent.setup();
    await render(HostComponent, {
      componentProperties: { value: { 11: { images: [SAMPLE_IMG, SAMPLE_IMG2] } } },
    });
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Imágenes del diente 11/ }));

    expect(screen.getByRole('button', { name: /Ver imagen 1: Radiografía/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver imagen 2: Fotografía/ })).toBeInTheDocument();
  });

  it('muestra el conteo de imágenes en el encabezado', async () => {
    const user = userEvent.setup();
    await render(HostComponent, {
      componentProperties: { value: { 11: { images: [SAMPLE_IMG, SAMPLE_IMG2] } } },
    });
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Imágenes del diente 11/ }));

    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('clicar una miniatura la muestra en la vista previa', async () => {
    const user = userEvent.setup();
    await render(HostComponent, {
      componentProperties: { value: { 11: { images: [SAMPLE_IMG, SAMPLE_IMG2] } } },
    });
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Imágenes del diente 11/ }));
    await user.click(screen.getByRole('button', { name: /Ver imagen 2/ }));

    const preview = screen.getByAltText(/Fotografía — diente 11/);
    expect(preview).toHaveAttribute('src', SAMPLE_IMG2.url);
  });

  it('eliminar una imagen emite valueChange con el array actualizado', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent, {
      componentProperties: { value: { 11: { images: [SAMPLE_IMG, SAMPLE_IMG2] } } },
    });
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Imágenes del diente 11/ }));
    await user.click(screen.getByRole('button', { name: 'Eliminar imagen 1' }));

    expect(fixture.componentInstance.onChange).toHaveBeenCalled();
    expect(fixture.componentInstance.value[11]?.images).toHaveLength(1);
    expect(fixture.componentInstance.value[11]?.images?.[0].url).toBe(SAMPLE_IMG2.url);
  });

  it('eliminar la última imagen quita la clave images', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent, {
      componentProperties: { value: { 11: { images: [SAMPLE_IMG] } } },
    });
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Imágenes del diente 11/ }));
    await user.click(screen.getByRole('button', { name: 'Eliminar imagen 1' }));

    expect(fixture.componentInstance.value[11]?.images).toBeUndefined();
  });

  it('eliminar imagen preserva otras propiedades de la pieza', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent, {
      componentProperties: { value: { 16: { condition: 'crown', images: [SAMPLE_IMG] } } },
    });
    const panel = await openDetailPanel(user, 16);
    await user.click(within(panel).getByRole('button', { name: /Imágenes del diente 16/ }));
    await user.click(screen.getByRole('button', { name: 'Eliminar imagen 1' }));

    expect(fixture.componentInstance.value[16]?.condition).toBe('crown');
    expect(fixture.componentInstance.value[16]?.images).toBeUndefined();
  });

  it('cerrar el popover de imágenes devuelve el foco al botón Imágenes', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    const imageBtn = within(panel).getByRole('button', { name: 'Imágenes del diente 11' });
    await user.click(imageBtn);
    await user.click(screen.getByRole('button', { name: 'Cerrar imágenes' }));

    expect(imageBtn).toHaveFocus();
  });

  it('clic en el backdrop cierra el popover de imágenes sin llamar a onChange', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Imágenes del diente 11/ }));
    const backdrop = document.querySelector('.bip-image-popover-backdrop') as HTMLElement;
    await user.click(backdrop);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fixture.componentInstance.onChange).not.toHaveBeenCalled();
  });

  it('abrir el popover sin imágenes muestra el formulario de alta directamente', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    await user.click(within(panel).getByRole('button', { name: /Imágenes del diente 11/ }));

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Agregar imagen/ })).not.toBeInTheDocument();
  });
});

describe('BipOdontogram — teclado', () => {
  it('los botones de diente son enfocables en modo interactivo', async () => {
    await render(HostComponent);
    expect(getToothButton(11)).toBeInTheDocument();
  });

  it('las celdas en modo disabled no son botones enfocables', async () => {
    await render(HostComponent, { componentProperties: { disabled: true } });
    expect(screen.queryAllByRole('button', { name: /Seleccionar diente/ })).toHaveLength(0);
  });

  it('las superficies del panel tienen tabindex=0 en modo interactivo', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    const surfaces = within(panel)
      .getByRole('group', { name: /Diente 11/ })
      .querySelectorAll('[role="button"]');
    surfaces.forEach((s) => expect(s).toHaveAttribute('tabindex', '0'));
  });

  it('Enter sobre un botón de diente abre el panel', async () => {
    const user = userEvent.setup();
    await render(HostComponent);
    const toothBtn = getToothButton(11);
    toothBtn.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('tooth-detail-panel')).toBeInTheDocument();
  });

  it('Enter sobre una superficie del panel aplica la condición', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent);
    const panel = await openDetailPanel(user, 11);
    const occlusal = within(panel)
      .getByRole('group', { name: /Diente 11/ })
      .querySelector('[aria-label="Oclusal"]') as HTMLElement;
    occlusal.focus();
    await user.keyboard('{Enter}');

    expect(fixture.componentInstance.onChange).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.value[11]?.surfaces?.occlusal).toBe('caries');
  });

  it('Espacio sobre una superficie del panel aplica la condición', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(HostComponent);
    const panel = await openDetailPanel(user, 21);
    await user.click(within(panel).getByRole('button', { name: 'Restauración' }));
    const mesial = within(panel)
      .getByRole('group', { name: /Diente 21/ })
      .querySelector('[aria-label="Mesial"]') as HTMLElement;
    mesial.focus();
    await user.keyboard(' ');

    expect(fixture.componentInstance.value[21]?.surfaces?.mesial).toBe('restoration');
  });
});
