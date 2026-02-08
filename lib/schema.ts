import { z } from "zod";

// Flashcard type
export type Flashcard = {
  id: string;
  question: string;
  answer: string;
};

// Quiz question type
export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
};

// Message type
export type Message = {
  id: number;
  content: string;
  role: string;
  sessionId: string;
  createdAt: Date;
};

// User type
export type User = {
  id: number;
  username: string;
  email: string;
  name: string | null;
  password: string;
};

// Generate content request/response types
export const generateContentRequestSchema = z.object({
  youtubeUrl: z.string().url(),
});

export type GenerateContentRequest = z.infer<typeof generateContentRequestSchema>;

export type GenerateContentResponse = {
  id: number;
  title: string;
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
};

// Video search schema
export const videoSearchSchema = z.object({
  query: z.string().min(1),
  mode: z.enum(["quick", "oneshot", "playlist"]),
  maxResults: z.number().optional().default(20),
  order: z
    .enum(["relevance", "date", "rating", "viewCount", "title"])
    .optional()
    .default("relevance"),
  duration: z
    .enum(["short", "medium", "long", "any"])
    .optional()
    .default("any"),
});

// Insert message schema
export const insertMessageSchema = z.object({
  content: z.string(),
  role: z.string(),
  sessionId: z.string(),
});
