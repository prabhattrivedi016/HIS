/** reads a dot-path (numeric segments treat the parent as an array index), e.g. "Risks.Properties.0.Address.City" */
export const getByPath = (obj: unknown, path: string): unknown => {
  if (!path) return undefined;
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    return (acc as Record<string, unknown>)[part];
  }, obj);
};

/** immutably writes a value at a dot-path, creating arrays/objects along the way as needed */
export const setByPath = <T>(obj: T, path: string, value: unknown): T => {
  const parts = path.split(".");
  const root: any = Array.isArray(obj) ? [...(obj as any)] : { ...(obj as any) };
  let cursor: any = root;

  parts.forEach((part, idx) => {
    const isLast = idx === parts.length - 1;
    if (isLast) {
      cursor[part] = value;
      return;
    }

    const nextPart = parts[idx + 1];
    const nextIsArrayIndex = /^\d+$/.test(nextPart);

    if (cursor[part] === undefined || cursor[part] === null) {
      cursor[part] = nextIsArrayIndex ? [] : {};
    } else {
      cursor[part] = Array.isArray(cursor[part]) ? [...cursor[part]] : { ...cursor[part] };
    }

    cursor = cursor[part];
  });

  return root;
};
