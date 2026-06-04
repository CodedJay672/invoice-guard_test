import { z } from "zod";

import { createProviderFailure, createProviderSuccess, type ProviderResult } from "../provider.js";

import type { LondonGazetteFreePreviewFlags, LondonGazetteNotice } from "./types.js";

const provider = "london_gazette";

const noticeSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  noticeId: z.union([z.string(), z.number()]).optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  noticeType: z.string().optional(),
  publishedAt: z.string().optional(),
  publicationDate: z.string().optional(),
  url: z.string().optional(),
});

const gazetteResponseSchema = z.object({
  notices: z.array(noticeSchema).optional(),
  entries: z.array(noticeSchema).optional(),
  results: z.array(noticeSchema).optional(),
});

export function normaliseLondonGazetteResponse(
  companyNumber: string,
  payload: unknown,
): ProviderResult<LondonGazetteFreePreviewFlags> {
  const parsed = gazetteResponseSchema.safeParse(payload);

  if (!parsed.success) {
    return createProviderFailure(provider, {
      code: "integration_invalid_response",
      message: "London Gazette returned an invalid response.",
      retryable: false,
    });
  }

  const sourceNotices = parsed.data.notices ?? parsed.data.entries ?? parsed.data.results ?? [];
  const notices = sourceNotices.map((notice, index): LondonGazetteNotice => {
    const title = notice.title ?? notice.category ?? notice.noticeType ?? "London Gazette notice";

    return {
      noticeId: String(notice.noticeId ?? notice.id ?? `${companyNumber}-${index}`),
      title,
      category: classifyNotice(title, notice.category, notice.noticeType),
      publishedAt: notice.publishedAt ?? notice.publicationDate,
      url: notice.url,
    };
  });

  return createProviderSuccess(provider, {
    companiesHouseNumber: companyNumber.toUpperCase(),
    gazetteStrikeoffFlag: notices.some((notice) => notice.category === "strike_off"),
    gazetteWindingupFlag: notices.some((notice) => notice.category === "winding_up"),
    notices,
  });
}

function classifyNotice(
  title: string,
  category: string | undefined,
  noticeType: string | undefined,
): LondonGazetteNotice["category"] {
  const haystack = `${title} ${category ?? ""} ${noticeType ?? ""}`.toLowerCase();

  if (haystack.includes("strike-off") || haystack.includes("strike off")) {
    return "strike_off";
  }

  if (haystack.includes("winding-up") || haystack.includes("winding up")) {
    return "winding_up";
  }

  return "other";
}
