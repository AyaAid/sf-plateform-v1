export interface StorageProvider {
  upload(buffer: Buffer, filename: string, mimeType: string): Promise<string>;
  delete(fileUrl: string): Promise<void>;
}
