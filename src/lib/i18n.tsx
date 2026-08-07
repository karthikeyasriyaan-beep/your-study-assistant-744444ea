import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "english" | "hindi";
const KEY = "trackora:language-preference";

type Dict = Record<string, string>;

const en: Dict = {
  // Nav
  "nav.home": "Home",
  "nav.tutor": "AI Tutor",
  "nav.books": "Books",
  "nav.videos": "Videos",
  "nav.practice": "Practice",
  "nav.focus": "Focus",
  "nav.home.desc": "Your daily dashboard",
  "nav.tutor.desc": "Chat & scan notes",
  "nav.books.desc": "Textbooks & videos",
  "nav.videos.desc": "Vedantu & Physics Wallah",
  "nav.practice.desc": "Flashcards & quiz",
  "nav.focus.desc": "Planner & timer",

  // Common
  "common.language": "Language",
  "common.theme.light": "Light mode",
  "common.theme.dark": "Dark mode",
  "common.lite": "Lite mode",
  "common.full": "Full mode",
  "common.loading": "Loading…",
  "common.english": "english",
  "common.hindi": "hindi",

  // Dashboard
  "dash.greet.late": "Studying late",
  "dash.greet.morning": "Good morning",
  "dash.greet.afternoon": "Good afternoon",
  "dash.greet.evening": "Good evening",
  "dash.tagline": "Let's learn something today.",
  "dash.startHere": "Start here",
  "dash.pickChapter": "Pick a chapter to focus",
  "dash.tutorTimerSync": "Tutor, timer & quiz sync to it",
  "dash.activeFocus": "Active focus",
  "dash.startTimer": "Start timer",
  "dash.quickQuiz": "Quick quiz",
  "dash.jumpBack": "Jump back in",
  "dash.chatAI": "Chat AI",
  "dash.chatAI.desc": "Hints on active topic",
  "dash.deepFocus": "Deep focus",
  "dash.deepFocus.desc": "3-hour exam mode",
  "dash.vault": "Vault",
  "dash.vault.desc": "Textbooks & videos",
  "dash.insights": "Insights",
  "dash.insights.desc": "Focus & discipline",
  "dash.thisWeek": "This week",
  "dash.sessions": "Sessions",
  "dash.focused": "Focused",
  "dash.tabSwitches": "Tab switches",
  "dash.cleanRuns": "Clean runs",
  "dash.recentRuns": "Recent runs",

  // Tutor
  "tutor.eyebrow": "Intelligent Learning",
  "tutor.title": "AI Tutor",
  "tutor.ready": "Ready when you are.",
  "tutor.readyDesc": "Syllabus grounding engine online — ask a derivation, concept, or numerical.",
  "tutor.placeholder": "Request derivations, textbook evaluations, or curriculum inquiries...",
  "tutor.placeholder.locked": "SYSTEM ENCRYPTED: Active classroom simulation...",
  "tutor.generateMock": "GENERATE MOCK PRACTICE",
  "tutor.synthesizing": "SYNTHESIZING...",
  "tutor.awaiting": "Awaiting active textbook vault target parameters...",
  "tutor.grounding": "GROUNDING",
  "tutor.thinking": "Analyzing parameters...",

  // Materials
  "materials.title": "Materials Hub",
  "materials.subtitle": "Curated textbooks, chapters & videos.",

  // Practice
  "practice.title": "Productivity Packs",
  "practice.subtitle": "Flashcards & quizzes powered by SRS.",

  // Focus
  "focus.title": "Management Systems",
  "focus.subtitle": "Planner, timer & analytics.",
};

const hi: Dict = {
  // Nav
  "nav.home": "होम",
  "nav.tutor": "एआई ट्यूटर",
  "nav.books": "किताबें",
  "nav.videos": "वीडियो",
  "nav.practice": "अभ्यास",
  "nav.focus": "फोकस",
  "nav.home.desc": "आपका दैनिक डैशबोर्ड",
  "nav.tutor.desc": "चैट करें और नोट्स स्कैन करें",
  "nav.books.desc": "पाठ्यपुस्तकें और वीडियो",
  "nav.videos.desc": "वेदांतु और फिजिक्स वाला",
  "nav.practice.desc": "फ्लैशकार्ड और क्विज़",
  "nav.focus.desc": "योजनाकार और टाइमर",

  // Common
  "common.language": "भाषा",
  "common.theme.light": "लाइट मोड",
  "common.theme.dark": "डार्क मोड",
  "common.lite": "लाइट मोड",
  "common.full": "फुल मोड",
  "common.loading": "लोड हो रहा है…",
  "common.english": "अंग्रेज़ी",
  "common.hindi": "हिंदी",

  // Dashboard
  "dash.greet.late": "देर रात पढ़ाई",
  "dash.greet.morning": "सुप्रभात",
  "dash.greet.afternoon": "नमस्कार",
  "dash.greet.evening": "शुभ संध्या",
  "dash.tagline": "आज कुछ नया सीखते हैं।",
  "dash.startHere": "यहाँ से शुरू करें",
  "dash.pickChapter": "फ़ोकस के लिए एक अध्याय चुनें",
  "dash.tutorTimerSync": "ट्यूटर, टाइमर और क्विज़ इसी से जुड़ेंगे",
  "dash.activeFocus": "सक्रिय फ़ोकस",
  "dash.startTimer": "टाइमर शुरू करें",
  "dash.quickQuiz": "त्वरित क्विज़",
  "dash.jumpBack": "वापस जुड़ें",
  "dash.chatAI": "एआई चैट",
  "dash.chatAI.desc": "सक्रिय विषय पर संकेत",
  "dash.deepFocus": "गहरा फ़ोकस",
  "dash.deepFocus.desc": "3-घंटे परीक्षा मोड",
  "dash.vault": "संग्रह",
  "dash.vault.desc": "पाठ्यपुस्तकें और वीडियो",
  "dash.insights": "विश्लेषण",
  "dash.insights.desc": "फ़ोकस और अनुशासन",
  "dash.thisWeek": "इस सप्ताह",
  "dash.sessions": "सत्र",
  "dash.focused": "केंद्रित",
  "dash.tabSwitches": "टैब बदलाव",
  "dash.cleanRuns": "साफ़ सत्र",
  "dash.recentRuns": "हाल के सत्र",

  // Tutor
  "tutor.eyebrow": "बुद्धिमान अध्ययन",
  "tutor.title": "एआई ट्यूटर",
  "tutor.ready": "जब आप तैयार हों।",
  "tutor.readyDesc": "पाठ्यक्रम इंजन ऑनलाइन — व्युत्पत्ति, अवधारणा या संख्यात्मक प्रश्न पूछें।",
  "tutor.placeholder": "व्युत्पत्ति, पाठ्यपुस्तक मूल्यांकन या पाठ्यक्रम प्रश्न पूछें...",
  "tutor.placeholder.locked": "सिस्टम लॉक: सक्रिय कक्षा सत्र...",
  "tutor.generateMock": "मॉक अभ्यास बनाएँ",
  "tutor.synthesizing": "बना रहा है...",
  "tutor.awaiting": "सक्रिय पाठ्यपुस्तक लक्ष्य की प्रतीक्षा में...",
  "tutor.grounding": "आधार",
  "tutor.thinking": "विश्लेषण हो रहा है...",

  // Materials
  "materials.title": "सामग्री केंद्र",
  "materials.subtitle": "चयनित पाठ्यपुस्तकें, अध्याय और वीडियो।",

  // Practice
  "practice.title": "अभ्यास पैक",
  "practice.subtitle": "एसआरएस-आधारित फ्लैशकार्ड और क्विज़।",

  // Focus
  "focus.title": "प्रबंधन प्रणाली",
  "focus.subtitle": "योजनाकार, टाइमर और विश्लेषण।",
};

const DICTS: Record<Language, Dict> = { english: en, hindi: hi };

const Ctx = createContext<{
  language: Language;
  setLanguage: (l: Language) => void;
  toggle: () => void;
  t: (key: string) => string;
}>({
  language: "english",
  setLanguage: () => {},
  toggle: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<Language>("english");

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(KEY);
      if (v === "english" || v === "hindi") setLangState(v);
    } catch {}
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && (e.newValue === "english" || e.newValue === "hindi")) {
        setLangState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLanguage = (l: Language) => {
    setLangState(l);
    try {
      window.localStorage.setItem(KEY, l);
      // Notify same-tab listeners (chat-interface uses a poll fallback too)
      window.dispatchEvent(
        new StorageEvent("storage", { key: KEY, newValue: l }),
      );
    } catch {}
  };

  const toggle = () => setLanguage(language === "english" ? "hindi" : "english");

  const t = (key: string) => DICTS[language][key] ?? DICTS.english[key] ?? key;

  return <Ctx.Provider value={{ language, setLanguage, toggle, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}
