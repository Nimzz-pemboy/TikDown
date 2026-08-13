import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { FaqSection } from "@/components/faq-section";
import { ResultCard } from "@/components/result-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TutorialSection } from "@/components/tutorial-section";
import { siteConfig } from "@/config/site";
import type { DownloadResponse, TikTokResult } from "@/lib/tikdown";

const TITLE = `${siteConfig.name} — ${siteConfig.tagline}`;
const DESCRIPTION =
  "Tempel URL TikTok untuk melihat metadata dan mengunduh video, audio, atau foto dari photo post. Tanpa login.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function looksLikeTikTok(value: string): boolean {
  return /https?:\/\/([a-z0-9-]+\.)?tiktok\.com\//i.test(value.trim());
}

function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TikTokResult | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    const value = url.trim();

    if (!value) {
      setError("Masukkan URL TikTok terlebih dahulu.");
      return;
    }
    if (!looksLikeTikTok(value)) {
      setError("URL tidak valid. Gunakan tautan dari tiktok.com.");
      return;
    }

    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/public/download", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const body = (await res.json()) as DownloadResponse;
      if (!body.success) {
        setError(body.error);
      } else {
        setResult(body.data);
      }
    } catch {
      setError("Gagal menghubungi server. Periksa koneksi lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="top" className="relative min-h-screen">
      <div className="hairline-grid pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden="true" />

      <SiteHeader />

      <main className="relative mx-auto max-w-5xl px-4 pb-20">

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl pt-6 pb-8 text-center sm:pt-14"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <i className="fa-solid fa-bolt text-primary" aria-hidden="true" />
            Tanpa login, tanpa iklan
          </span>
          <h1 className="mt-4 text-3xl font-bold sm:text-5xl">
            Unduh video, audio, dan foto TikTok
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Tempel tautan TikTok, TikDown akan mengambil metadata dan media yang tersedia.
            Mendukung video maupun photo post.
          </p>

          <form onSubmit={submit} className="mt-7 text-left">
            <label htmlFor="tiktok-url" className="sr-only">
              URL video TikTok
            </label>
            <div className="panel flex flex-col gap-2 p-2 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 px-2">
                <i className="fa-solid fa-link text-muted-foreground" aria-hidden="true" />
                <input
                  id="tiktok-url"
                  name="url"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  enterKeyHint="go"
                  placeholder="https://www.tiktok.com/@user/video/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "url-error" : undefined}
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                />
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl("")}
                    aria-label="Kosongkan input"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                )}
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <i
                  className={loading ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-download"}
                  aria-hidden="true"
                />
                {loading ? "Memproses" : "Ambil Media"}
              </motion.button>
            </div>
          </form>

          <AnimatePresence>
            {error && (
              <motion.p
                id="url-error"
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-left text-sm text-destructive"
              >
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.section>

        <div aria-live="polite">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="panel flex items-center gap-3 p-5 text-sm text-muted-foreground"
              >
                <i className="fa-solid fa-spinner fa-spin text-primary" aria-hidden="true" />
                Mengambil metadata dari TikTok...
              </motion.div>
            )}
            {!loading && result && <ResultCard key={result.id ?? "result"} result={result} />}
          </AnimatePresence>
        </div>

        {!result && !loading && (
          <section className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["fa-film", "Video & audio", "Unduh video tanpa watermark dari sumber resmi, plus audio terpisah."],
              ["fa-images", "Photo post", "Photo post ditampilkan dalam carousel yang bisa digeser dan diunduh."],
              ["fa-shield-halved", "Aman", "Validasi URL, rate limit, dan timeout untuk mencegah penyalahgunaan."],
            ].map(([icon, title, body]) => (
              <div key={title} className="panel p-5">
                <i className={`fa-solid ${icon} text-primary`} aria-hidden="true" />
                <h3 className="mt-3 text-base font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </section>
        )}

        <TutorialSection />
        <FaqSection />
      </main>

      <SiteFooter />
    </div>
  );
}
