/**
 * YouTube Service - Handles video search, filtering, and metadata
 */

export interface YouTubeVideoResult {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  views: string;
  isPlaylist?: boolean;
  isPlaylistVideo?: boolean;
  playlistId?: string;
  playlistTitle?: string;
  playlistVideos?: YouTubeVideoResult[];
}

export type TimePreference = "quick" | "one-shot" | "playlist" | null;

const IRRELEVANT_KEYWORDS = [
  "music", "song", "funny", "meme", "reaction", "unboxing",
  "vlog", "shorts", "short", "#shorts", "60 seconds", "1 minute",
  "quick tip", "life hack", "compilation", "best moments", "best of", "top 10"
];

const EDUCATIONAL_KEYWORDS = [
  "tutorial", "course", "learn", "guide", "how to", "explained",
  "introduction", "basics", "fundamentals", "programming", "coding"
];

/**
 * Parse ISO 8601 duration to readable format
 */
export function parseDuration(isoDuration: string): { formatted: string; totalMinutes: number } {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = match?.[1] || "0";
  const minutes = match?.[2] || "0";
  const seconds = match?.[3] || "0";
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);

  const formatted = hours !== "0"
    ? `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`
    : `${minutes}:${seconds.padStart(2, "0")}`;

  return { formatted, totalMinutes };
}

/**
 * Check if content is educational based on keywords
 */
export function isEducationalContent(title: string, description: string, channel: string): boolean {
  const text = `${title} ${description} ${channel}`.toLowerCase();
  return EDUCATIONAL_KEYWORDS.some(keyword => text.includes(keyword));
}

/**
 * Check if content should be filtered out
 */
export function isIrrelevantContent(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return IRRELEVANT_KEYWORDS.some(keyword => text.includes(keyword));
}

/**
 * Determine difficulty level based on title and duration
 */
export function determineDifficulty(
  title: string,
  totalMinutes: number,
  timePreference: TimePreference
): "Beginner" | "Intermediate" | "Advanced" {
  const lowerTitle = title.toLowerCase();

  // Check explicit difficulty mentions
  if (lowerTitle.includes("advanced") || lowerTitle.includes("expert") || 
      lowerTitle.includes("master") || lowerTitle.includes("professional") || 
      totalMinutes > 120) {
    return "Advanced";
  }
  
  if (lowerTitle.includes("intermediate") || lowerTitle.includes("beyond basic") ||
      lowerTitle.includes("next level") || (totalMinutes > 30 && totalMinutes <= 120)) {
    return "Intermediate";
  }
  
  if (lowerTitle.includes("beginner") || lowerTitle.includes("intro") ||
      lowerTitle.includes("basics") || lowerTitle.includes("fundamentals") ||
      lowerTitle.includes("getting started") || totalMinutes <= 30) {
    return "Beginner";
  }

  // Adjust based on time preference
  if (timePreference === "quick") return "Beginner";
  if (timePreference === "one-shot" && totalMinutes > 60) return "Intermediate";
  
  return "Intermediate";
}

/**
 * Build search parameters based on time preference
 */
export function buildSearchParams(query: string, timePreference: TimePreference): {
  maxResults: number;
  duration: string;
  enhancedQuery: string;
  searchType: "video" | "playlist";
} {
  switch (timePreference) {
    case "quick":
      return {
        maxResults: 10,
        duration: "medium",
        enhancedQuery: `${query} tutorial crash course beginner guide how to learn -shorts -short`,
        searchType: "video"
      };
    case "one-shot":
      return {
        maxResults: 8,
        duration: "long",
        enhancedQuery: `${query} complete tutorial full course comprehensive guide one video -shorts -short`,
        searchType: "video"
      };
    case "playlist":
      return {
        maxResults: 15,
        duration: "any",
        enhancedQuery: `${query} playlist course series tutorial learning -shorts`,
        searchType: "playlist"
      };
    default:
      return {
        maxResults: 12,
        duration: "medium",
        enhancedQuery: `${query} tutorial programming learn -shorts -short`,
        searchType: "video"
      };
  }
}

/**
 * Filter video based on duration and time preference
 */
export function shouldIncludeVideo(
  totalMinutes: number,
  timePreference: TimePreference
): boolean {
  if (timePreference === "quick" && (totalMinutes < 1 || totalMinutes > 30)) {
    return false;
  }
  if (timePreference === "one-shot" && totalMinutes < 10) {
    return false;
  }
  return true;
}

/**
 * Search YouTube videos with filtering and enrichment
 */
export async function searchYouTubeVideos(
  query: string,
  timePreference: TimePreference,
  page: number = 1
): Promise<YouTubeVideoResult[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) {
    throw new Error("YouTube API key not configured");
  }

  const params = buildSearchParams(query, timePreference);
  
  // Build search URL
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", params.enhancedQuery);
  searchUrl.searchParams.set("type", params.searchType);
  searchUrl.searchParams.set("maxResults", params.maxResults.toString());
  searchUrl.searchParams.set("order", "relevance");
  if (params.searchType === "video") {
    searchUrl.searchParams.set("videoDuration", params.duration);
    searchUrl.searchParams.set("videoDefinition", "high");
  }
  searchUrl.searchParams.set("relevanceLanguage", "en");
  searchUrl.searchParams.set("key", API_KEY);

  const response = await fetch(searchUrl.toString());
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json();

  if (timePreference === "playlist") {
    return processPlaylistResults(data.items, API_KEY);
  } else {
    return processVideoResults(data.items, timePreference, API_KEY);
  }
}

async function processPlaylistResults(items: any[], apiKey: string): Promise<YouTubeVideoResult[]> {
  const results = await Promise.all(
    items.map(async (item: any): Promise<YouTubeVideoResult | null> => {
      const title = item.snippet.title.toLowerCase();
      const description = item.snippet.description?.toLowerCase() || "";

      if (isIrrelevantContent(title, description)) {
        return null;
      }

      try {
        // Fetch playlist videos
        const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
        playlistUrl.searchParams.set("part", "snippet");
        playlistUrl.searchParams.set("playlistId", item.id.playlistId);
        playlistUrl.searchParams.set("maxResults", "20");
        playlistUrl.searchParams.set("key", apiKey);

        const playlistResponse = await fetch(playlistUrl.toString());
        const playlistData = await playlistResponse.json();

        const playlistVideos: YouTubeVideoResult[] = playlistData.items?.map((pItem: any) => ({
          id: pItem.snippet.resourceId.videoId,
          title: pItem.snippet.title,
          channel: pItem.snippet.channelTitle,
          duration: "Video",
          thumbnail: pItem.snippet.thumbnails.medium.url,
          difficulty: "Intermediate" as const,
          views: "Playlist Video",
          isPlaylistVideo: true,
          playlistId: item.id.playlistId,
          playlistTitle: item.snippet.title,
        })) || [];

        return {
          id: item.id.playlistId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          duration: "Playlist",
          thumbnail: item.snippet.thumbnails.medium.url,
          difficulty: determineDifficulty(item.snippet.title, 0, "playlist"),
          views: `${playlistVideos.length} videos`,
          isPlaylist: true,
          playlistVideos,
        };
      } catch {
        return {
          id: item.id.playlistId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          duration: "Playlist",
          thumbnail: item.snippet.thumbnails.medium.url,
          difficulty: "Intermediate" as const,
          views: "Playlist",
          isPlaylist: true,
          playlistVideos: [],
        };
      }
    })
  );

  return results.filter((v): v is YouTubeVideoResult => v !== null);
}

async function processVideoResults(
  items: any[],
  timePreference: TimePreference,
  apiKey: string
): Promise<YouTubeVideoResult[]> {
  // Get video details for duration and views
  const videoIds = items.map((item: any) => item.id.videoId).join(",");
  const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  detailsUrl.searchParams.set("part", "contentDetails,statistics");
  detailsUrl.searchParams.set("id", videoIds);
  detailsUrl.searchParams.set("key", apiKey);

  const detailsResponse = await fetch(detailsUrl.toString());
  const detailsData = await detailsResponse.json();

  return items
    .map((item: any, index: number) => {
      const details = detailsData.items?.[index];
      const duration = details?.contentDetails?.duration || "PT0M0S";
      const views = details?.statistics?.viewCount || "0";
      const { formatted, totalMinutes } = parseDuration(duration);

      const title = item.snippet.title;
      const description = item.snippet.description || "";
      const channel = item.snippet.channelTitle;

      // Filter checks
      if (!shouldIncludeVideo(totalMinutes, timePreference)) return null;
      if (isIrrelevantContent(title.toLowerCase(), description.toLowerCase())) return null;
      if (!isEducationalContent(title, description, channel) && timePreference !== null) return null;

      return {
        id: item.id.videoId,
        title,
        channel,
        duration: formatted,
        thumbnail: item.snippet.thumbnails.medium.url,
        difficulty: determineDifficulty(title, totalMinutes, timePreference),
        views: parseInt(views).toLocaleString() + " views",
      };
    })
    .filter((v): v is YouTubeVideoResult => v !== null);
}
