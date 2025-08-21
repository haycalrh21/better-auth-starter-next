import { Seed, users } from "@better-auth-kit/seed";

// Cuma seed basic fields, custom fields akan dihandle otomatis oleh databaseHooks
export const seed = Seed({
  ...users({}),
});

export const config = {
  deleteRowsBeforeSeeding: true,
  rows: 10,
};
