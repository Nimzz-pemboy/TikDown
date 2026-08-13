import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { mediaUrl } from "@/lib/tikdown";

type Props = { images: string[]; id: string | null };

export function PhotoCarousel({ images, id }: Props) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(images.length - 1, next));
      setIndex(clamped);
      const track = trackRef.current;
      const slide = track?.children[clamped] as HTMLElement | undefined;
      if (track && slide) {
        track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
      }
    },
    [images.length],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = track.clientWidth || 1;
        setIndex(Math.round(track.scrollLeft / width));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const active = images[index] ?? images[0]!;

  return (
    <section aria-label="Galeri foto" className="space-y-3">
      <div className="relative overflow-hidden rounded-xl bg-surface">
        <div
          ref={trackRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label={`Foto ${index + 1} dari ${images.length}`}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              go(index + 1);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              go(index - 1);
            }
          }}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
        >
          {images.map((src, i) => (
            <div key={src} className="min-w-full snap-center">
              <img
                src={src}
                alt={`Foto ${i + 1} dari ${images.length}`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="mx-auto max-h-[60vh] w-full object-contain"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto sebelumnya"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className="absolute top-1/2 left-2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-soft transition-opacity disabled:opacity-40"
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Foto berikutnya"
              onClick={() => go(index + 1)}
              disabled={index === images.length - 1}
              className="absolute top-1/2 right-2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-soft transition-opacity disabled:opacity-40"
            >
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
            <div className="absolute top-3 right-3 rounded-full bg-foreground/80 px-2.5 py-1 text-xs font-medium text-background">
              {index + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex flex-wrap justify-center gap-1.5" aria-hidden="true">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Ke foto ${i + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 22 : 8,
                backgroundColor:
                  i === index ? "var(--color-primary)" : "var(--color-border)",
              }}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <AnimatePresence mode="wait" initial={false}>
          <motion.a
            key={active}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            href={mediaUrl(active, `tikdown-${id ?? "photo"}-${index + 1}.jpg`)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <i className="fa-solid fa-download" aria-hidden="true" />
            Unduh foto ini
          </motion.a>
        </AnimatePresence>
        {images.length > 1 && (
          <div className="flex flex-1 flex-wrap gap-2">
            {images.map((src, i) => (
              <a
                key={src}
                href={mediaUrl(src, `tikdown-${id ?? "photo"}-${i + 1}.jpg`)}
                className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-3 text-sm font-medium text-surface-foreground transition-colors hover:bg-accent"
                aria-label={`Unduh foto ${i + 1}`}
              >
                {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <p className="text-center text-xs text-muted-foreground">
          Geser carousel atau gunakan tombol nomor untuk mengunduh setiap foto.
        </p>
      )}
    </section>
  );
}
