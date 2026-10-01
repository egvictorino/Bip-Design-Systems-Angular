import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipBreadcrumb, type BipBreadcrumbItem } from './breadcrumb.component';
import { BipBreadcrumbSeparatorDirective } from './breadcrumb-separator.directive';

@Component({
  imports: [BipBreadcrumb],
  template: `<bip-breadcrumb [items]="items" [ariaLabel]="ariaLabel" />`,
})
class HostComponent {
  items: BipBreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Pacientes', href: '/pacientes' },
    { label: 'Juan Pérez' },
  ];
  ariaLabel: string | undefined;
}

@Component({
  imports: [BipBreadcrumb, BipBreadcrumbSeparatorDirective],
  template: `
    <bip-breadcrumb [items]="items">
      <ng-template bipBreadcrumbSeparator>/</ng-template>
    </bip-breadcrumb>
  `,
})
class CustomSeparatorHost {
  items: BipBreadcrumbItem[] = [{ label: 'Inicio', href: '/' }, { label: 'Actual' }];
}

@Component({
  imports: [BipBreadcrumb],
  template: `<bip-breadcrumb [items]="items" />`,
})
class RouterLinkHost {
  items: BipBreadcrumbItem[] = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Actual' },
  ];
}

describe('BipBreadcrumb', () => {
  it('nav con aria-label localizado por defecto', async () => {
    await render(HostComponent);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('permite sobreescribir el aria-label', async () => {
    await render(HostComponent, { componentProperties: { ariaLabel: 'Ruta de navegación' } });
    expect(screen.getByRole('navigation', { name: 'Ruta de navegación' })).toBeInTheDocument();
  });

  it('renderiza una lista ordenada con un item por entrada', async () => {
    await render(HostComponent);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('el último item es aria-current="page" y no es un link, aunque tenga href', async () => {
    await render(HostComponent, {
      componentProperties: {
        items: [
          { label: 'Inicio', href: '/' },
          { label: 'Actual', href: '/actual' },
        ],
      },
    });
    const current = screen.getByText('Actual');
    expect(current.tagName).toBe('SPAN');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('un item intermedio con href se renderiza como link', async () => {
    await render(HostComponent);
    expect(screen.getByRole('link', { name: 'Pacientes' })).toHaveAttribute('href', '/pacientes');
  });

  it('un item sin href ni routerLink se renderiza como texto no interactivo', async () => {
    await render(HostComponent, {
      componentProperties: { items: [{ label: 'Sin link' }, { label: 'Actual' }] },
    });
    expect(screen.queryByRole('link', { name: 'Sin link' })).not.toBeInTheDocument();
    expect(screen.getByText('Sin link').tagName).toBe('SPAN');
  });

  it('separador decorativo (aria-hidden) entre items, ausente tras el último', async () => {
    await render(HostComponent);
    const separators = document.querySelectorAll('.bip-breadcrumb-separator[aria-hidden="true"]');
    expect(separators).toHaveLength(2);
  });

  it('usa el separador custom proyectado en vez del chevron por defecto', async () => {
    await render(CustomSeparatorHost);
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('un item con routerLink navega con el Router de Angular', async () => {
    await render(RouterLinkHost, { providers: [provideRouter([])] });
    const link = screen.getByRole('link', { name: 'Inicio' });
    expect(link).toHaveAttribute('href', '/');
  });
});
