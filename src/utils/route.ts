export const normalizeRouteKey = (url?: string) =>
  (url ?? "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
