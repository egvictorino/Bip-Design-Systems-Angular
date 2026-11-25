import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BipFileUpload } from './file-upload.component';
import type { BipRejectedFile } from './file-upload.component';

function makeFile(name: string, size: number, type = 'text/plain'): File {
  const file = new File(['x'.repeat(size)], name, { type });
  return file;
}

@Component({
  imports: [BipFileUpload],
  template: `
    <bip-file-upload
      [label]="label"
      [helperText]="helperText"
      [error]="error"
      [errorMessage]="errorMessage"
      [loading]="loading"
      [multiple]="multiple"
      [maxSize]="maxSize"
      [maxFiles]="maxFiles"
      [(value)]="value"
      (rejected)="onRejected($event)"
    />
  `,
})
class HostComponent {
  label = 'Documentos';
  helperText = '';
  error = false;
  errorMessage = '';
  loading = false;
  multiple = false;
  maxSize: number | undefined = undefined;
  maxFiles: number | undefined = undefined;
  value: File[] = [];
  onRejected = vi.fn<(files: BipRejectedFile[]) => void>();
}

@Component({
  imports: [BipFileUpload, ReactiveFormsModule],
  template: `<bip-file-upload [formControl]="control" label="Documentos" />`,
})
class ReactiveFormHostComponent {
  readonly control = new FormControl<File[]>([]);
}

describe('BipFileUpload', () => {
  it('renderiza el label externo y el dropzone', async () => {
    await render(HostComponent);
    expect(screen.getByText('Documentos')).toBeInTheDocument();
    expect(screen.getByText('Arrastra tu archivo aquí')).toBeInTheDocument();
  });

  it('selecciona un archivo vía el input nativo', async () => {
    const { fixture, container } = await render(HostComponent);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('doc.pdf', 100);
    const user = userEvent.setup();
    await user.upload(input, file);
    expect(fixture.componentInstance.value).toEqual([file]);
  });

  it('reemplaza el archivo anterior cuando multiple=false', async () => {
    const { fixture, container } = await render(HostComponent, {
      componentProperties: { value: [makeFile('a.pdf', 10)] },
    });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('b.pdf', 10);
    const user = userEvent.setup();
    await user.upload(input, file);
    expect(fixture.componentInstance.value).toEqual([file]);
  });

  it('acumula archivos cuando multiple=true', async () => {
    const { fixture, container } = await render(HostComponent, {
      componentProperties: { multiple: true },
    });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const a = makeFile('a.pdf', 10);
    const b = makeFile('b.pdf', 10);
    const user = userEvent.setup();
    await user.upload(input, a);
    await user.upload(input, b);
    expect(fixture.componentInstance.value).toEqual([a, b]);
  });

  it('rechaza archivos que exceden maxSize y emite rejected', async () => {
    const { fixture, container } = await render(HostComponent, {
      componentProperties: { maxSize: 50 },
    });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const tooBig = makeFile('big.pdf', 100);
    const user = userEvent.setup();
    await user.upload(input, tooBig);
    expect(fixture.componentInstance.value).toEqual([]);
    expect(fixture.componentInstance.onRejected).toHaveBeenCalledWith([
      { file: tooBig, reason: 'size' },
    ]);
  });

  it('rechaza archivos que exceden maxFiles', async () => {
    const { fixture, container } = await render(HostComponent, {
      componentProperties: { multiple: true, maxFiles: 1, value: [makeFile('a.pdf', 10)] },
    });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const extra = makeFile('b.pdf', 10);
    const user = userEvent.setup();
    await user.upload(input, extra);
    expect(fixture.componentInstance.value).toHaveLength(1);
    expect(fixture.componentInstance.onRejected).toHaveBeenCalledWith([
      { file: extra, reason: 'count' },
    ]);
  });

  it('muestra la lista de archivos seleccionados', async () => {
    await render(HostComponent, {
      componentProperties: { value: [makeFile('contrato.pdf', 2048)] },
    });
    expect(screen.getByText('contrato.pdf')).toBeInTheDocument();
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
  });

  it('el botón de quitar elimina el archivo de la lista', async () => {
    const file = makeFile('contrato.pdf', 10);
    const { fixture } = await render(HostComponent, { componentProperties: { value: [file] } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Eliminar contrato.pdf' }));
    expect(fixture.componentInstance.value).toEqual([]);
  });

  it('procesa archivos soltados en el dropzone (drag & drop)', async () => {
    const { fixture, container } = await render(HostComponent);
    const dropzone = container.querySelector('label')!;
    const file = makeFile('dropped.pdf', 10);
    const dataTransfer = { files: [file] } as unknown as DataTransfer;
    fireEvent.drop(dropzone, { dataTransfer });
    expect(fixture.componentInstance.value).toEqual([file]);
  });

  it('muestra el spinner y el texto de carga cuando loading=true', async () => {
    const { container } = await render(HostComponent, { componentProperties: { loading: true } });
    expect(screen.getByText('Subiendo…')).toBeInTheDocument();
    expect(container.querySelector('bip-spinner')).toBeInTheDocument();
  });

  it('deshabilita el input mientras loading=true', async () => {
    const { container } = await render(HostComponent, { componentProperties: { loading: true } });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('tiene aria-invalid cuando error=true', async () => {
    const { container } = await render(HostComponent, { componentProperties: { error: true } });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renderiza errorMessage con role="alert"', async () => {
    await render(HostComponent, {
      componentProperties: { error: true, errorMessage: 'Adjunta al menos un archivo' },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Adjunta al menos un archivo');
  });

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  it('writeValue() vía FormControl refleja el valor inicial', async () => {
    const host = new ReactiveFormHostComponent();
    const file = makeFile('inicial.pdf', 10);
    host.control.setValue([file]);
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByText('inicial.pdf')).toBeInTheDocument();
  });

  it('propaga los cambios al FormControl', async () => {
    const host = new ReactiveFormHostComponent();
    const { container } = await render(ReactiveFormHostComponent, {
      componentProperties: { control: host.control },
    });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('nuevo.pdf', 10);
    const user = userEvent.setup();
    await user.upload(input, file);
    expect(host.control.value).toEqual([file]);
  });

  it('setDisabledState() vía FormControl deshabilita el input', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.disable();
    const { container } = await render(ReactiveFormHostComponent, {
      componentProperties: { control: host.control },
    });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });
});
