import { NextRequest, NextResponse } from "next/server";

// In-memory messages storage
const messages: Map<string, any[]> = new Map();
let messageIdCounter = 1;

export async function POST(request: NextRequest) {
  try {
    const { content, role, sessionId } = await request.json();

    if (!content || !role || !sessionId) {
      return NextResponse.json(
        { error: "Content, role, and sessionId are required" },
        { status: 400 }
      );
    }

    const message = {
      id: messageIdCounter++,
      content,
      role,
      sessionId,
      createdAt: new Date(),
    };

    if (!messages.has(sessionId)) {
      messages.set(sessionId, []);
    }
    messages.get(sessionId)!.push(message);

    return NextResponse.json(message);
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
