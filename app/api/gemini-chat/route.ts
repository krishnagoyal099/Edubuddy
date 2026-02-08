import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a helpful AI study assistant called EduBuddy. 
    Help students with their learning and studying needs. 
    Be encouraging, clear, and educational in your responses.
    
    Student's question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const reply = response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Gemini chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
