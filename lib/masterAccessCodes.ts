/** Server-only VIP master codes. Keep these out of browser bundles and source control. */
export function isMasterAccessCode(code: string): boolean {
  const configuredCodes = process.env.MASTER_ACCESS_CODES;
  if (!configuredCodes) return false;

  const normalized = code.trim().toUpperCase();
  if (!normalized) return false;

  return configuredCodes
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean)
    .includes(normalized);
}
