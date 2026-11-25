import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import type { BipSizeExtended } from '@bip-design-systems/angular/core';
import { BIP_AVATAR_GROUP_SIZE } from './avatar-group-size.token';
import { BipAvatar } from './avatar.component';

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

/**
 * Agrupa `<bip-avatar>` proyectados con solapamiento visual, `max` visibles y badge "+N" para
 * el resto. El `size` se provee a los hijos vía `BIP_AVATAR_GROUP_SIZE` (DI) — ver el
 * comentario del token para la equivalencia con `React.cloneElement`. El truncado (`max`) y el
 * anillo/solapamiento visual de cada avatar se aplican imperativamente sobre los elementos
 * proyectados (`contentChildren` + `Renderer2`) porque `<ng-content>` no permite reordenar ni
 * envolver hijos individuales como el `.map()` de la referencia React.
 */
@Component({
  selector: 'bip-avatar-group',
  templateUrl: './avatar-group.component.html',
  styleUrl: './avatar-group.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-avatar-group',
    role: 'group',
  },
  providers: [
    {
      provide: BIP_AVATAR_GROUP_SIZE,
      useFactory: () => inject(forwardRef(() => BipAvatarGroup)).size,
    },
  ],
})
export class BipAvatarGroup {
  private readonly locale = injectBipLocale();
  private readonly renderer = inject(Renderer2);

  readonly max = input(4, { transform: numberAttribute });
  readonly size = input<BipSizeExtended>('md');

  protected readonly avatarRefs = contentChildren(BipAvatar, { read: ElementRef });

  protected readonly overflowCount = computed(() =>
    Math.max(0, this.avatarRefs().length - this.max())
  );
  protected readonly overflowLabel = computed(() =>
    this.locale().avatar.overflow(this.overflowCount())
  );
  protected readonly sizeContainerClass = computed(() => SIZE_CONTAINER_CLASS[this.size()]);
  protected readonly sizeTextClass = computed(() => SIZE_TEXT_CLASS[this.size()]);

  constructor() {
    effect(() => {
      const refs = this.avatarRefs();
      const max = this.max();
      refs.forEach((ref, index) => {
        const el = ref.nativeElement;
        this.renderer.addClass(el, 'bip-avatar-group-item');
        this.renderer.setStyle(el, 'display', index < max ? '' : 'none');
        this.renderer.setStyle(
          el,
          'margin-inline-start',
          index > 0 && index < max ? 'calc(var(--space-2) * -1)' : ''
        );
      });
    });
  }
}
