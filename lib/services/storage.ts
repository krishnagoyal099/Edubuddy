/**
 * Shared Storage Module - Singleton instance for all API routes
 */

import * as fs from "fs";
import * as path from "path";

// Define types locally to avoid circular dependency issues
export interface User {
  id: number;
  username: string;
  email: string;
  name: string | null;
  password: string;
  createdAt?: Date;
}

export interface InsertUser {
  username: string;
  email: string;
  name?: string | null;
  password: string;
}

export interface Message {
  id: number;
  content: string;
  role: string;
  sessionId: string;
  createdAt: Date;
}

export interface InsertMessage {
  content: string;
  role: string;
  sessionId: string;
}

export interface Video {
  id: number;
  youtubeUrl: string;
  title: string;
  transcript: string;
  flashcards: any[];
  quizQuestions: any[];
}

export interface LearningHistory {
  id: number;
  userId?: number | null;
  subject: string;
  videoTitle?: string | null;
  bookTitle?: string | null;
  duration?: number | null;
  createdAt: Date;
}

export interface InsertLearningHistory {
  userId?: number | null;
  subject: string;
  videoTitle?: string | null;
  bookTitle?: string | null;
  duration?: number | null;
}

export interface BreakSession {
  id: number;
  userId?: number | null;
  gameType: string;
  duration: number;
  completed?: boolean | null;
  createdAt: Date;
}

export interface InsertBreakSession {
  userId?: number | null;
  gameType: string;
  duration: number;
  completed?: boolean | null;
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Learning history
  createLearningHistory(history: InsertLearningHistory): Promise<LearningHistory>;
  getLearningHistory(userId?: number): Promise<LearningHistory[]>;
  
  // Break sessions
  createBreakSession(session: InsertBreakSession): Promise<BreakSession>;
  getBreakSessions(userId?: number): Promise<BreakSession[]>;
  
  // Videos
  createVideo(data: { youtubeUrl: string }): Promise<Video>;
  getVideo(id: number): Promise<Video | undefined>;
  updateVideo(id: number, data: Partial<Video>): Promise<Video | undefined>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySession(sessionId: string): Promise<Message[]>;
  clearMessagesBySession(sessionId: string): Promise<void>;
}

class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private learningHistories: Map<number, LearningHistory> = new Map();
  private breakSessionsMap: Map<number, BreakSession> = new Map();
  private videos: Map<number, Video> = new Map();
  private messagesMap: Map<string, Message[]> = new Map();
  
  private currentUserId = 1;
  private currentHistoryId = 1;
  private currentSessionId = 1;
  private currentVideoId = 1;
  private currentMessageId = 1;
  
  private dataFilePath: string;

  constructor() {
    this.dataFilePath = path.join(process.cwd(), "data", "storage.json");
    this.loadData();
  }

  private loadData(): void {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const data = JSON.parse(fs.readFileSync(this.dataFilePath, "utf-8"));
        
        if (data.users) {
          this.users = new Map(Object.entries(data.users).map(([k, v]) => [parseInt(k), v as User]));
          this.currentUserId = Math.max(...Array.from(this.users.keys()), 0) + 1;
        }
        if (data.videos) {
          this.videos = new Map(Object.entries(data.videos).map(([k, v]) => [parseInt(k), v as Video]));
          this.currentVideoId = Math.max(...Array.from(this.videos.keys()), 0) + 1;
        }
        if (data.messages) {
          this.messagesMap = new Map(Object.entries(data.messages) as [string, Message[]][]);
        }
      }
    } catch (error) {
      console.log("No existing storage data found, starting fresh");
    }
  }

  private saveData(): void {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const data = {
        users: Object.fromEntries(this.users),
        videos: Object.fromEntries(this.videos),
        messages: Object.fromEntries(this.messagesMap),
      };
      
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Failed to save storage data:", error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(parseInt(id));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      username: insertUser.username,
      email: insertUser.email,
      name: insertUser.name ?? null,
      password: insertUser.password,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    this.saveData();
    return user;
  }

  async createLearningHistory(history: InsertLearningHistory): Promise<LearningHistory> {
    const entry: LearningHistory = {
      ...history,
      id: this.currentHistoryId++,
      createdAt: new Date(),
    };
    this.learningHistories.set(entry.id, entry);
    return entry;
  }

  async getLearningHistory(userId?: number): Promise<LearningHistory[]> {
    const all = Array.from(this.learningHistories.values());
    return userId ? all.filter(h => h.userId === userId) : all;
  }

  async createBreakSession(session: InsertBreakSession): Promise<BreakSession> {
    const entry: BreakSession = {
      ...session,
      id: this.currentSessionId++,
      createdAt: new Date(),
    };
    this.breakSessionsMap.set(entry.id, entry);
    return entry;
  }

  async getBreakSessions(userId?: number): Promise<BreakSession[]> {
    const all = Array.from(this.breakSessionsMap.values());
    return userId ? all.filter(s => s.userId === userId) : all;
  }

  async createVideo(data: { youtubeUrl: string }): Promise<Video> {
    const video: Video = {
      id: this.currentVideoId++,
      youtubeUrl: data.youtubeUrl,
      title: "",
      transcript: "",
      flashcards: [],
      quizQuestions: [],
    };
    this.videos.set(video.id, video);
    this.saveData();
    return video;
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async updateVideo(id: number, data: Partial<Video>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updated = { ...video, ...data };
    this.videos.set(id, updated);
    this.saveData();
    return updated;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      ...insertMessage,
      id: this.currentMessageId++,
      createdAt: new Date(),
    };
    
    const sessionMessages = this.messagesMap.get(message.sessionId) || [];
    sessionMessages.push(message);
    this.messagesMap.set(message.sessionId, sessionMessages);
    this.saveData();
    return message;
  }

  async getMessagesBySession(sessionId: string): Promise<Message[]> {
    return this.messagesMap.get(sessionId) || [];
  }

  async clearMessagesBySession(sessionId: string): Promise<void> {
    this.messagesMap.delete(sessionId);
    this.saveData();
  }
}

// Export singleton instance
export const storage = new MemStorage();
