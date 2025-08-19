/**
 * Helper buat konversi object biasa -> FormData
 * Type-safe, tanpa `any`
 */
export function objectToFormData<T extends Record<string, unknown>>(
  obj: T
): FormData {
  const formData = new FormData();

  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (v instanceof File || v instanceof Blob) {
          formData.append(`${key}[${i}]`, v);
        } else {
          formData.append(`${key}[${i}]`, String(v));
        }
      });
    } else if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}
