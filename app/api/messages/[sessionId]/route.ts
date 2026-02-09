import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/services/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const sessionMessages = await storage.getMessagesBySession(sessionId);
    return NextResponse.json(sessionMessages);
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Failed to get messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    const { content, role } = await request.json();

    if (!content || !role || !sessionId) {
      return NextResponse.json(
        { error: "Content, role, and sessionId are required" },
        { status: 400 }
      );
    }

    const message = await storage.createMessage({
      content,
      role,
      sessionId,
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    await storage.clearMessagesBySession(sessionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete messages error:", error);
    return NextResponse.json(
      { error: "Failed to delete messages" },
      { status: 500 }
    );
  }
}
