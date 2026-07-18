import { useEffect, type ReactNode } from "react";

// Light-mode only. Dark-mode toggle removed by user request.
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    root.dataset.theme = "light";
    try {
      window.localStorage.setItem("trackora:theme", "light");
    } catch {}
  }, []);
  return <>{children}</>;
}

export function useTheme() {
  return {
    theme: "light" as const,
    toggle: () => {},
    setTheme: (_: "light" | "dark") => {},
  };
}
