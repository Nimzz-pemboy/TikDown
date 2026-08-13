import { motion } from "framer-motion";

import { siteConfig } from "@/config/site";

const STEPS = [
  {
    icon: "fa-mobile-screen-button",
    title: "Langkah 1",
    body: "Buka aplikasi TikTok dan pilih video atau photo post yang ingin diproses.",
  },
  {
    icon: "fa-copy",
    title: "Langkah 2",
    body: "Salin URL/link TikTok melalui menu Share → Copy link.",
  },
  {
    icon: "fa-paste",
    title: "Langkah 3",
    body: `Tempel URL tersebut ke kolom input di ${siteConfig.name}.`,
  },
  {
    icon: "fa-download",
    title: "Langkah 4",
    body: 'Tekan tombol "Ambil Media" dan tunggu sebentar.',
  },
  {
    icon: "fa-circle-check",
    title: "Langkah 5",
    body: "Setelah metadata muncul, pilih Download Video, Download Audio, atau Download Image untuk photo post.",
  },
];

export function TutorialSection() {
  return (
    <section id="cara-download" className="mt-14 scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Cara Menggunakan {siteConfig.name}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Lima langkah singkat, tanpa aplikasi tambahan dan tanpa login.
        </p>
      </motion.div>

      <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="panel flex gap-3 p-5"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <i className={`fa-solid ${step.icon}`} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
