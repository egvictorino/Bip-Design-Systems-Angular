import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { BipIdGenerator } from './id-generator';

describe('BipIdGenerator', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('genera ids distintos para el mismo prefijo', () => {
    const generator = TestBed.inject(BipIdGenerator);
    const first = generator.next('bip-input');
    const second = generator.next('bip-input');
    expect(first).not.toBe(second);
  });

  it('el id generado empieza con el prefijo dado', () => {
    const generator = TestBed.inject(BipIdGenerator);
    expect(generator.next('bip-checkbox').startsWith('bip-checkbox-')).toBe(true);
  });

  it('es un singleton a nivel app (providedIn: root) — comparte contador entre inyecciones', () => {
    const first = TestBed.inject(BipIdGenerator).next('bip-input');
    const second = TestBed.inject(BipIdGenerator).next('bip-input');
    expect(first).not.toBe(second);
  });
});
