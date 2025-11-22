
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
  id: string; // Changed from MinistryType to string to support unique IDs for subordinates
  ministryId: MinistryType; // Keep track of which ministry they belong to
  name: string;
  title: string;
  chineseTitle: string;
  rank: string; // e.g. "正二品"
  description: string;
  personality: string;
  avatarColor: string;
  systemInstruction: string;
  subordinates?: Minister[]; // Recursive structure for hierarchy
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
  customInstruction?: string; // User override for System Prompt/Persona
}

export interface ModelPreset {
  id: string;
  name: string;
  provider: 'google' | 'openai';
  model: string;
  baseUrl?: string;
  apiKey?: string;
}

// --- APPEARANCE SETTINGS ---

export type AppThemeId = 'classic' | 'imperial';
export type AppFontId = 'serif' | 'sans';
export type AppLanguage = 'en' | 'zh';

export interface ThemeConfig {
  id: AppThemeId;
  name: string;
  colors: {
    appBg: string;
    sidebarBg: string;
    sidebarBorder: string;
    sidebarText: string;
    cardBg: string;
    cardBorder: string;
    cardActiveBg: string;
    cardActiveBorder: string;
    mainBg: string;
    mainText: string;
    headerBg: string;
    headerText: string;
    userBubble: string;
    aiBubble: string;
    accent: string; // General accent color
    buttonPrimary: string;
  };
  bgPattern?: string; // CSS class for pattern
}

export interface AppearanceSettings {
  themeId: AppThemeId;
  fontId: AppFontId;
  language: AppLanguage;
}
