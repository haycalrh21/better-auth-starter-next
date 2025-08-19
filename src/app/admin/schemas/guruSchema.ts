import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string({ error: "Minimum 6 characters" }).min(6, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  role: z.enum(["GURU", "SISWA", "ADMIN"]), // ❌ jangan pakai required_error
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
