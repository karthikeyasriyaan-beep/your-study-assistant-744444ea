import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type PerfMode = "full" | "lite";
const KEY = "trackora:perf-mode";

type Ctx = {
  mode: PerfMode;
  setMode: (m: PerfMode) => void;
  hasChosen: boolean;
  markChosen: () => void;
};

const PerfCtx = createContext<Ctx>({
  mode: "full",
  setMode: () => {},
  hasChosen: false,
  markChosen: () => {},
});

export function PerfProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<PerfMode>("full");
  const [hasChosen, setHasChosen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw === "lite" || raw === "full") {
        setModeState(raw);
        setHasChosen(true);
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("perf-lite", mode === "lite");
  }, [mode, ready]);

  const setMode = (m: PerfMode) => {
    setModeState(m);
    try {
      window.localStorage.setItem(KEY, m);
    } catch {}
    setHasChosen(true);
  };

  const markChosen = () => setHasChosen(true);

  return (
    <PerfCtx.Provider value={{ mode, setMode, hasChosen, markChosen }}>
      {children}
    </PerfCtx.Provider>
  );
}

export function usePerf() {
  return useContext(PerfCtx);
}

/** Measures average FPS over ~800ms. Returns fps as a number. */
export function measureFps(durationMs = 800): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof requestAnimationFrame === "undefined") {
      resolve(60);
      return;
    }
    let frames = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      frames++;
      if (t - start < durationMs) {
        requestAnimationFrame(tick);
      } else {
        const fps = (frames * 1000) / (t - start);
        resolve(fps);
      }
    };
    requestAnimationFrame(tick);
  });
}
