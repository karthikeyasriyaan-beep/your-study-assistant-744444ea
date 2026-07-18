import type { UIMessage } from "ai";
import type { Summary, Assessment } from "./learning.functions";

export type Workspace = {
  id: string;
  sourceName: string;
  createdAt: number;
  extractedText: string;
  summary: Summary;
  assessment?: Assessment;
};

export type Notebook = {
  id: string;
  name: string;
  createdAt: number;
  /** Aggregated raw text from all uploads (used for chat context). */
  extractedText: string;
  /** Legacy single-summary (kept for back-compat with older saves). */
  summary?: Summary;
  /** Legacy single-assessment. */
  assessment?: Assessment;
  /** Per-upload structured workspace cards shown inline in chat. */
  workspaces: Workspace[];
  messages: UIMessage[];
};

const KEY = "intelligent-learning:notebook:v2";

export function loadNotebook(): Notebook | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const nb = JSON.parse(raw) as Notebook;
    if (!Array.isArray(nb.workspaces)) nb.workspaces = [];
    if (!Array.isArray(nb.messages)) nb.messages = [];
    return nb;
  } catch {
    return null;
  }
}

export function saveNotebook(nb: Notebook | null) {
  if (typeof window === "undefined") return;
  if (!nb) window.localStorage.removeItem(KEY);
  else window.localStorage.setItem(KEY, JSON.stringify(nb));
}

export function newNotebook(name = "My Notebook"): Notebook {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now(),
    extractedText: "",
    workspaces: [],
    messages: [],
  };
}

export const WORKSPACE_SENTINEL = "__WORKSPACE__:";
export function workspaceMessageText(id: string) {
  return WORKSPACE_SENTINEL + id;
}
export function parseWorkspaceId(text: string): string | null {
  return text.startsWith(WORKSPACE_SENTINEL)
    ? text.slice(WORKSPACE_SENTINEL.length)
    : null;
}
