const RFC_PATTERN = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;

/** Puerto de shared-utils (React) src/index.ts#validateRFC. Sin normalizar el input. */
export function validateRFC(rfc: string): boolean {
  return RFC_PATTERN.test(rfc);
}
