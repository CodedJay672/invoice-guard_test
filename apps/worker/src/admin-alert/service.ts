import { eq, sql } from "drizzle-orm";

import { type Database, schema } from "@workspace/db";

export class AdminAlertService {
  constructor(
    private readonly db: Database,
    private readonly options: {
      apiKey: string;
      from: string;
      to: string;
      messageStream: string;
      fetch?: typeof fetch;
    },
  ) {}

  async process(alertId: string): Promise<void> {
    const claimed = await this.db
      .update(schema.adminAlerts)
      .set({
        status: "sending",
        attemptCount: sql`${schema.adminAlerts.attemptCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(schema.adminAlerts.id, alertId))
      .returning();
    const alert = claimed[0];
    if (!alert || alert.deliveredAt || alert.status === "resolved") return;

    const request = this.options.fetch ?? fetch;
    const response = await request("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": this.options.apiKey,
      },
      body: JSON.stringify({
        From: this.options.from,
        To: this.options.to,
        Subject: alert.subject,
        TextBody: alert.message,
        HtmlBody: `<p>${escapeHtml(alert.message)}</p>`,
        MessageStream: this.options.messageStream,
        Tag: "admin-alert",
        Metadata: { alertId },
        TrackOpens: false,
        TrackLinks: "None",
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      await this.db
        .update(schema.adminAlerts)
        .set({
          status: "failed",
          failureMessage: `Postmark returned HTTP ${response.status}.`,
          updatedAt: new Date(),
        })
        .where(eq(schema.adminAlerts.id, alertId));
      throw new Error(`Admin alert delivery failed with HTTP ${response.status}.`);
    }
    await this.db
      .update(schema.adminAlerts)
      .set({ status: "sent", deliveredAt: new Date(), failureMessage: null, updatedAt: new Date() })
      .where(eq(schema.adminAlerts.id, alertId));
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
