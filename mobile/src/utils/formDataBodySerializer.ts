export const formDataBodySerializer = (
  body: Record<string, unknown>,
): FormData => {
  const data = new FormData();

  const isFile = (v: any) =>
    v && typeof v === "object" && (v.uri || v instanceof Blob);

  const appendValue = (key: string, v: unknown) => {
    if (v === null || v === undefined) return;

    if (isFile(v)) {
      data.append(key, v as any);
    } else if (typeof v === "object") {
      data.append(key, JSON.stringify(v));
    } else {
      data.append(key, String(v));
    }
  };

  Object.entries(body).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((v) => appendValue(key, v));
      return;
    }

    appendValue(key, value);
  });

  return data;
};
