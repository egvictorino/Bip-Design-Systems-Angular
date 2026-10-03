import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import type { BipSizeExtended } from '@bip-design-systems/angular/core';
import { BIP_AVATAR_GROUP_SIZE } from './avatar-group-size.token';

export type BipAvatarShape = 'circle' | 'square';
export type BipAvatarStatus = 'online' | 'offline' | 'away' | 'busy';
type BipAvatarDisplayMode = 'image' | 'initials' | 'icon';

const SIZE_CONTAINER_CLASS: Record<BipSizeExtended, string> = {
  xs: 'bip-avatar--xs',
  sm: 'bip-avatar--sm',
  md: 'bip-avatar--md',
  lg: 'bip-avatar--lg',
  xl: 'bip-avatar--xl',
};

const SIZE_TEXT_CLASS: Record<BipSizeExtended, string> = {
  xs: 'bip-avatar-text--xs',
  sm: 'bip-avatar-text--sm',
  md: 'bip-avatar-text--md',
  lg: 'bip-avatar-text--lg',
  xl: 'bip-avatar-text--xl',
};

const SIZE_STATUS_CLASS: Record<BipSizeExtended, string> = {
  xs: 'bip-avatar-status--xs',
  sm: 'bip-avatar-status--sm',
  md: 'bip-avatar-status--md',
  lg: 'bip-avatar-status--lg',
  xl: 'bip-avatar-status--xl',
};

const SHAPE_CLASS: Record<BipAvatarShape, string> = {
  circle: 'bip-avatar--circle',
  square: 'bip-avatar--square',
};

const STATUS_CLASS: Record<BipAvatarStatus, string> = {
  online: 'bip-avatar-status--online',
  offline: 'bip-avatar-status--offline',
  away: 'bip-avatar-status--away',
  busy: 'bip-avatar-status--busy',
};

const INITIALS_BG_CLASSES = [
  'bip-avatar-bg--primary',
  'bip-avatar-bg--secondary',
  'bip-avatar-bg--danger',
  'bip-avatar-bg--success-text',
  'bip-avatar-bg--warning-text',
  'bip-avatar-bg--info-text',
  'bip-avatar-bg--slate',
  'bip-avatar-bg--violet',
] as const;

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  }
  return Math.abs(hash);
}

function getInitialsBgClass(name: string): string {
  return INITIALS_BG_CLASSES[hashName(name) % INITIALS_BG_CLASSES.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Avatar con fallback en cascada imagen → iniciales (hasheadas a un color estable) → ícono
 * genérico. `size` sin valor explícito hereda el de `<bip-avatar-group>` ancestro (si existe)
 * vía DI — equivalente Angular al `React.cloneElement(child, { size })` de la referencia.
 */
@Component({
  selector: 'bip-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-avatar',
    '[class]': 'sizeContainerClass()',
  },
})
export class BipAvatar {
  private readonly locale = injectBipLocale();
  private readonly groupSize = inject(BIP_AVATAR_GROUP_SIZE, { optional: true });

  readonly src = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly alt = input<string | undefined>(undefined);
  readonly size = input<BipSizeExtended | undefined>(undefined);
  readonly shape = input<BipAvatarShape>('circle');
  readonly status = input<BipAvatarStatus | undefined>(undefined);

  private readonly imgError = signal(false);

  protected readonly effectiveSize = computed(() => this.size() ?? this.groupSize?.() ?? 'md');
  protected readonly sizeContainerClass = computed(
    () => SIZE_CONTAINER_CLASS[this.effectiveSize()]
  );
  protected readonly sizeTextClass = computed(() => SIZE_TEXT_CLASS[this.effectiveSize()]);
  protected readonly sizeStatusClass = computed(() => SIZE_STATUS_CLASS[this.effectiveSize()]);

  protected readonly displayMode = computed<BipAvatarDisplayMode>(() => {
    if (this.src() && !this.imgError()) return 'image';
    if (this.name()?.trim()) return 'initials';
    return 'icon';
  });

  protected readonly effectiveAlt = computed(
    () => this.alt() ?? this.name() ?? this.locale().avatar.fallbackAlt
  );

  protected readonly initials = computed(() => {
    const name = this.name();
    return name ? getInitials(name) : '';
  });

  protected readonly innerClasses = computed(() => {
    const mode = this.displayMode();
    const shapeClass = SHAPE_CLASS[this.shape()];
    if (mode === 'initials') {
      const name = this.name();
      return `bip-avatar-inner ${shapeClass} bip-avatar-inner--initials ${name ? getInitialsBgClass(name) : ''}`;
    }
    if (mode === 'icon') {
      return `bip-avatar-inner ${shapeClass} bip-avatar-inner--icon`;
    }
    return `bip-avatar-inner ${shapeClass}`;
  });

  protected readonly statusClasses = computed(() => {
    const status = this.status();
    return status ? `bip-avatar-status ${this.sizeStatusClass()} ${STATUS_CLASS[status]}` : '';
  });

  protected onImageError(): void {
    this.imgError.set(true);
  }
}
