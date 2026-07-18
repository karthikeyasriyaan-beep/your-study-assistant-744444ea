import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/management")({
  component: ManagementLayout,
});

const tabs = [
  { to: "/management/planner", label: "Syllabus Planner" },
  { to: "/management/timer", label: "Focus Timer" },
  { to: "/management/analytics", label: "Analytics" },
] as const;

function ManagementLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t("focus.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("focus.subtitle")}
        </p>
      </div>
      <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((t) => {
          const active = pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex-1 rounded-md px-3 py-1.5 text-center text-sm transition ${
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      <Outlet />
    </div>
  );
}
