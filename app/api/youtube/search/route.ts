import { NextRequest, NextResponse } from "next/server";
import {
  searchYouTubeVideos,
  type TimePreference,
} from "@/lib/services/youtube.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const timePreference = (searchParams.get("type") as TimePreference) || null;
    const page = parseInt(searchParams.get("page") || "1");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const videos = await searchYouTubeVideos(query, timePreference, page);
    return NextResponse.json(videos);
  } catch (error) {
    console.error("YouTube search error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to search YouTube" },
      { status: 500 }
    );
  }
}
