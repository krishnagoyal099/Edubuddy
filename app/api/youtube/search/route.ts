import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const timePreference = searchParams.get("type") || "quick";

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: "YouTube API key not configured" },
        { status: 500 }
      );
    }

    let maxResults = 12;
    let duration = "medium";
    let enhancedQuery = query;
    let searchType = "video";

    switch (timePreference) {
      case "quick":
        maxResults = 10;
        duration = "medium";
        enhancedQuery = `${query} tutorial crash course beginner guide how to learn -shorts -short`;
        break;
      case "one-shot":
        maxResults = 8;
        duration = "long";
        enhancedQuery = `${query} complete tutorial full course comprehensive guide one video -shorts -short`;
        break;
      case "playlist":
        maxResults = 15;
        duration = "any";
        searchType = "playlist";
        enhancedQuery = `${query} playlist course series tutorial learning -shorts`;
        break;
      default:
        enhancedQuery = `${query} tutorial programming learn -shorts -short`;
    }

    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", enhancedQuery);
    searchUrl.searchParams.set("type", searchType);
    searchUrl.searchParams.set("maxResults", maxResults.toString());
    searchUrl.searchParams.set("order", "relevance");
    if (searchType === "video") {
      searchUrl.searchParams.set("videoDuration", duration);
      searchUrl.searchParams.set("videoDefinition", "high");
    }
    searchUrl.searchParams.set("relevanceLanguage", "en");
    searchUrl.searchParams.set("key", API_KEY);

    const response = await fetch(searchUrl.toString());

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    const videos = data.items.map((item: any) => {
      const title = item.snippet.title.toLowerCase();
      let difficulty: "Beginner" | "Intermediate" | "Advanced" = "Beginner";
      
      if (title.includes("advanced") || title.includes("expert") || title.includes("master")) {
        difficulty = "Advanced";
      } else if (title.includes("intermediate") || title.includes("beyond basic")) {
        difficulty = "Intermediate";
      }

      return {
        id: searchType === "playlist" ? item.id.playlistId : item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        difficulty,
        isPlaylist: searchType === "playlist",
      };
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("YouTube search error:", error);
    return NextResponse.json(
      { error: "Failed to search YouTube" },
      { status: 500 }
    );
  }
}
