import { render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { BipImagePopover } from './image-popover.component';

/**
 * Regresión de seguridad: `accept="image/*"` en el `<input type="file">` es solo una pista
 * para el picker del sistema operativo — el usuario puede elegir "todos los archivos" y
 * seleccionar cualquier cosa igual. Antes de este fix, `handleFileChange()` leía
 * `reader.readAsDataURL(file)` sin validar tipo ni tamaño, así que cualquier archivo
 * terminaba convertido a un data URL (string base64 completo en memoria) sin filtro.
 */
function fileInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

function selectFile(input: HTMLInputElement, file: File): void {
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('BipImagePopover — validación de archivo', () => {
  const baseProps = {
    toothNumber: 11,
    initialImages: [],
    editable: true,
    position: { top: 0, left: 0 },
  };

  it('rechaza un archivo que no es imagen y emite rejectedImage con reason "type"', async () => {
    const onRejected = vi.fn();
    const { container, fixture } = await render(BipImagePopover, {
      inputs: baseProps,
      on: { rejectedImage: onRejected },
    });

    const file = new File(['contenido'], 'malware.exe', { type: 'application/x-msdownload' });
    selectFile(fileInput(container), file);
    fixture.detectChanges();

    expect(onRejected).toHaveBeenCalledWith({ file, reason: 'type' });
    expect(screen.getByRole('alert')).toHaveTextContent('Solo se aceptan archivos de imagen.');
  });

  it('rechaza un archivo de imagen que supera maxImageSize y emite rejectedImage con reason "size"', async () => {
    const onRejected = vi.fn();
    const { container, fixture } = await render(BipImagePopover, {
      inputs: { ...baseProps, maxImageSize: 10 },
      on: { rejectedImage: onRejected },
    });

    const file = new File(['x'.repeat(100)], 'radiografia.png', { type: 'image/png' });
    selectFile(fileInput(container), file);
    fixture.detectChanges();

    expect(onRejected).toHaveBeenCalledWith({ file, reason: 'size' });
    expect(screen.getByRole('alert')).toHaveTextContent('La imagen supera el tamaño máximo permitido');
  });

  it('acepta un archivo de imagen dentro del límite sin mostrar error', async () => {
    const onRejected = vi.fn();
    const { container, fixture } = await render(BipImagePopover, {
      inputs: baseProps,
      on: { rejectedImage: onRejected },
    });

    const file = new File(['x'], 'radiografia.png', { type: 'image/png' });
    selectFile(fileInput(container), file);
    fixture.detectChanges();

    expect(onRejected).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
