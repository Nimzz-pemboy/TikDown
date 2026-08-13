import { motion } from "framer-motion";

import { PhotoCarousel } from "@/components/photo-carousel";
import { fmtNum, mediaUrl, type TikTokResult } from "@/lib/tikdown";

const stat = (icon: string, label: string, value: string) => ({ icon, label, value });

export function ResultCard({ result }: { result: TikTokResult }) {
  const stats = [
    stat("fa-play", "Views", fmtNum(result.stats.views)),
    stat("fa-heart", "Likes", fmtNum(result.stats.like)),
    stat("fa-comment", "Komentar", fmtNum(result.stats.comment)),
    stat("fa-share-nodes", "Share", fmtNum(result.stats.share)),
  ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="panel overflow-hidden"
    >
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {result.type === "video" && result.video ? (
            <video
              src={result.video}
              controls
              playsInline
              preload="metadata"
              className="max-h-[62vh] w-full rounded-xl bg-surface"
            />
          ) : (
            <PhotoCarousel images={result.images} id={result.id} />
          )}

          {result.title && (
            <p className="text-sm leading-relaxed text-foreground/90">{result.title}</p>
          )}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <i className={`fa-solid ${s.icon}`} aria-hidden="true" />
                  {s.label}
                </div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <i className="fa-regular fa-clock" aria-hidden="true" />
              {result.duration}
            </span>
            {result.region && (
              <span className="inline-flex items-center gap-1.5">
                <i className="fa-solid fa-location-dot" aria-hidden="true" />
                {result.region}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <i className="fa-solid fa-layer-group" aria-hidden="true" />
              {result.type === "video" ? "Video" : `${result.images.length} foto`}
            </span>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-surface p-4">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Author
            </h3>
            <div className="mt-3 flex items-center gap-3">
              {result.author.avatar ? (
                <img
                  src={result.author.avatar}
                  alt={`Avatar ${result.author.nickname}`}
                  loading="lazy"
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <i className="fa-solid fa-user" aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate font-semibold">
                  {result.author.nickname || result.author.username}
                  {result.author.verified && (
                    <i
                      className="fa-solid fa-circle-check text-primary"
                      aria-label="Akun terverifikasi"
                    />
                  )}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  @{result.author.username}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              {[
                ["Followers", result.author.followers],
                ["Following", result.author.following],
                ["Likes", result.author.like],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-semibold tabular-nums">{fmtNum(value as number)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-surface p-4">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Musik
            </h3>
            <div className="mt-3 flex items-center gap-3">
              {result.music.thumbnail ? (
                <img
                  src={result.music.thumbnail}
                  alt=""
                  loading="lazy"
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <i className="fa-solid fa-music" aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {result.music.title || "Tidak diketahui"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {result.music.author || "-"} · {result.music.duration}
                </p>
              </div>
            </div>
          </section>

          <div className="grid gap-2">
            {result.type === "video" && result.video && (
              <a
                href={mediaUrl(result.video, `tikdown-${result.id ?? "video"}.mp4`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <i className="fa-solid fa-film" aria-hidden="true" />
                Download Video
              </a>
            )}
            {result.music.url && (
              <a
                href={mediaUrl(result.music.url, `tikdown-${result.id ?? "audio"}.mp3`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <i className="fa-solid fa-headphones" aria-hidden="true" />
                Download Audio
              </a>
            )}
          </div>
        </aside>
      </div>
    </motion.article>
  );
}
