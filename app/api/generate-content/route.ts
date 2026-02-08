import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeTranscript } from "youtube-transcript";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function getTranscript(videoId: string): Promise<string> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map(item => item.text).join(' ');
  } catch (error) {
    console.error("Failed to fetch transcript:", error);
    throw new Error("Could not fetch video transcript");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl, quizType = "multiple-choice" } = await request.json();

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Get transcript
    const transcript = await getTranscript(videoId);

    // Generate flashcards and quiz using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Based on this video transcript, create educational content:

TRANSCRIPT:
${transcript.slice(0, 10000)}

Generate the following in JSON format (respond ONLY with valid JSON, no markdown):
{
  "flashcards": [
    { "id": "1", "question": "...", "answer": "..." },
    // Generate 10-15 flashcards
  ],
  "quizQuestions": [
    { 
      "id": "1", 
      "question": "...", 
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0  // index of correct option
    }
    // Generate 5-10 quiz questions
  ]
}

Make the content educational and helpful for studying.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let content;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      content = JSON.parse(cleanedText);
    } catch {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json(
        { error: "Failed to parse generated content" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: Date.now(),
      title: `Video: ${videoId}`,
      flashcards: content.flashcards || [],
      quizQuestions: content.quizQuestions || [],
    });
  } catch (error) {
    console.error("Generate content error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
