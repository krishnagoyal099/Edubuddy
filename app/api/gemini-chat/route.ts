import { NextRequest, NextResponse } from "next/server";
import { sendChatMessage } from "@/lib/services/chat.service";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await sendChatMessage(message);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Gemini chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate response" },
      { status: 500 }
    );
  }
}
