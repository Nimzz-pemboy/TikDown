import { SiteLogo } from "@/components/site-logo";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <SiteLogo size={32} />
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{siteConfig.description}</p>
        </div>

        <nav aria-label="Navigasi footer" className="flex flex-col gap-2 text-sm">
          <span className="font-semibold">Navigasi</span>
          <a href="#top" className="text-muted-foreground transition-colors hover:text-foreground">
            Home
          </a>
          <a
            href="#cara-download"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Cara Download
          </a>
          <a href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">
            FAQ
          </a>
          {siteConfig.repoUrl && (
            <a
              href={siteConfig.repoUrl}
              rel="noreferrer noopener"
              target="_blank"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <i className="fa-brands fa-github mr-1.5" aria-hidden="true" />
              Open source
            </a>
          )}
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-5xl space-y-2 px-4 py-6 text-xs leading-relaxed text-muted-foreground">
          <p>
            <strong className="font-semibold text-foreground">Disclaimer:</strong>{" "}
            {siteConfig.name} adalah project independen dan tidak berafiliasi dengan TikTok.
            Pengguna bertanggung jawab untuk memastikan bahwa media yang mereka unduh digunakan
            sesuai hak dan ketentuan yang berlaku.
          </p>
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
