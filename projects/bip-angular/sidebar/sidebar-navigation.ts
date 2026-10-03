/**
 * Puerto de `navigateSidebarItems()` (React) — a diferencia de Tabs/Navbar (que envuelven con
 * módulo), aquí el foco se **recorta** en los extremos (clamp), nunca da la vuelta. Deliberado:
 * fiel a la referencia React.
 */
export function navigateSidebarItems(
  event: KeyboardEvent,
  sidebarId: string,
  document: Document
): void {
  if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;

  const panel = document.getElementById(sidebarId);
  if (!panel) return;

  const items = Array.from(
    panel.querySelectorAll<HTMLElement>(
      '[data-sidebar-item]:not([aria-disabled="true"]):not(:disabled)'
    )
  );
  const currentIndex = items.indexOf(document.activeElement as HTMLElement);
  if (currentIndex === -1) return;

  event.preventDefault();

  let nextIndex = currentIndex;
  if (event.key === 'ArrowDown') nextIndex = Math.min(currentIndex + 1, items.length - 1);
  else if (event.key === 'ArrowUp') nextIndex = Math.max(currentIndex - 1, 0);
  else if (event.key === 'Home') nextIndex = 0;
  else if (event.key === 'End') nextIndex = items.length - 1;

  items[nextIndex]?.focus();
}
