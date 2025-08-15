"use server";

import { revalidatePath } from "next/cache";
import { signUpEmailAction } from "@/actions/sign-up-email.action";

export async function createAccountServerAction(formData: FormData) {
  const { error } = await signUpEmailAction(formData);

  if (!error) {
    // Jalankan revalidatePath di server
    revalidatePath("/admin/dashboard/accounts");
  }

  return { error };
}
