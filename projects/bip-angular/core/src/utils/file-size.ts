/**
 * Formatea bytes a una etiqueta legible (B/KB/MB) — compartido por cualquier control que
 * valide un tamaño máximo de archivo (FileUpload, odontogram/ImagePopover) y necesite
 * mostrarlo en un mensaje de ayuda/error. No usa `Intl.NumberFormat` a propósito: la unidad
 * (B/KB/MB) no es localizable, solo el separador decimal lo sería, y el valor es siempre
 * efímero (un mensaje de validación), no un dato mostrado en una tabla.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
