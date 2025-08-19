import { ZodSchema } from "zod";

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw result.error; // langsung lempar ZodError (punya .issues)
  }
  return result.data;
}
