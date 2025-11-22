
import React from 'react';
import { Minister, MinistryType, ThemeConfig } from './types';

// --- CUSTOM CHINESE STYLE ICONS ---

const IconPersonnel = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <title>Official Hat (Wushamao)</title>
    {/* Cap Body */}
    <path d="M5 11c0-4 3-6 7-6s7 2 7 6v2H5v-2z" />
    {/* Brim */}
    <path d="M5 13h14v2H5z" />
    {/* Wings (Chizi) */}
    <path d="M2 13h3" />
    <path d="M19 13h3" />
  </svg>
);

const IconRevenue = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <title>Copper Coin (Tongqian)</title>
    <circle cx="12" cy="12" r="9" />
    {/* Square hole */}
    <rect x="9" y="9" width="6" height="6" rx="0.5" />
  </svg>
);

const IconRites = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <title>Bronze Tripod (Ding)</title>
    {/* Vessel Body */}
    <path d="M5 8v5c0 4 3 6 7 6s7-2 7-6V8" />
    {/* Rim */}
    <path d="M5 8h14" />
    {/* Handles (Er) */}
    <path d="M6 8V4" />
    <path d="M18 8V4" />
    {/* Legs (Zu) */}
    <path d="M8 19v3" />
    <path d="M16 19v3" />
  </svg>
);

const IconWar = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <title>Warrior Helmet (Doumou)</title>
    {/* Top Ornament */}
    <path d="M12 2v5" />
    {/* Helmet Dome */}
    <path d="M5 10c0-4 3.5-5 7-5s7 1 7 5v5c0 2-2 3-4 3h-6c-2 0-4-1-4-3v-5z" />
    {/* Ear/Neck Guards */}
    <path d="M5 15l-2 4" />
    <path d="M19 15l2 4" />
  </svg>
);

const IconJustice = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <title>Authority Token (Lingpai)</title>
    {/* Token Shape */}
    <path d="M12 2l-7 5v15h14V7l-7-5z" />
    {/* Inner Border */}
    <path d="M12 5l-4 3v11h8V8l-4-3z" />
    {/* Center Mark */}
    <circle cx="12" cy="14" r="1.5" fill="currentColor" />
  </svg>
);

const IconWorks = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <title>Pagoda (Ta)</title>
    {/* Top Roof */}
    <path d="M12 2L2 7h20L12 2z" />
    {/* Upper Floor */}
    <path d="M6 7v4h12V7" />
    {/* Lower Roof */}
    <path d="M2 11l2 2h16l2-2" />
    {/* Lower Floor */}
    <path d="M5 13v7h14v-7" />
    {/* Doorway */}
    <path d="M10 20v-4h4v4" />
  </svg>
);

export const MINISTRY_ICONS: Record<MinistryType, React.ReactNode> = {
  [MinistryType.PERSONNEL]: <IconPersonnel className="w-6 h-6" />, // Official Hat
  [MinistryType.REVENUE]: <IconRevenue className="w-6 h-6" />, // Copper Coin
  [MinistryType.RITES]: <IconRites className="w-6 h-6" />, // Bronze Ding
  [MinistryType.WAR]: <IconWar className="w-6 h-6" />, // Helmet
  [MinistryType.JUSTICE]: <IconJustice className="w-6 h-6" />, // Token
  [MinistryType.WORKS]: <IconWorks className="w-6 h-6" />, // Pagoda
};

// --- LOCALIZATION ---
export const UI_LABELS = {
  en: {
    ministerSettings: "Minister Settings",
    roleSettings: "Role Settings",
    secretEdict: "Secret Edict",
    roleSettingsTitle: "Role Settings (Persona)",
    roleSettingsDesc: "Define how this official speaks, thinks, and behaves.",
    resetDefault: "Reset to Default",
    cancel: "Cancel",
    savePersona: "Save Persona",
    protocol: "Communication Protocol",
    quickSummons: "Quick Summons (Presets)",
    library: "Imperial Library (My Models)",
    libraryEmpty: "The library is empty. Configure a model below and click \"Add to Library\".",
    configEditor: "Configuration Editor",
    nameLabel: "NAME",
    namePlaceholder: "Name your preset (e.g. My GPT-4)",
    modelIdLabel: "MODEL ID",
    modelIdPlaceholder: "e.g., gemini-2.5-flash",
    apiString: "API Model String",
    endpointLabel: "API Endpoint (Base URL)",
    keyLabel: "API Key (Specific Override)",
    keyPlaceholder: "Enter specific key...",
    addToLib: "Add Current Config to Library",
    searchTitle: "Imperial Archives (Google Search)",
    searchDesc: "Enable groundling to access real-time information via Google Search.",
    apply: "Apply Edict (钦此)",
    inputPlaceholder: "Speak, Your Majesty...",
    sendButton: "宣",
    uploadButton: "Present Painting (Upload Image)",
    citations: "Imperial Citations (注疏):",
    consulting: "The Minister is consulting the archives...",
    welcomeTitle: "Imperial Cabinet",
    welcomeSub: "The Six Ministers and their subordinates await your command.",
    welcomeButton: "Appearance",
    backButton: "Back to Audience Hall",
    imperialSeal: "Imperial Seal Missing",
    currentlyAudience: "Currently Audience",
    cabinetTitle: "The Six Ministries",
    hallName: "Hall of Literary Brilliance",
    brushHint: "Imperial Brush (Paste images to upload)",
    searching: "Searching Archives",
    revokeKey: "Revoke",
    sealVerified: "Seal Verified"
  },
  zh: {
    ministerSettings: "尚书设置",
    roleSettings: "角色设定",
    secretEdict: "密旨",
    roleSettingsTitle: "御批人设",
    roleSettingsDesc: "钦定此官员之言行举止、性格心思。",
    resetDefault: "恢复祖制 (重置)",
    cancel: "取消",
    savePersona: "颁布设定",
    protocol: "通讯规制 (Protocol)",
    quickSummons: "加急传唤 (预设)",
    library: "御书房 (模型库)",
    libraryEmpty: "御书房暂空。请在下方配置模型并点击“收入御书房”。",
    configEditor: "配置折子",
    nameLabel: "名号",
    namePlaceholder: "赐名 (如: 朕的DeepSeek)",
    modelIdLabel: "模型代号",
    modelIdPlaceholder: "如: gemini-2.5-flash",
    apiString: "API 模型标识",
    endpointLabel: "令牌地址 (Base URL)",
    keyLabel: "专用信物 (API Key)",
    keyPlaceholder: "输入专用 Key...",
    addToLib: "收入御书房",
    searchTitle: "皇家档案 (Google Search)",
    searchDesc: "准许官员查阅皇家档案库以获取实时资讯。",
    apply: "钦此 (应用)",
    inputPlaceholder: "请陛下示下...",
    sendButton: "宣",
    uploadButton: "呈览图卷",
    citations: "注疏来源:",
    consulting: "臣正在查阅典籍...",
    welcomeTitle: "大清内阁",
    welcomeSub: "六部尚书及其僚属已在朝房候旨。",
    welcomeButton: "外观设置",
    backButton: "回銮 (返回)",
    imperialSeal: "缺少御印",
    currentlyAudience: "正在奏对",
    cabinetTitle: "六部官制",
    hallName: "文渊阁",
    brushHint: "御笔 (可粘贴图片上传)",
    searching: "查阅档案中",
    revokeKey: "缴回",
    sealVerified: "御印已验"
  }
};

// --- THEMES ---
export const THEMES: Record<string, ThemeConfig> = {
  classic: {
    id: 'classic',
    name: '清雅书斋 (Classic)',
    colors: {
      appBg: 'bg-stone-950',
      sidebarBg: 'bg-[#1c1917]', // Stone 900/Dark Wood
      sidebarBorder: 'border-stone-900',
      sidebarText: 'text-stone-200',
      cardBg: 'bg-stone-900/60',
      cardBorder: 'border-stone-800',
      cardActiveBg: 'bg-stone-800',
      cardActiveBorder: 'border-amber-600/80',
      mainBg: 'bg-[#fdfbf7]', // Rice Paper
      mainText: 'text-stone-800',
      headerBg: 'bg-[#fdfbf7]',
      headerText: 'text-stone-900',
      userBubble: 'bg-amber-100 text-amber-900 border-amber-200',
      aiBubble: 'bg-white text-stone-800 border-stone-200',
      accent: 'text-amber-800',
      buttonPrimary: 'bg-red-800 hover:bg-red-700 text-white',
    },
    bgPattern: 'bg-dark-wood'
  },
  imperial: {
    id: 'imperial',
    name: '皇极殿 (Imperial)',
    colors: {
      appBg: 'bg-[#2a0a0a]', 
      // Using linear gradient to simulate a round red column
      sidebarBg: 'bg-[linear-gradient(90deg,#3a0000_0%,#6b1212_45%,#6b1212_55%,#3a0000_100%)]', 
      sidebarBorder: 'border-[#FFD700]', // Pure Gold
      sidebarText: 'text-[#FFD700]', // Gold Text
      cardBg: 'bg-black/40',
      cardBorder: 'border-[#d4af37]/30', // Bronze
      cardActiveBg: 'bg-[#7c0f0f]', // Bright Lacquer Red
      cardActiveBorder: 'border-[#FFD700]', // Bright Gold
      mainBg: 'bg-[#fffdf0]', // Golden Silk/Cream
      mainText: 'text-[#4a0404]', // Dark Red Text
      headerBg: 'bg-[#fffdf0]',
      headerText: 'text-[#4a0404]',
      userBubble: 'bg-[#fff8c5] text-[#5c0b0b] border-[#d4af37]', // Imperial Yellow
      aiBubble: 'bg-white text-[#2a0a0a] border-[#e5e7eb]',
      accent: 'text-[#FFD700]',
      buttonPrimary: 'bg-[#d4af37] hover:bg-[#b4941f] text-[#4a0404]', // Gold Button
    },
    bgPattern: '' 
  }
};


const COMMON_INSTRUCTION = `
You are a roleplaying AI in the Qing Dynasty court.
The user is the EMPEROR (address as "Your Majesty" or "陛下").
You must speak in a respectful, archaic, courtly Chinese style (transliterated to English or mixed if requested, but primarily English for this interface with Chinese flavor).
Maintain your specific persona, RANK, and DUTIES at all times. Do not overstep your authority.
Keep responses concise.
`;

// Preset configurations for easier setup
export const AI_PRESETS = {
  GEMINI_FLASH: {
    id: 'gemini-2.5-flash',
    model: 'gemini-2.5-flash',
    provider: 'google',
    baseUrl: '',
    name: 'Gemini 2.5 Flash'
  },
  GEMINI_PRO: {
    id: 'gemini-3-pro-preview',
    model: 'gemini-3-pro-preview',
    provider: 'google',
    baseUrl: '',
    name: 'Gemini 3.0 Pro'
  },
  DEEPSEEK_V3: {
    id: 'deepseek-chat',
    model: 'deepseek-chat',
    provider: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    name: 'DeepSeek V3'
  },
  DEEPSEEK_R1: {
    id: 'deepseek-reasoner',
    model: 'deepseek-reasoner',
    provider: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    name: 'DeepSeek R1 (Reasoner)'
  },
  GPT_4O: {
    id: 'gpt-4o',
    model: 'gpt-4o',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    name: 'GPT-4o'
  }
};

// --- HIERARCHY GENERATION ---

interface RoleDef {
    title: string;
    chineseTitle: string;
    rank: string;
    descTemplate: string;
    instructionTemplate: string;
}

// Roles defined by user request
const SUB_ROLES: RoleDef[] = [
    {
        title: "Left Vice Minister",
        chineseTitle: "左侍郎",
        rank: "正二品",
        descTemplate: "Senior Vice Minister. Assists in major decisions.",
        instructionTemplate: "You are the Left Vice Minister (左侍郎). You are the second-in-command. You are conservative and assist the Minister."
    },
    {
        title: "Right Vice Minister",
        chineseTitle: "右侍郎",
        rank: "正二品",
        descTemplate: "Junior Vice Minister. Handles operational oversight.",
        instructionTemplate: "You are the Right Vice Minister (右侍郎). You focus on execution and detail. You often disagree with the Left Vice Minister."
    },
    {
        title: "Bureau Director",
        chineseTitle: "郎中",
        rank: "正五品",
        descTemplate: "Head of a specific Bureau (Si).",
        instructionTemplate: "You are a Bureau Director (郎中). You manage a specific department within the Ministry. You are practical and deal with specifics."
    },
    {
        title: "Vice Director",
        chineseTitle: "员外郎",
        rank: "从五品",
        descTemplate: "Deputy Head of a Bureau.",
        instructionTemplate: "You are a Vice Director (员外郎). You assist the Director. You are eager to prove yourself."
    },
    {
        title: "Secretary",
        chineseTitle: "主事",
        rank: "正六品",
        descTemplate: "Administrative Secretary. Handles paperwork.",
        instructionTemplate: "You are a Secretary (主事). You handle the files and logistics. You are nervous but diligent."
    },
    {
        title: "Translator/Clerk",
        chineseTitle: "笔帖式",
        rank: "七品-九品",
        descTemplate: "Translator and scribe.",
        instructionTemplate: "You are a Bitieshi (笔帖式). You translate Manchu and Han documents. You speak formally and precisely."
    },
    {
        title: "Office Manager",
        chineseTitle: "司务",
        rank: "从九品",
        descTemplate: "Internal affairs and logistics.",
        instructionTemplate: "You are a Siwu (司务). You manage the office supplies and archives. You are humble."
    },
    {
        title: "Commissioner",
        chineseTitle: "大使/库使",
        rank: "未入流",
        descTemplate: "Warehouse or specific facility keeper.",
        instructionTemplate: "You are a Low-ranking Official (大使/库使). You guard the warehouse or facility. You care only about inventory and safety."
    }
];

// We use a slightly flatter structure for the actual export to ensure better UX in sidebar
// Revised Factory that creates a cleaner 2-3 level depth for UX:
// Minister
//  - Left Shilang -> [Langzhong -> [Zhushi]]
//  - Right Shilang -> [Yuanwailang -> [Bitieshi]]
//  - Siwu (Direct report for logistics)
//  - Dashi (Direct report for warehouse)
const generatePlayableHierarchy = (
    ministryType: MinistryType, 
    ministerName: string, 
    chineseTitle: string,
    desc: string,
    persona: string,
    color: string,
    instruction: string
): Minister => {
    const head: Minister = {
        id: `${ministryType}_HEAD`,
        ministryId: ministryType,
        name: ministerName,
        title: "Minister",
        chineseTitle: chineseTitle,
        rank: "从一品",
        description: desc,
        personality: persona,
        avatarColor: color,
        systemInstruction: instruction,
        subordinates: []
    };

    const createSub = (def: RoleDef, parentName: string, idSuffix: string): Minister => ({
        id: `${ministryType}_${idSuffix}`,
        ministryId: ministryType,
        name: `${def.title} of ${parentName}`,
        title: def.title,
        chineseTitle: def.chineseTitle,
        rank: def.rank,
        description: def.descTemplate,
        personality: "Loyal",
        avatarColor: color,
        systemInstruction: `${COMMON_INSTRUCTION} Ministry: ${chineseTitle}. You report to ${ministerName}. ${def.instructionTemplate}`,
        subordinates: []
    });

    // 1. Left Vice Minister (Holds Langzhong and Zhushi)
    const leftShilang = createSub(SUB_ROLES[0], ministerName, 'LEFT_SHILANG');
    
    const langzhong = createSub(SUB_ROLES[2], "Left Vice Minister", 'LANGZHONG');
    const zhushi = createSub(SUB_ROLES[4], "Bureau Director", 'ZHUSHI');
    langzhong.subordinates?.push(zhushi);
    
    leftShilang.subordinates?.push(langzhong);
    head.subordinates?.push(leftShilang);

    // 2. Right Vice Minister (Holds Yuanwailang and Bitieshi)
    const rightShilang = createSub(SUB_ROLES[1], ministerName, 'RIGHT_SHILANG');
    
    const yuanwailang = createSub(SUB_ROLES[3], "Right Vice Minister", 'YUANWAILANG');
    const bitieshi = createSub(SUB_ROLES[5], "Vice Director", 'BITIESHI');
    yuanwailang.subordinates?.push(bitieshi);

    rightShilang.subordinates?.push(yuanwailang);
    head.subordinates?.push(rightShilang);

    // 3. Support Staff (Direct reports for simplicity in finding them)
    const siwu = createSub(SUB_ROLES[6], ministerName, 'SIWU');
    const dashi = createSub(SUB_ROLES[7], ministerName, 'DASHI');
    
    head.subordinates?.push(siwu);
    head.subordinates?.push(dashi);

    return head;
};

export const MINISTERS: Minister[] = [
  generatePlayableHierarchy(
      MinistryType.PERSONNEL, "Minister Wang", "吏部尚书", 
      "Appointments, promotions, meritocracy.", 
      "Strict, observant.", "bg-[#4a3b52]", 
      `${COMMON_INSTRUCTION} You are the Minister of Personnel (吏部尚书). You manage the civil service.`
  ),
  generatePlayableHierarchy(
      MinistryType.REVENUE, "Minister Chen", "户部尚书", 
      "Finances, taxes, census, land.", 
      "Frugal, anxious.", "bg-[#855a28]", 
      `${COMMON_INSTRUCTION} You are the Minister of Revenue (户部尚书). You manage the treasury.`
  ),
  generatePlayableHierarchy(
      MinistryType.RITES, "Minister Zhou", "礼部尚书", 
      "Ceremonies, rituals, diplomacy.", 
      "Traditional, rigid.", "bg-[#2d4f3c]", 
      `${COMMON_INSTRUCTION} You are the Minister of Rites (礼部尚书). You ensure proper etiquette.`
  ),
  generatePlayableHierarchy(
      MinistryType.WAR, "General Zhao", "兵部尚书", 
      "Military appointments, strategy.", 
      "Direct, aggressive.", "bg-[#7f1d1d]", 
      `${COMMON_INSTRUCTION} You are the Minister of War (兵部尚书). You defend the realm.`
  ),
  generatePlayableHierarchy(
      MinistryType.JUSTICE, "Minister Sun", "刑部尚书", 
      "Penal system, laws.", 
      "Cold, impartial.", "bg-[#3f3f46]", 
      `${COMMON_INSTRUCTION} You are the Minister of Justice (刑部尚书). You uphold the code.`
  ),
  generatePlayableHierarchy(
      MinistryType.WORKS, "Minister Lu", "工部尚书", 
      "Infrastructure, construction.", 
      "Practical, hardworking.", "bg-[#9a5426]", 
      `${COMMON_INSTRUCTION} You are the Minister of Works (工部尚书). You build the empire.`
  ),
];
