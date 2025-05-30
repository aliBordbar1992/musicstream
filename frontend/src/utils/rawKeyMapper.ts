export function mapKeys<T>(
  raw: Record<string, any>,
  fieldMap: Record<string, keyof T>
): T {
  const result = {} as T;
  for (const [rawKey, domainKey] of Object.entries(fieldMap)) {
    // Use null fallback for optional fields
    result[domainKey] = raw[rawKey] !== undefined ? raw[rawKey] : null;
  }
  return result;
}
