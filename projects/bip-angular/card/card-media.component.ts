import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BipCardMediaAspectRatio = 'video' | 'square' | 'wide';

const ASPECT_CLASS: Record<BipCardMediaAspectRatio, string> = {
  video: 'bip-card-media--aspect-video',
  square: 'bip-card-media--aspect-square',
  wide: 'bip-card-media--aspect-wide',
};

@Component({
  selector: 'bip-card-media',
  template: `<img [src]="src()" [alt]="alt()" class="bip-card-media-img" />`,
  styleUrl: './card-media.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-card-media',
    '[class]': 'aspectClass()',
  },
})
export class BipCardMedia {
  readonly src = input.required<string>();
  readonly alt = input.required<string>();
  readonly aspectRatio = input<BipCardMediaAspectRatio>('video');

  protected readonly aspectClass = computed(() => ASPECT_CLASS[this.aspectRatio()]);
}
