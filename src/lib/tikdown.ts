export type TikTokAuthor = {
  id: string;
  avatar: string;
  nickname: string;
  username: string;
  followers: number;
  following: number;
  like: number;
  verified: boolean;
  videoCount: number;
};

export type TikTokMusic = {
  id: string | null;
  title: string;
  author: string;
  thumbnail: string | null;
  duration: string;
  url: string | null;
};

export type TikTokStats = {
  like: number;
  views: number;
  share: number;
  comment: number;
};

export type TikTokResult = {
  id: string | null;
  type: "video" | "photo";
  title: string;
  region: string | null;
  duration: string;
  video: string | null;
  images: string[];
  author: TikTokAuthor;
  music: TikTokMusic;
  stats: TikTokStats;
};

export type DownloadResponse =
  | { success: true; type: "video" | "photo"; cached?: boolean; data: TikTokResult }
  | { success: false; error: string };

export const fmtNum = (n: number): string => {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
};

/** Proxy URL used for saving media through our own origin. */
export const mediaUrl = (url: string, filename: string) =>
  `/api/public/media?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
