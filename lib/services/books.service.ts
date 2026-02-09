/**
 * Books Service - AI-powered book recommendations using Gemini
 */

export interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  description: string;
  previewUrl: string;
  downloadUrl: string;
  totalPages: number;
  rating: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface GeminiBookResponse {
  title: string;
  author: string;
  description: string;
  difficulty: string;
  pages: number;
}

/**
 * Get AI-powered book recommendations for a subject
 */
export async function getBookRecommendations(subject: string): Promise<BookRecommendation[]> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const prompt = `Recommend the top 8 best books for learning ${subject}. For each book, provide:
1. Title (exact title)
2. Author name
3. Brief description (2-3 sentences)
4. Difficulty level (Beginner/Intermediate/Advanced)
5. Estimated page count

Format your response as a JSON array with this structure:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "description": "Brief description here",
    "difficulty": "Beginner|Intermediate|Advanced",
    "pages": 300
  }
]

Focus on practical, well-known books that are actually available and useful for learning ${subject}.`;

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
    throw new Error("No response from Gemini AI");
  }

  const bookRecommendations = parseBookResponse(aiResponse);
  return enrichBooksWithLinks(bookRecommendations);
}

/**
 * Parse AI response to extract book recommendations
 */
function parseBookResponse(response: string): GeminiBookResponse[] {
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("No valid JSON found in AI response");
  }
  return JSON.parse(jsonMatch[0]);
}

/**
 * Enrich books with search/download links
 */
async function enrichBooksWithLinks(books: GeminiBookResponse[]): Promise<BookRecommendation[]> {
  return Promise.all(
    books.map(async (book, index) => {
      const searchQuery = encodeURIComponent(`${book.title} ${book.author} filetype:pdf`);
      let pdfUrl = `https://www.google.com/search?q=${searchQuery}`;

      // Try Google Custom Search API if available
      if (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
        try {
          const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${searchQuery}`;
          const searchResponse = await fetch(searchUrl);
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            const pdfResult = searchData.items?.find(
              (item: any) => item.link?.toLowerCase().endsWith(".pdf") || item.fileFormat === "PDF"
            );
            if (pdfResult) {
              pdfUrl = pdfResult.link;
            }
          }
        } catch {
          // Fall back to Google search
        }
      }

      return {
        id: `ai-book-${index}`,
        title: book.title || "Unknown Title",
        author: book.author || "Unknown Author",
        description: book.description || "No description available",
        previewUrl: `https://www.google.com/search?q=${encodeURIComponent(book.title + " " + book.author + " preview")}`,
        downloadUrl: pdfUrl,
        totalPages: book.pages || 350,
        rating: 4.5,
        difficulty: (book.difficulty as "Beginner" | "Intermediate" | "Advanced") || "Intermediate",
      };
    })
  );
}
