import fs from "fs/promises";
import path from "path";
import type { StorageProvider } from "./StorageProvider";

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    this.baseUrl = process.env.API_URL ?? "http://localhost:3001";
  }

  async upload(buffer: Buffer, filename: string, _mimeType: string): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    await fs.writeFile(path.join(this.uploadDir, filename), buffer);
    return `${this.baseUrl}/uploads/avatars/${filename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    const filename = fileUrl.split("/").pop();
    if (!filename) return;
    await fs.unlink(path.join(this.uploadDir, filename)).catch(() => {});
  }
}
