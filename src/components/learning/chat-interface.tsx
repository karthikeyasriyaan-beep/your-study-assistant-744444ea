import React, { useMemo, useState, useEffect, useRef } from "react";
import { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  Info,
  Maximize2,
  Minimize2,
  Compass,
  CornerDownLeft,
  ImagePlus,
  X as XIcon
} from "lucide-react";
import { extractTextFromFiles } from "@/lib/learning.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Notebook } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";

// ==========================================
// --- Part 1: Type Interfaces ---
// ==========================================

interface ActiveTopic {
  classLevel: string;
  subject: string;
  chapterTitle: string;
  timestamp: string;
}

interface JEEQuestion {
  id: string;
  questionText: string;
  correctAnswer: number;
  subject: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  explanation: string;
}

interface ChatInterfaceProps {
  notebook: Notebook;
}

// LocalStorage Keys matching systems spec
const ACTIVE_TOPIC_KEY = "trackora:active-focus-topic";
const LANG_PREF_KEY = "trackora:language-preference";
const SESSION_DB_KEY = "trackora:study-sessions:v1";

export function ChatInterface({ notebook }: ChatInterfaceProps) {
  // --- Stateful Themes & System Settings ---
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const { language, setLanguage, t } = useI18n();
  const [activeTopic, setActiveTopic] = useState<ActiveTopic | null>(null);
  const [isTestLocked, setIsTestLocked] = useState<boolean>(false);
  const [isFullscreenMode, setIsFullscreenMode] = useState<boolean>(false);

  // --- JEE/NEET Practice Question Engine States ---
  const [practiceQuestions, setPracticeQuestions] = useState<JEEQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);

  // --- Custom Lightweight Stream Chat Engine States ---
  const [messages, setMessages] = useState<UIMessage[]>(notebook.messages || []);
  const [status, setStatus] = useState<"idle" | "submitted" | "streaming">("idle");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedImages, setAttachedImages] = useState<{ name: string; dataUrl: string }[]>([]);
  const [isExtractingImage, setIsExtractingImage] = useState(false);

  // ==========================================
  // --- Part 2: Reactive State Observers ---
  // ==========================================

  // Synchronized Storage Hydration (Hydrates topics and locks instantly)
  const hydrateStates = () => {
    try {
      const storedTopic = window.localStorage.getItem(ACTIVE_TOPIC_KEY);
      if (storedTopic) {
        setActiveTopic(JSON.parse(storedTopic));
      } else {
        setActiveTopic(null);
      }

      const storedSessions = window.localStorage.getItem(SESSION_DB_KEY);
      if (storedSessions) {
        const activeLock = window.localStorage.getItem("trackora:timer-active");
        setIsTestLocked(activeLock === "true");
      }
    } catch (e) {
      console.warn("Storage sync hydration issue: ", e);
    }
  };

  useEffect(() => {
    hydrateStates();

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === ACTIVE_TOPIC_KEY ||
        e.key === "trackora:timer-active"
      ) {
        hydrateStates();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    const syncInterval = setInterval(hydrateStates, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(syncInterval);
    };
  }, []);

  const handleLanguageChange = (lang: "english" | "hindi") => {
    setLanguage(lang);
  };

  // ==========================================
  // --- Part 3: Stream-Based Chat Handler ---
  // ==========================================

  const groundingContext = useMemo(() => {
    const topicGrounding = activeTopic 
      ? `[ACTIVE SYLLABUS TARGET: Class ${activeTopic.classLevel} - ${activeTopic.subject} - Chapter: ${activeTopic.chapterTitle}]`
      : "[NO ACTIVE TOPIC TARGET SELECTED BY STUDENT]";
    
    return `${topicGrounding}\n\nNotebook Base:\n${notebook.extractedText || "(No notebook material)"}`;
  }, [notebook.extractedText, activeTopic]);

  const busy = status === "streaming" || status === "submitted" || isGeneratingQuestions;

  // Auto-Scroll message window safely
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, practiceQuestions, status]);

  const handleSendMessage = async (text: string) => {
    const userMsg: UIMessage = {
      id: "msg-" + crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text }]
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setStatus("submitted");

    // Prepare receiver message in stream state
    const assistantMsgId = "msg-" + crypto.randomUUID();
    const assistantMsg: UIMessage = {
      id: assistantMsgId,
      role: "assistant",
      parts: [{ type: "text", text: "" }]
    };

    setMessages(prev => [...prev, assistantMsg]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          context: groundingContext,
          language
        })
      });

      if (!response.ok) {
        throw new Error("Failed to secure connection stream with learning tutor.");
      }

      setStatus("streaming");

      // Custom browser-native stream reader processing chunks reactively
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedResponseText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          streamedResponseText += chunk;

          // Update active assistant message state reactively
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMsgId 
                ? { ...msg, parts: [{ type: "text", text: streamedResponseText }] }
                : msg
            )
          );
        }
      }
    } catch (err) {
      console.error("Stream reader error: ", err);
      toast.error("Connecting to study partner failed. Please check your network connection.");
      // Graceful error fallback state text injection
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMsgId 
            ? { ...msg, parts: [{ type: "text", text: "Something went wrong while connecting to the stream. Please try again." }] }
            : msg
        )
      );
    } finally {
      setStatus("idle");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if ((!text && attachedImages.length === 0) || busy) return;

    if (isTestLocked) {
      toast.error("Input Locked: Please finish your active exam simulation before accessing study chat.");
      return;
    }

    const finalText = text || "Please help me understand my attached notebook page.";
    setInput("");
    setAttachedImages([]);
    handleSendMessage(finalText);
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setIsExtractingImage(true);
    try {
      const prepared = await Promise.all(
        files.slice(0, 3).map(async (f) => ({
          name: f.name,
          mimeType: f.type || "image/jpeg",
          dataUrl: await fileToDataUrl(f),
        })),
      );

      setAttachedImages((prev) => [
        ...prev,
        ...prepared.map((p) => ({ name: p.name, dataUrl: p.dataUrl })),
      ]);

      const result = await extractTextFromFiles({ data: { files: prepared } });
      const extracted = result.text?.trim();
      if (extracted) {
        setInput((prev) =>
          prev
            ? `${prev}\n\n[Notebook image text]\n${extracted}`
            : `Here is my notebook page:\n${extracted}\n\nPlease explain and help me.`,
        );
        toast.success("Notebook image read — text added to your message.");
      } else {
        toast.message("Image attached, but no text could be extracted.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not read that image. Please try again.");
    } finally {
      setIsExtractingImage(false);
    }
  };

  const removeAttachedImage = (idx: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // ==========================================
  // --- Part 4: Interactive Question Generator ---
  // ==========================================

  const handleGenerateQuestions = async () => {
    if (!activeTopic) {
      toast.error("Please select a textbook chapter or set an Active Focus Topic first to generate target questions.");
      return;
    }

    setIsGeneratingQuestions(true);
    setPracticeQuestions([]);
    setUserAnswers({});
    setSubmittedQuestions({});

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { 
              role: "user", 
              parts: [{ type: "text", text: "Generate 5 integer-answer numeric questions in JEE/NEET style on our active syllabus topic. Respond inside a structured JSON payload matching the requested exam scheme." }]
            }
          ],
          context: `Active Subject: ${activeTopic.subject}, Active Chapter: ${activeTopic.chapterTitle}, Target Class: ${activeTopic.classLevel}`,
          language: "english"
        })
      });

      if (!response.ok) throw new Error("API stream connection error during question synthesis.");

      const responseData = await response.json();
      
      if (responseData && responseData.questions) {
        setPracticeQuestions(responseData.questions);
        toast.success(`Successfully synthesized 5 numeric practice problems for ${activeTopic.chapterTitle}!`);
      } else {
        generateLocalMocksFallback();
      }
    } catch (err) {
      console.warn("Generating fallbacks due to endpoint parsing limits:", err);
      generateLocalMocksFallback();
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const generateLocalMocksFallback = () => {
    const fallbackSubject = activeTopic?.subject || "Science";
    const fallbackTopicName = activeTopic?.chapterTitle || "Syllabus Dynamics";
    
    const mockSet: JEEQuestion[] = [
      {
        id: "mock-q1",
        questionText: `A particle executes periodic motion along the active plane of ${fallbackTopicName}. If the potential energy function is parameterized by U(x) = 4x^2 Joules, find the magnitude of restoring force acting on the particle in Newtons at displacement coordinate x = 2 meters.`,
        correctAnswer: 16,
        subject: fallbackSubject,
        topic: fallbackTopicName,
        difficulty: "Medium",
        explanation: "Force is computed by the negative gradient of potential: F = -dU/dx. d/dx(4x^2) = 8x. At x = 2, Force magnitude is 8 * 2 = 16 Newtons."
      },
      {
        id: "mock-q2",
        questionText: `For a chemical balance reaction evaluated under ${fallbackTopicName}, the stoichiometric ratio of reactants A to products B is 1:3. If we completely consume 12 moles of reactant A, determine the precise moles of product B produced.`,
        correctAnswer: 36,
        subject: fallbackSubject,
        topic: fallbackTopicName,
        difficulty: "Easy",
        explanation: "Since the ratio is 1:3, consuming 12 moles of reactant A yields exactly 12 * 3 = 36 moles of B."
      },
      {
        id: "mock-q3",
        questionText: "A light beam transitions across two refractive index layers. Layer 1 has refractive index n1 = 1.0, and Layer 2 has refractive index n2 = 1.5. If the wavelength in Layer 1 is 600 nm, compute the wavelength of the light beam when traveling through Layer 2 in nanometers and divide by 100. (Express final integer answer only)",
        correctAnswer: 4,
        subject: fallbackSubject,
        topic: fallbackTopicName,
        difficulty: "Hard",
        explanation: "Wavelength in medium is given by lambda_medium = lambda_vacuum / n2. Hence wavelength is 600 / 1.5 = 400 nm. Dividing by 100 gives exactly 4."
      },
      {
        id: "mock-q4",
        questionText: "Compute the number of real roots that exist for the quadratic equation parameters: 3x^2 - 12x + 12 = 0.",
        correctAnswer: 1,
        subject: fallbackSubject,
        topic: fallbackTopicName,
        difficulty: "Easy",
        explanation: "Discriminant D = b^2 - 4ac = (-12)^2 - 4(3)(12) = 144 - 144 = 0. Since D = 0, exactly 1 unique real root exists."
      },
      {
        id: "mock-q5",
        questionText: `Calculate the net work done in Joules during a cyclic thermodynamic transition representing 2 complete cycles of ${fallbackTopicName}, if the area bounded inside a single path curve equals exactly 15 Joules.`,
        correctAnswer: 30,
        subject: fallbackSubject,
        topic: fallbackTopicName,
        difficulty: "Medium",
        explanation: "For a cyclic process, net work done equals the total area enclosed. For 2 complete cycles: Work = 2 * 15 = 30 Joules."
      }
    ];

    setPracticeQuestions(mockSet);
    toast.success(`Generated optimized numeric mock questions for ${fallbackTopicName}!`);
  };

  const handleAnswerChange = (qId: string, val: string) => {
    setUserAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmitAnswer = (qId: string, correctAnswer: number) => {
    const userVal = parseInt(userAnswers[qId]?.trim() || "");
    if (isNaN(userVal)) {
      toast.error("Please input a valid integer answer.");
      return;
    }
    setSubmittedQuestions(prev => ({ ...prev, [qId]: true }));
  };

  const handleResetPractice = () => {
    setPracticeQuestions([]);
    setUserAnswers({});
    setSubmittedQuestions({});
  };

  // ==========================================
  // --- Part 5: Component View Render ---
  // ==========================================

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between text-foreground selection:bg-primary/30 selection:text-foreground overflow-hidden">

      {/* --- Part 5A: Top Elegant Global Panel Header --- */}
      <header className="relative z-10 border-b border-white/[0.06] px-4 sm:px-8 py-4 backdrop-blur-xl flex justify-between items-center gap-4 bg-background/40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-primary border border-white/10 grid place-items-center text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-inset ring-white/10">
            <Compass className="h-4 w-4 stroke-[1.5]" />
          </div>
          <div className="min-w-0">
            <div className="font-ui text-[10px] uppercase tracking-[0.28em] text-primary/80">
              {t("tutor.eyebrow")}
            </div>
            <h1 className="mt-0.5 truncate font-display text-lg sm:text-xl leading-none">
              {t("tutor.title")}
            </h1>
          </div>
        </div>

        {/* Premium Control Toggles Suite */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Elegant language preference switcher */}
          <div className="flex p-1 bg-background/60 border border-white/[0.08] rounded-full font-ui text-[10px] uppercase tracking-[0.18em]">
            {(["english", "hindi"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => handleLanguageChange(l)}
                className={`rounded-full px-3.5 py-1.5 font-semibold transition-all duration-300 ${
                  language === l
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Fullscreen focus expander */}
          <button
            onClick={() => setIsFullscreenMode(!isFullscreenMode)}
            className="grid h-9 w-9 place-items-center rounded-full bg-background/50 border border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all duration-300"
            title="Toggle Focused Screen Layout"
          >
            {isFullscreenMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </header>

      {/* --- Part 5B: Main Workspace Platform --- */}
      <main className={`relative z-10 flex-1 w-full mx-auto px-4 py-6 flex flex-col justify-between space-y-6 overflow-hidden transition-all duration-500 ${
        isFullscreenMode ? "max-w-full lg:px-12" : "max-w-5xl"
      } h-[calc(100vh-8rem)]`}>
        
        {/* Active Focus Context Micro Banner — only shown when a topic is active */}
        {activeTopic && (
          <section className="rounded-lg border p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-500 ease-in-out bg-white/[0.02] border-white/10 text-white">
            <div className="flex items-center gap-3 text-xs tracking-wide">
              <BookOpen className="h-4 w-4 shrink-0 stroke-[1.5] text-zinc-300" />
              <div className="font-mono">
                {t("tutor.grounding")}: <span className="font-bold underline uppercase tracking-wider text-white">{activeTopic.subject}</span> &mdash; <span className="text-zinc-300">{activeTopic.chapterTitle}</span>
              </div>
            </div>

            <button
              onClick={handleGenerateQuestions}
              disabled={isGeneratingQuestions}
              className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-[10px] uppercase tracking-[0.2em] rounded transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.98]"
            >
              {isGeneratingQuestions ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("tutor.synthesizing")}
                </>
              ) : (
                <>
                  <HelpCircle className="h-3.5 w-3.5" /> {t("tutor.generateMock")}
                </>
              )}
            </button>
          </section>
        )}

        {/* --- Unified Interactive Conversation Console --- */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto rounded-xl border border-white/5 p-6 space-y-6 bg-black/40 backdrop-blur-md relative shadow-2xl shadow-black/80 custom-scrollbar"
        >
          {/* Active Exam Lock Warning */}
          {isTestLocked && (
            <div className="bg-white/[0.02] border border-white/20 text-white p-4 rounded-md flex items-start gap-3 text-xs animate-pulse font-mono">
              <AlertTriangle className="h-4 w-4 shrink-0 text-white mt-0.5" />
              <div>
                <strong className="tracking-widest uppercase">ENDUR TIMER RUNNING</strong>
                <p className="text-zinc-400 mt-1">Classroom restrictions active. Input fields locked to verify environment integrity.</p>
              </div>
            </div>
          )}

          {/* Practice Panel */}
          {practiceQuestions.length > 0 && (
            <div className="bg-black/80 border border-white/10 p-6 rounded-lg space-y-6 animate-fade-in-up">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 stroke-[1.5]" />
                  INTEG MOCK RUN &mdash; {activeTopic?.chapterTitle}
                </span>
                <button
                  onClick={handleResetPractice}
                  className="text-[10px] text-zinc-400 hover:text-white transition-colors duration-300 uppercase tracking-widest font-mono"
                >
                  [ CLEAR PRACTICE ]
                </button>
              </div>

              <div className="space-y-6">
                {practiceQuestions.map((q, idx) => {
                  const isSubmitted = submittedQuestions[q.id];
                  const answerVal = userAnswers[q.id] || "";
                  const isCorrect = isSubmitted && parseInt(answerVal.trim()) === q.correctAnswer;

                  return (
                    <div key={q.id} className="p-5 rounded border border-white/5 bg-zinc-950/50 space-y-3 transition-all duration-300 hover:border-white/20">
                      <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase text-zinc-500">
                        <span>PROBLEM 0{idx + 1} ({q.difficulty})</span>
                        <span className="font-semibold text-zinc-400">{q.subject}</span>
                      </div>
                      <p className="text-xs font-medium text-zinc-200 leading-relaxed font-sans">{q.questionText}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <input
                          type="number"
                          placeholder="Integer value (e.g. 15)"
                          value={answerVal}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          disabled={isSubmitted}
                          className="bg-black border border-white/10 rounded px-3 py-1.5 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-white text-white placeholder-zinc-700 font-mono"
                        />
                        
                        {!isSubmitted ? (
                          <button
                            onClick={() => handleSubmitAnswer(q.id, q.correctAnswer)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold px-4 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all duration-300"
                          >
                            SUBMIT ANSWER
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-bold font-mono">
                            {isCorrect ? (
                              <span className="text-white flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4" /> CORRECT (Ans: {q.correctAnswer})
                              </span>
                            ) : (
                              <span className="text-zinc-400 flex items-center gap-1.5">
                                <XCircle className="h-4 w-4" /> INCORRECT (YOURS: {answerVal} | CORRECT: {q.correctAnswer})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {isSubmitted && (
                        <div className="bg-black/60 p-4 rounded text-xs text-zinc-400 mt-2 border-l border-white leading-relaxed font-mono">
                          <strong className="text-white uppercase tracking-wider">Solution Strategy:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.length === 0 && practiceQuestions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center space-y-6 py-24">
              <div
                aria-hidden
                className="h-16 w-16 rounded-[14px] rotate-45 bg-[conic-gradient(from_180deg,#4285F4,#9B72CB,#D96570,#F5B33C,#4285F4)] shadow-[0_0_60px_-10px_rgba(155,114,203,0.6)]"
              />
              <div className="space-y-2 max-w-md">
                <h2 className="font-display text-3xl sm:text-4xl bg-gradient-to-r from-blue-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent leading-tight">
                  Hi, let's get started
                </h2>
                <p className="text-sm text-muted-foreground">
                  Ask any doubt, get full explanations, or ask how to use anything in the app.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => {
                const isUser = m.role === "user";
                const textContent = m.parts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("");

                if (isUser) {
                  return (
                    <div key={m.id} className="flex justify-end animate-fade-in">
                      <div className="max-w-[85%] rounded-3xl rounded-tr-md bg-white/[0.07] border border-white/10 px-4 py-2.5 text-sm text-zinc-100 whitespace-pre-wrap font-sans">
                        {textContent}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={m.id} className="animate-fade-in">
                    <div className="text-[15px] leading-relaxed text-zinc-100 font-sans prose prose-invert max-w-none prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold prose-h2:text-xl prose-h3:text-base prose-strong:text-white prose-a:text-blue-400 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-code:text-amber-300 prose-code:before:content-none prose-code:after:content-none prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeRaw, rehypeKatex]}
                      >
                        {textContent || (busy ? "…" : "")}
                      </ReactMarkdown>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Thinking process indicator */}
          {busy && !isGeneratingQuestions && status !== "streaming" && (
            <div className="flex items-center gap-2 text-sm text-zinc-400 animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Thinking…</span>
            </div>
          )}
        </div>

        {/* --- Part 5C: Luxury Chat Input Dock --- */}
        <form onSubmit={handleSubmit} className="relative max-w-3xl w-full mx-auto space-y-2">
          {attachedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1">
              {attachedImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-16 w-16 rounded-md overflow-hidden border border-white/10 bg-black/60"
                >
                  <img
                    src={img.dataUrl}
                    alt={img.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttachedImage(idx)}
                    className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/70 text-white grid place-items-center hover:bg-black"
                    aria-label="Remove image"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {isExtractingImage && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  <Loader2 className="h-3 w-3 animate-spin" /> Reading image…
                </div>
              )}
            </div>
          )}

          <div className="relative flex items-center bg-[#09090b]/90 border border-white/10 rounded-lg focus-within:border-white/30 transition-all duration-500 p-2 shadow-2xl shadow-black/95">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelected}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy || isTestLocked || isExtractingImage}
              title="Attach notebook image"
              className="grid h-9 w-9 shrink-0 place-items-center rounded bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.08] transition disabled:opacity-40"
            >
              {isExtractingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
            </button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isTestLocked
                  ? t("tutor.placeholder.locked")
                  : t("tutor.placeholder")
              }
              disabled={busy || isTestLocked}
              className="bg-transparent border-none text-xs sm:text-sm text-white focus-visible:ring-0 shadow-none px-3 flex-1 h-10 placeholder-zinc-600 font-sans tracking-wide"
            />
            
            <div className="flex items-center gap-2 pr-2">
              {input.trim() && !busy && (
                <span className="hidden sm:inline text-[9px] font-mono text-zinc-600 tracking-wider">
                  PRESS ENTER <CornerDownLeft className="h-2.5 w-2.5 inline ml-0.5" />
                </span>
              )}
              <Button 
                type="submit" 
                disabled={busy || isTestLocked || (!input.trim() && attachedImages.length === 0)}
                className="rounded h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shrink-0 transition-transform active:scale-95"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
