import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ShieldCheck } from "lucide-react";
import { EXAM_SYLLABI, getSyllabus } from "@/lib/exam-syllabus";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/management/planner")({
  component: PlannerPage,
  ssr: false,
});

const STORAGE_KEY = "planner:v1";
const BUFFER_RATIO = 0.15;
const MS_PER_DAY = 86_400_000;

type Plan = {
  examId: string;
  deadline: string; // yyyy-mm-dd
  startedAt: string;
  weeks: { label: string; range: string; chapters: string[]; revision: boolean }[];
  checks: Record<string, boolean>;
};

function loadPlan(): Plan | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}
function savePlan(p: Plan | null) {
  if (typeof window === "undefined") return;
  if (!p) window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function buildPlan(examId: string, deadline: string): Plan | null {
  const syllabus = getSyllabus(examId);
  if (!syllabus) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);
  const totalDays = Math.max(7, Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY));
  const totalWeeks = Math.max(2, Math.ceil(totalDays / 7));
  const bufferWeeks = Math.max(1, Math.round(totalWeeks * BUFFER_RATIO));
  const studyWeeks = totalWeeks - bufferWeeks;

  const chaptersPerWeek = Math.ceil(syllabus.chapters.length / studyWeeks);

  const weeks: Plan["weeks"] = [];
  for (let w = 0; w < totalWeeks; w++) {
    const wkStart = new Date(start.getTime() + w * 7 * MS_PER_DAY);
    const wkEnd = new Date(
      Math.min(end.getTime(), wkStart.getTime() + 6 * MS_PER_DAY),
    );
    const range = `${fmt(wkStart)} – ${fmt(wkEnd)}`;
    if (w < studyWeeks) {
      const slice = syllabus.chapters.slice(
        w * chaptersPerWeek,
        (w + 1) * chaptersPerWeek,
      );
      weeks.push({
        label: `Week ${w + 1}`,
        range,
        chapters: slice,
        revision: false,
      });
    } else {
      weeks.push({
        label: `Revision ${w - studyWeeks + 1}`,
        range,
        chapters: [],
        revision: true,
      });
    }
  }

  return {
    examId,
    deadline,
    startedAt: start.toISOString(),
    weeks,
    checks: {},
  };
}

function fmt(d: Date) {
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function PlannerPage() {
  const [examId, setExamId] = useState(EXAM_SYLLABI[0].id);
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().slice(0, 10);
  });
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const p = loadPlan();
    if (p) {
      setPlan(p);
      setExamId(p.examId);
      setDeadline(p.deadline);
    }
  }, []);

  const stats = useMemo(() => {
    if (!plan) return null;
    const total = plan.weeks.reduce((n, w) => n + w.chapters.length, 0);
    const done = Object.values(plan.checks).filter(Boolean).length;
    const bufferWeeks = plan.weeks.filter((w) => w.revision).length;
    return { total, done, bufferWeeks, totalWeeks: plan.weeks.length };
  }, [plan]);

  const create = () => {
    const p = buildPlan(examId, deadline);
    if (!p) return;
    setPlan(p);
    savePlan(p);
  };

  const toggle = (key: string) => {
    if (!plan) return;
    const next = {
      ...plan,
      checks: { ...plan.checks, [key]: !plan.checks[key] },
    };
    setPlan(next);
    savePlan(next);
  };

  const reset = () => {
    savePlan(null);
    setPlan(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <Label className="text-xs">Target exam</Label>
            <select
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              disabled={!!plan}
            >
              {EXAM_SYLLABI.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs">Deadline</Label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={!!plan}
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>
          {plan ? (
            <Button variant="outline" onClick={reset}>
              Reset plan
            </Button>
          ) : (
            <Button onClick={create}>
              <CalendarClock className="mr-2 h-4 w-4" /> Build plan
            </Button>
          )}
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Buffer rule: the last <strong>{Math.round(BUFFER_RATIO * 100)}%</strong>{" "}
          of your timeline is reserved for revision — no new chapters are
          scheduled there.
        </p>
      </div>

      {plan && stats && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat
              label="Chapters scheduled"
              value={`${stats.done} / ${stats.total}`}
            />
            <Stat label="Total weeks" value={stats.totalWeeks} />
            <Stat
              label="Revision weeks"
              value={stats.bufferWeeks}
              tone="primary"
            />
          </div>

          <div className="space-y-3">
            {plan.weeks.map((w, wi) => (
              <div
                key={wi}
                className={`rounded-xl border p-4 ${
                  w.revision
                    ? "border-primary/40 bg-primary/5"
                    : "bg-card"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{w.label}</h3>
                  <Badge variant="outline" className="text-[10px]">
                    {w.range}
                  </Badge>
                  {w.revision && (
                    <Badge className="text-[10px]">Revision buffer</Badge>
                  )}
                </div>
                {w.revision ? (
                  <p className="text-xs text-muted-foreground">
                    Reserved for revision, mock tests, weak-topic recall. No new
                    chapters here.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {w.chapters.map((ch) => {
                      const key = `${wi}::${ch}`;
                      const done = plan.checks[key];
                      return (
                        <li key={key} className="flex items-start gap-2">
                          <Checkbox
                            checked={done}
                            onCheckedChange={() => toggle(key)}
                            className="mt-0.5"
                          />
                          <span
                            className={`text-sm ${done ? "text-muted-foreground line-through" : ""}`}
                          >
                            {ch}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "primary";
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${tone === "primary" ? "border-primary/30 bg-primary/5" : "bg-card"}`}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
