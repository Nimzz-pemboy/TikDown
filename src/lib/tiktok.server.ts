/**
 * TikTok metadata/media extraction service.
 * Server-only module. Swap this file if TikTok's page structure changes.
 */

const MOBILE_UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36";

const TIMEOUT_MS = 20_000;

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

/** Accepts tiktok.com watch/photo links and short links (vt/vm/t). */
export function isValidTikTokUrl(raw: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  return (
    host === "tiktok.com" ||
    host.endsWith(".tiktok.com") ||
    host === "vt.tiktok.com" ||
    host === "vm.tiktok.com"
  );
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      authority: "www.tiktok.com",
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "user-agent": MOBILE_UA,
    },
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`upstream_status_${res.status}`);
  return await res.text();
}

/**
 * Extracts metadata + media for a TikTok video or photo post.
 * Returns null when the page has no rehydration payload (removed/private post).
 */
export async function extractTikTok(url: string): Promise<TikTokResult | null> {
  const html = await fetchHtml(url);

  const match = html.match(
    /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/,
  );
  if (!match) return null;

  let data: any;
  try {
    const json = JSON.parse(match[1] ?? "");
    data =
      json?.__DEFAULT_SCOPE__?.["webapp.reflow.video.detail"]?.itemInfo
        ?.itemStruct ??
      json?.__DEFAULT_SCOPE__?.["webapp.video-detail"]?.itemInfo?.itemStruct;
  } catch {
    return null;
  }
  if (!data) return null;

  const isVideo = !data.imagePost;
  let images: string[] = [];
  let video: string | null = null;

  if (!isVideo) {
    images = [
      ...new Set(
        (data.imagePost.images ?? [])
          .map(
            (img: any) =>
              img?.imageURL?.urlList?.[0] || img?.displayImage?.urlList?.[0],
          )
          .filter(Boolean) as string[],
      ),
    ];
  } else {
    try {
      const res = await fetch(
        `https://www.tiktok.com/player/api/v1/items?item_ids=${encodeURIComponent(data.id)}`,
        { signal: AbortSignal.timeout(TIMEOUT_MS) },
      );
      const body: any = await res.json();
      video = body?.items?.[0]?.video_info?.url_list?.[0] ?? null;
    } catch {
      video = null;
    }
    if (!video) {
      video =
        data.video?.playAddr ||
        data.video?.downloadAddr ||
        data.video?.bitrateInfo?.[0]?.PlayAddr?.UrlList?.[0] ||
        null;
    }
  }

  return {
    id: data.id || data.aweme_id || null,
    type: isVideo ? "video" : "photo",
    title: data.desc || data.suggestedWords?.[0] || "",
    region: data.locationCreated || null,
    duration: `${data.video?.duration || data.duration || data.music?.duration || 0} detik`,
    video,
    images,
    author: {
      id: data.author?.id || "",
      avatar: data.author?.avatarThumb || "",
      nickname: data.author?.nickname || "",
      username: data.author?.uniqueId || "",
      followers: data.authorStats?.followerCount || data.author?.followerCount || 0,
      following: data.authorStats?.followingCount || data.author?.followingCount || 0,
      like: data.authorStats?.heartCount || data.author?.heartCount || 0,
      verified: data.author?.verified || false,
      videoCount: data.authorStats?.videoCount || data.author?.videoCount || 0,
    },
    music: {
      id: data.music?.id || null,
      title: data.music?.title || "",
      author: data.music?.authorName || "",
      thumbnail: data.music?.coverLarge || data.music?.coverMedium || null,
      duration: `${data.music?.duration || 0} detik`,
      url: data.music?.playUrl || null,
    },
    stats: {
      like: data.stats?.diggCount || 0,
      views: data.stats?.playCount || 0,
      share: data.stats?.shareCount || 0,
      comment: data.stats?.commentCount || 0,
    },
  };
}
