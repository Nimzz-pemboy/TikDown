/**
 * Central site configuration — required values, not env vars.
 * Edit this file directly to rebrand (name, URL, description, logo, repo link).
 * Assets live in /public so they are easy for developers to swap.
 */
export const siteConfig = {
  name: "TikDown",
  url: "https://example.com",
  description:
    "TikDown membantu Anda mengambil metadata dan mengunduh media dari tautan TikTok publik: video, audio, dan photo post. Tanpa login.",
  tagline: "TikTok Downloader",
  /** Swap the file in /public to change branding. */
  logo: "/logo.png",
  favicon: "/favicon.png",
  /** Leave empty to hide the GitHub link. */
  repoUrl: "https://github.com",
} as const;

export type SiteConfig = typeof siteConfig;
