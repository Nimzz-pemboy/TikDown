import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import {
  MAX_BODY_BYTES,
  MAX_URL_LENGTH,
  cacheGet,
  cacheSet,
  checkLimits,
  clientIp,
  withSlot,
} from "@/lib/guard.server";
import { extractTikTok, isValidTikTokUrl, type TikTokResult } from "@/lib/tiktok.server";

const bodySchema = z.object({
  url: z.string().trim().min(8).max(MAX_URL_LENGTH),
});

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": process.env["ALLOWED_ORIGIN"] ?? "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "cache-control": "no-store",
};

function json(payload: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json", ...CORS_HEADERS, ...extra },
  });
}

const ERRORS = {
  invalid_body: "Permintaan tidak valid.",
  empty_url: "Masukkan URL TikTok terlebih dahulu.",
  invalid_url: "URL tidak valid. Gunakan tautan TikTok.",
  not_found: "Video tidak ditemukan atau bersifat privat.",
  timeout: "Permintaan terlalu lama. Coba lagi.",
  rate_limited: "Terlalu banyak permintaan. Coba lagi nanti.",
  cooldown: "Mohon tunggu sebentar sebelum mengirim permintaan lagi.",
  busy: "Server sedang sibuk. Coba lagi sebentar.",
  server_error: "Terjadi kesalahan. Coba lagi nanti.",
} as const;

/** Delegates to the Go downloader service when GO_SERVICE_URL is configured. */
async function runDownloader(url: string): Promise<TikTokResult | null> {
  const base = process.env["GO_SERVICE_URL"];
  if (!base) return await extractTikTok(url);

  const res = await fetch(`${base.replace(/\/$/, "")}/extract`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env["API_SECRET"] ? { "x-api-secret": process.env["API_SECRET"] } : {}),
    },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error("go_service_error");
  const body = (await res.json()) as { success?: boolean; data?: TikTokResult };
  return body?.data ?? null;
}

export const Route = createFileRoute("/api/public/download")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }) => {
        const raw = await request.text();
        if (raw.length > MAX_BODY_BYTES) {
          return json({ success: false, error: ERRORS.invalid_body }, 413);
        }

        let url: string;
        try {
          const parsed = bodySchema.parse(JSON.parse(raw));
          url = parsed.url;
        } catch {
          return json({ success: false, error: ERRORS.empty_url }, 400);
        }

        if (!isValidTikTokUrl(url)) {
          return json({ success: false, error: ERRORS.invalid_url }, 400);
        }

        const cacheKey = url.split("?")[0] ?? url;
        const cached = cacheGet<TikTokResult>(cacheKey);
        if (cached) {
          return json({ success: true, type: cached.type, cached: true, data: cached });
        }

        const verdict = checkLimits(clientIp(request));
        if (!verdict.ok) {
          return json(
            { success: false, error: ERRORS[verdict.code] },
            verdict.code === "rate_limited" ? 429 : verdict.code === "busy" ? 503 : 429,
            { "retry-after": String(verdict.retryAfter) },
          );
        }

        try {
          const result = await withSlot(() => runDownloader(url));
          if (!result || (!result.video && result.images.length === 0)) {
            return json({ success: false, error: ERRORS.not_found }, 404);
          }
          cacheSet(cacheKey, result);
          return json({ success: true, type: result.type, data: result });
        } catch (error) {
          const name = error instanceof Error ? error.name : "";
          if (name === "TimeoutError" || name === "AbortError") {
            return json({ success: false, error: ERRORS.timeout }, 504);
          }
          console.error("download_failed", error);
          return json({ success: false, error: ERRORS.server_error }, 502);
        }
      },
    },
  },
});
