import { NextRequest, NextResponse } from "next/server";

interface Resource {
  title: string;
  url: string;
  description?: string;
  type: "article" | "video" | "course" | "documentation" | "other";
  isFree?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic");

    if (!topic) {
      return NextResponse.json(
        { error: "Topic parameter is required" },
        { status: 400 }
      );
    }

    // Generate learning resources based on the topic
    const resources: Resource[] = [
      {
        title: `${topic} - Complete Guide`,
        url: `https://www.google.com/search?q=${encodeURIComponent(topic + " tutorial")}`,
        description: `Comprehensive guide to learning ${topic}`,
        type: "article",
        isFree: true,
      },
      {
        title: `${topic} - Video Course`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " course")}`,
        description: `Video tutorials and courses about ${topic}`,
        type: "video",
        isFree: true,
      },
      {
        title: `${topic} - Documentation`,
        url: `https://devdocs.io/#q=${encodeURIComponent(topic)}`,
        description: `Official documentation and references for ${topic}`,
        type: "documentation",
        isFree: true,
      },
      {
        title: `${topic} - Interactive Course`,
        url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(topic)}`,
        description: `Free interactive learning resources for ${topic}`,
        type: "course",
        isFree: true,
      },
      {
        title: `${topic} - Community Discussions`,
        url: `https://stackoverflow.com/search?q=${encodeURIComponent(topic)}`,
        description: `Q&A and discussions about ${topic}`,
        type: "other",
        isFree: true,
      },
    ];

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Learn Anything search error:", error);
    return NextResponse.json(
      { error: "Failed to search resources" },
      { status: 500 }
    );
  }
}
