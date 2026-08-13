import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { siteConfig } from "@/config/site";

const FAQ: { q: string; a: string }[] = [
  {
    q: `Apa itu ${siteConfig.name}?`,
    a: `${siteConfig.name} adalah tool independen yang membantu Anda mengambil metadata dan mengunduh media dari URL TikTok yang tersedia secara publik — video, audio, maupun photo post.`,
  },
  {
    q: `Apakah ${siteConfig.name} membutuhkan login?`,
    a: "Tidak. Tidak ada akun, tidak ada login, dan tidak ada data pengguna yang perlu Anda daftarkan.",
  },
  {
    q: `Apakah ${siteConfig.name} menyimpan video yang saya download?`,
    a: "Tidak ada file media yang disimpan permanen. Media dialirkan (streaming) langsung dari CDN TikTok melalui proxy server hanya saat unduhan berjalan. Server hanya menyimpan hasil metadata sementara di cache sekitar 10 menit agar URL yang sama tidak diproses berulang, dan alamat IP dipakai sebatas untuk rate limit.",
  },
  {
    q: `Apakah ${siteConfig.name} bisa download video?`,
    a: "Ya, jika media pada tautan tersebut dapat diproses oleh downloader dan kontennya publik.",
  },
  {
    q: `Apakah ${siteConfig.name} bisa download audio?`,
    a: "Ya, jika sumber audio (musik) tersedia pada metadata yang dikembalikan.",
  },
  {
    q: `Apakah ${siteConfig.name} mendukung TikTok Photo Post?`,
    a: "Ya. Foto ditampilkan dalam carousel yang bisa digeser, dan dapat diunduh satu per satu maupun sekaligus.",
  },
  {
    q: "Mengapa download saya gagal?",
    a: "Beberapa kemungkinan: URL tidak valid atau bukan dari tiktok.com, konten privat/dihapus/tidak tersedia di region tertentu, struktur TikTok berubah sehingga extractor perlu diperbarui, Anda terkena rate limit karena terlalu banyak permintaan, atau server sedang mengalami gangguan/timeout. Coba lagi beberapa saat kemudian dengan tautan yang benar.",
  },
  {
    q: `Apakah ${siteConfig.name} adalah website resmi TikTok?`,
    a: `Bukan. ${siteConfig.name} adalah project open-source independen dan tidak berafiliasi, tidak disponsori, serta tidak didukung oleh TikTok.`,
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mt-14 scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="font-display text-2xl font-bold sm:text-3xl">FAQ</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pertanyaan yang sering ditanyakan tentang {siteConfig.name}.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="panel overflow-hidden">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-semibold sm:text-base"
                  >
                    {item.q}
                    <motion.i
                      className="fa-solid fa-chevron-down shrink-0 text-xs text-muted-foreground"
                      aria-hidden="true"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
