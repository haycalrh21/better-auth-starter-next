/**
 * Convert any object to FormData
 * Supports nested objects, arrays, File/Blob, Date, and primitive types
 */
export function objectToFormData<T extends Record<string, unknown>>(
  obj: T,
  formData: FormData = new FormData(),
  parentKey?: string
): FormData {
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value instanceof File || value instanceof Blob) {
      formData.append(formKey, value);
    } else if (value instanceof Date) {
      formData.append(formKey, value.toISOString());
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item === undefined || item === null) return;

        const arrayKey = `${formKey}[${index}]`;
        if (item instanceof File || item instanceof Blob) {
          formData.append(arrayKey, item);
        } else if (item instanceof Date) {
          formData.append(arrayKey, item.toISOString());
        } else if (typeof item === "object" && item !== null) {
          objectToFormData(item as Record<string, unknown>, formData, arrayKey);
        } else {
          formData.append(arrayKey, String(item));
        }
      });
    } else if (typeof value === "object") {
      objectToFormData(value as Record<string, unknown>, formData, formKey);
    } else {
      formData.append(formKey, String(value));
    }
  });

  return formData;
}

/**
 * Parse bracket notation key to get path and value
 * e.g., "user[profile][name]" -> ["user", "profile", "name"]
 */
function parseFormKey(key: string): string[] {
  return key.split(/[\[\]]+/).filter(Boolean);
}

/**
 * Set nested object value using path array
 */
function setNestedValue(
  obj: Record<string, unknown>,
  path: string[],
  value: unknown
): void {
  const lastKey = path[path.length - 1];
  const parentPath = path.slice(0, -1);

  let current: Record<string, unknown> = obj;

  for (const key of parentPath) {
    if (!(key in current)) {
      // Check if next key is numeric to decide array vs object
      const nextKey = path[parentPath.indexOf(key) + 1];
      current[key] = /^\d+$/.test(nextKey) ? [] : {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[lastKey] = value;
}

/**
 * Auto-detect and parse value type
 */
function parseFormValue(value: string): unknown {
  // Try to parse as JSON first (handles objects, arrays, null, etc.)
  try {
    return JSON.parse(value);
  } catch {
    // Not valid JSON, continue with other checks
  }

  // Check for ISO date string
  if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date : value;
  }

  // Check for boolean strings
  if (value === "true") return true;
  if (value === "false") return false;

  // Check for number (but be careful with leading zeros)
  if (!isNaN(Number(value)) && value !== "" && !value.startsWith("0")) {
    // Additional check: if it looks like an ID or phone number, keep as string
    if (value.length <= 15 && !value.includes(".")) {
      return Number(value);
    }
  }

  // Default to string
  return value;
}

/**
 * Convert FormData back to typed object with automatic type detection
 * Reconstructs nested objects and arrays from bracket notation
 */
export function formDataToObject<T extends Record<string, unknown>>(
  formData: FormData
): T {
  const result = {} as T;

  formData.forEach((value, key) => {
    const path = parseFormKey(key);

    let parsedValue: unknown;

    // Check if value is File or Blob using typeof and constructor check
    if (
      typeof value === "object" &&
      value !== null &&
      (value.constructor.name === "File" || value.constructor.name === "Blob")
    ) {
      // Keep File/Blob objects as-is
      parsedValue = value;
    } else {
      // Parse string values with type detection
      parsedValue = parseFormValue(value.toString());
    }

    setNestedValue(result as Record<string, unknown>, path, parsedValue);
  });

  return result;
}
