import { createFileRoute } from "@tanstack/react-router";

import { checkLimits, clientIp } from "@/lib/guard.server";

const ALLOWED_HOST_SUFFIXES = [
  ".tiktokcdn.com",
  ".tiktokcdn-us.com",
  ".tiktokcdn-eu.com",
  ".tiktokv.com",
  ".ttwstatic.com",
  ".byteoversea.com",
  ".tiktok.com",
];

function allowed(target: URL): boolean {
  if (target.protocol !== "https:") return false;
  const host = target.hostname.toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some((s) => host.endsWith(s) || host === s.slice(1));
}

/** Streams TikTok CDN media so the browser can save it with a proper filename. */
export const Route = createFileRoute("/api/public/media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const raw = requestUrl.searchParams.get("url") ?? "";
        const filename = (requestUrl.searchParams.get("filename") ?? "tikdown")
          .replace(/[^a-zA-Z0-9._-]/g, "")
          .slice(0, 64);

        let target: URL;
        try {
          target = new URL(raw);
        } catch {
          return new Response("Bad request", { status: 400 });
        }
        if (!allowed(target)) return new Response("Bad request", { status: 400 });

        const verdict = checkLimits(`media:${clientIp(request)}`);
        if (!verdict.ok) {
          return new Response("Too many requests", {
            status: 429,
            headers: { "retry-after": String(verdict.retryAfter) },
          });
        }

        try {
          const upstream = await fetch(target.toString(), {
            headers: {
              referer: "https://www.tiktok.com/",
              "user-agent":
                "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
            },
            signal: AbortSignal.timeout(30_000),
          });
          if (!upstream.ok || !upstream.body) {
            return new Response("Media unavailable", { status: 502 });
          }
          return new Response(upstream.body, {
            headers: {
              "content-type": upstream.headers.get("content-type") ?? "application/octet-stream",
              "content-disposition": `attachment; filename="${filename}"`,
              "cache-control": "private, max-age=300",
              "x-content-type-options": "nosniff",
            },
          });
        } catch {
          return new Response("Media unavailable", { status: 502 });
        }
      },
    },
  },
});
