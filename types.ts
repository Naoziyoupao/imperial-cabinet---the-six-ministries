import { ReactNode } from 'react';

export enum MinistryType {
  PERSONNEL = 'PERSONNEL', // Li Bu (Appointments)
  REVENUE = 'REVENUE',     // Hu Bu (Finance)
  RITES = 'RITES',         // Li Bu (Ceremonies)
  WAR = 'WAR',             // Bing Bu (Military)
  JUSTICE = 'JUSTICE',     // Xing Bu (Law)
  WORKS = 'WORKS'          // Gong Bu (Construction)
}

export interface Minister {
  id: MinistryType;
  name: string;
  title: string;
  chineseTitle: string;
  description: string;
  personality: string;
  avatarColor: string;
  systemInstruction: string;
}

export interface Source {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  sources?: Source[];
  images?: string[]; // Array of Base64 Data URIs
}

export interface ChatSessionState {
  messages: ChatMessage[];
  isTyping: boolean;
}

export interface MinisterSettings {
  provider: 'google' | 'openai'; // 'google' for Gemini SDK, 'openai' for generic compatible APIs
  model: string;
  enableSearch: boolean;
  apiKey?: string;    // User override for API Key
  baseUrl?: string;   // User override for API Endpoint
}

export interface ModelPreset {
  id: string;
  name: string;
  provider: 'google' | 'openai';
  model: string;
  baseUrl?: string;
  apiKey?: string;
}