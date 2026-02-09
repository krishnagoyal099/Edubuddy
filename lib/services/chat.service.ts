/**
 * Chat Service - Gemini AI chat functionality
 */

export interface ChatResponse {
  reply: string;
}

/**
 * Build enhanced prompt for educational context
 */
function buildEducationalPrompt(message: string): string {
  return `You are Edubuddy chat assistant, an intelligent learning assistant focused on education and skill development. 

User message: "${message}"

Please provide a helpful, concise, and well-structured response. Follow these guidelines:
- Keep responses focused and practical
- Use clear, easy-to-understand language
- Include examples when explaining concepts
- Format code snippets with proper syntax highlighting
- For learning topics, provide step-by-step guidance
- Be encouraging and supportive
- Keep responses under 500 words unless detailed explanation is specifically requested

Response:`;
}

/**
 * Send a message to Gemini AI and get a response
 */
export async function sendChatMessage(message: string): Promise<ChatResponse> {
  if (!message || message.trim().length === 0) {
    throw new Error("Message is required");
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const prompt = buildEducationalPrompt(message);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!aiResponse) {
    throw new Error("Failed to get AI response");
  }

  return { reply: aiResponse };
}
