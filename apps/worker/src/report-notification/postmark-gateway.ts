import type { PostmarkGateway, PostmarkSendResult, ReportReadyEmailContent } from "./types.js";

interface PostmarkResponse {
  ErrorCode?: number;
  MessageID?: string;
  SubmittedAt?: string;
}

export class HttpPostmarkGateway implements PostmarkGateway {
  constructor(
    private readonly options: {
      apiKey: string;
      from: string;
      messageStream: string;
      fetch?: typeof fetch;
    },
  ) {}

  async send(
    input: ReportReadyEmailContent & { to: string; reportId: string },
  ): Promise<PostmarkSendResult> {
    const request = this.options.fetch ?? fetch;
    let response: Response;
    try {
      response = await request("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Postmark-Server-Token": this.options.apiKey,
        },
        body: JSON.stringify({
          From: this.options.from,
          To: input.to,
          Subject: input.subject,
          HtmlBody: input.htmlBody,
          TextBody: input.textBody,
          MessageStream: this.options.messageStream,
          Tag: "owner-report-ready",
          Metadata: { reportId: input.reportId },
          TrackOpens: false,
          TrackLinks: "None",
        }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      return { kind: "ambiguous", code: "postmark_transport_ambiguous" };
    }

    let body: PostmarkResponse;
    try {
      body = (await response.json()) as PostmarkResponse;
    } catch {
      return response.ok
        ? { kind: "ambiguous", code: "postmark_response_ambiguous" }
        : {
            kind: "rejected",
            code: `postmark_http_${response.status}`,
            retryable: response.status >= 500,
          };
    }
    if (response.ok && body.ErrorCode === 0 && body.MessageID && body.SubmittedAt) {
      return {
        kind: "accepted",
        messageId: body.MessageID,
        submittedAt: new Date(body.SubmittedAt),
      };
    }
    return {
      kind: "rejected",
      code: `postmark_${body.ErrorCode ?? response.status}`,
      retryable: response.status >= 500 || response.status === 429,
    };
  }
}
