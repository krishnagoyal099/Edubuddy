/**
 * Content Service - Generate study materials from YouTube videos
 */

import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface GeneratedContent {
  transcript: string;
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
}

/**
 * Extract YouTube video ID from URL
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Extract transcript from YouTube video
 */
async function getTranscript(videoId: string): Promise<string> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map((item) => item.text).join(" ");
  } catch (error) {
    console.error("Failed to fetch transcript:", error);
    throw new Error("Could not fetch video transcript. Make sure the video has captions available.");
  }
}

/**
 * Generate content prompt for Gemini
 */
function buildContentPrompt(transcript: string): string {
  return `Based on this video transcript, create educational study materials.

TRANSCRIPT:
${transcript.slice(0, 10000)}

Generate flashcards and quiz questions in the following format:

For each flashcard, use this exact format:
### Flashcard:
Q: [question here]
A: [answer here]

For each quiz question, use this exact format:
### Quiz:
[question here]
Options:
a) [option 1]
b) [option 2]
c) [option 3]
d) [option 4]
Correct: [a, b, c, or d]

Generate 10-15 flashcards and 5-10 quiz questions. Make them educational and helpful for studying.`;
}

/**
 * Parse flashcards from Gemini response
 */
function parseFlashcards(content: string): Flashcard[] {
  const flashcards: Flashcard[] = [];
  const sections = content.split("###").map((s) => s.trim()).filter(Boolean);

  for (const section of sections) {
    if (section.startsWith("Flashcard:")) {
      const text = section.replace(/^Flashcard:\s*/, "").trim();
      const qMatch = text.match(/Q:\s*([\s\S]+?)(?=\s*A:)/);
      const aMatch = text.match(/A:\s*([\s\S]+?)$/);

      if (qMatch && aMatch) {
        flashcards.push({
          id: `fc-${flashcards.length + 1}`,
          question: qMatch[1].trim(),
          answer: aMatch[1].trim(),
        });
      }
    }
  }

  return flashcards;
}

/**
 * Parse quiz questions from Gemini response
 */
function parseQuizQuestions(content: string): QuizQuestion[] {
  const quizzes: QuizQuestion[] = [];
  const sections = content.split("###").map((s) => s.trim()).filter(Boolean);

  for (const section of sections) {
    if (section.startsWith("Quiz:")) {
      const text = section.replace(/^Quiz:\s*/, "").trim();
      const questionMatch = text.match(/^([\s\S]+?)(?=\s*Options:)/);
      const optionsMatch = text.match(/Options:\s*([\s\S]+?)(?=\s*Correct:)/);
      const correctMatch = text.match(/Correct:\s*([a-d])/);

      if (questionMatch && optionsMatch && correctMatch) {
        const options = optionsMatch[1]
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => /^[a-d]\)/.test(line))
          .map((line) => line.replace(/^[a-d]\)\s*/, "").trim());

        if (options.length === 4) {
          quizzes.push({
            id: `quiz-${quizzes.length + 1}`,
            question: questionMatch[1].trim(),
            options,
            correctAnswer: correctMatch[1].charCodeAt(0) - "a".charCodeAt(0),
          });
        }
      }
    }
  }

  return quizzes;
}

/**
 * Generate study materials from a YouTube URL
 */
export async function generateStudyMaterials(youtubeUrl: string): Promise<GeneratedContent> {
  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  // Get transcript
  const transcript = await getTranscript(videoId);

  // Generate content using Gemini
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = buildContentPrompt(transcript);
  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Parse the response
  const flashcards = parseFlashcards(response);
  const quizQuestions = parseQuizQuestions(response);

  return {
    transcript,
    flashcards,
    quizQuestions,
  };
}

/**
 * Validate YouTube URL format
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}
