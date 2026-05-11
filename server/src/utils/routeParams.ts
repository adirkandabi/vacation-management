/** Express 5 types `req.params` values as `string | string[]`. */
export function routeIdString(id: string | string[] | undefined): string | null {
  if (id === undefined) {
    return null;
  }
  const s = Array.isArray(id) ? id[0] : id;
  return typeof s === 'string' && s.length > 0 ? s : null;
}
