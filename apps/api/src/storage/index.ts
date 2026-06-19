import type { StorageProvider } from "./StorageProvider";
import { LocalStorageProvider } from "./LocalStorageProvider";

function createStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? "local";
  switch (provider) {
    // case "supabase":
    //   return new SupabaseStorageProvider();
    default:
      return new LocalStorageProvider();
  }
}

export const storage = createStorageProvider();
