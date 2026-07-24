import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import type { PdfObjectStore } from "./types.js";

export class R2PdfObjectStore implements PdfObjectStore {
  private readonly client: S3Client;

  constructor(
    private readonly bucket: string,
    options: { endpoint: string; accessKeyId: string; secretAccessKey: string },
  ) {
    this.client = new S3Client({
      region: "auto",
      endpoint: options.endpoint,
      credentials: { accessKeyId: options.accessKeyId, secretAccessKey: options.secretAccessKey },
    });
  }

  async put(input: { key: string; body: Buffer; sha256: string }): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: "application/pdf",
        ContentDisposition: "attachment",
        Metadata: { sha256: input.sha256 },
      }),
    );
  }
}
