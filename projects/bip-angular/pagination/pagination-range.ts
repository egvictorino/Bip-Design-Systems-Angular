export type BipPaginationRangeItem = number | 'ellipsis';

/**
 * Puerto exacto de `getPageRange()` (React) — calcula la ventana de páginas a mostrar
 * alrededor de `page`, con elipsis en los extremos cuando `totalPages` no cabe completo.
 * `totalSlots = siblingCount*2 + 5` (primera página, última página, página actual,
 * `siblingCount` a cada lado, y hasta 2 elipsis).
 */
export function getPageRange(page: number, totalPages: number, siblingCount = 1): BipPaginationRangeItem[] {
  const totalSlots = siblingCount * 2 + 5;

  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftIndex = Math.max(page - siblingCount, 1);
  const rightIndex = Math.min(page + siblingCount, totalPages);

  const showLeftDots = leftIndex > 2;
  const showRightDots = rightIndex < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from({ length: siblingCount * 2 + 3 }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightRangeLength = siblingCount * 2 + 3;
    const rightRange = Array.from(
      { length: rightRangeLength },
      (_, i) => totalPages - rightRangeLength + i + 1
    );
    return [1, 'ellipsis', ...rightRange];
  }

  const middleRange = Array.from({ length: rightIndex - leftIndex + 1 }, (_, i) => leftIndex + i);
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
}
