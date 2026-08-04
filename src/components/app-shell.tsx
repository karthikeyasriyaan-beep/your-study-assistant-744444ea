import { Link, useRouterState } from "@tanstack/react-router";
import {
  Brain,
  BookOpen,
  Layers,
  CalendarRange,
  GraduationCap,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Languages,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

type Quadrant = {
  to: string;
  labelKey: string;
  descKey: string;
  icon: typeof Brain;
};

export const QUADRANTS: Quadrant[] = [
  { to: "/dashboard", labelKey: "nav.home", descKey: "nav.home.desc", icon: LayoutDashboard },
  { to: "/", labelKey: "nav.tutor", descKey: "nav.tutor.desc", icon: Brain },
  { to: "/materials", labelKey: "nav.books", descKey: "nav.books.desc", icon: BookOpen },
  { to: "/productivity", labelKey: "nav.practice", descKey: "nav.practice.desc", icon: Layers },
  { to: "/management", labelKey: "nav.focus", descKey: "nav.focus.desc", icon: CalendarRange },
];

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(to + "/");
}

const SIDEBAR_KEY = "trackora:sidebar-open";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { language, toggle: toggleLang, t } = useI18n();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(SIDEBAR_KEY);
      if (v === "0") setOpen(false);
    } catch {}
  }, []);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  const isWelcome = pathname === "/welcome";
  if (isWelcome) {
    return (
      <div className="relative min-h-[100dvh] text-foreground selection:bg-primary/30">
        {children}
      </div>
    );
  }

  const activeQuad = QUADRANTS.find((q) => isActive(pathname, q.to));

  return (
    <div className="relative min-h-[100dvh] text-foreground selection:bg-primary/30 selection:text-foreground">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-white/[0.06] bg-sidebar/95 backdrop-blur-xl transition-[width] duration-300 ease-out lg:flex ${
          open ? "w-64" : "w-[64px]"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-inset ring-white/10">
            <GraduationCap className="h-4 w-4" />
          </div>
          {open && (
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-lg leading-none">
                Trackora
              </div>
            </div>
          )}
          <button
            onClick={toggle}
            className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/[0.06] bg-white/[0.02] text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {QUADRANTS.map((q) => {
            const active = isActive(pathname, q.to);
            const Icon = q.icon;
            const label = t(q.labelKey);
            return (
              <Link
                key={q.to}
                to={q.to}
                title={!open ? label : undefined}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-ui text-sm transition-all duration-200 ease-out hover:translate-x-0.5 ${
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? "text-primary" : ""}`}
                />
                {open && (
                  <span className="truncate text-sm font-medium tracking-tight">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 border-t border-white/[0.06] p-3">
          <IconButton
            open={open}
            onClick={toggleLang}
            label={language === "english" ? "हिंदी" : "English"}
            icon={Languages}
          />
        </div>
      </aside>

      {/* Mobile top bar — app-style: greeting + pills */}
      <header className="sticky top-0 z-20 lg:hidden">
        <div className="bg-background/70 backdrop-blur-xl">
          <div
            className="px-4 pb-3 pt-3"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-inset ring-white/15">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate font-display text-[15px]">
                  {activeQuad ? t(activeQuad.labelKey) : "Trackora"}
                </div>
                <div className="truncate font-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {activeQuad ? t(activeQuad.descKey) : "Study OS"}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <IconPill
                  onClick={toggleLang}
                  icon={Languages}
                  active={language === "hindi"}
                  label="Toggle language"
                />
                <IconPill
                  onClick={() => {}}
                  icon={Sun}
                  label="Light mode"
                  active
                />

              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        className={`pb-28 transition-[padding] duration-300 ease-out lg:pb-0 ${
          open ? "lg:pl-64" : "lg:pl-[64px]"
        }`}
      >
        <div key={pathname} className="page-transition">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav — floating pill (Zepto/Instamart style) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 px-3 lg:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-1 rounded-[28px] border border-white/[0.08] bg-background/85 p-1.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {QUADRANTS.map((q) => {
            const active = isActive(pathname, q.to);
            const Icon = q.icon;
            return (
              <Link
                key={q.to}
                to={q.to}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[22px] px-1 py-2 font-ui text-[10px] font-semibold transition-all duration-300 ease-out active:scale-95 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground active:scale-95"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] transition-transform duration-300 ${active ? "scale-110" : ""}`}
                />
                <span className="max-w-full truncate tracking-tight">{t(q.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function IconButton({
  open,
  onClick,
  label,
  icon: Icon,
  active = false,
}: {
  open: boolean;
  onClick: () => void;
  label: string;
  icon: typeof Sun;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-white/[0.06] bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
      } ${open ? "justify-start" : "justify-center"}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {open && (
        <span className="truncate font-ui text-xs uppercase tracking-[0.22em]">
          {label}
        </span>
      )}
    </button>
  );
}

function IconPill({
  onClick,
  icon: Icon,
  label,
  active = false,
}: {
  onClick: () => void;
  icon: typeof Sun;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`grid h-9 w-9 place-items-center rounded-full border transition active:scale-95 ${
        active
          ? "border-primary/40 bg-primary/15 text-primary"
          : "border-white/[0.08] bg-white/[0.04] text-muted-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
