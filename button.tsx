import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { QrCode, MessagesSquare, Settings2, Bot } from "lucide-react";

const items = [
  { to: "/connect", label: "Интеграция", icon: QrCode },
  { to: "/chats", label: "Живые чаты", icon: MessagesSquare },
  { to: "/settings", label: "40 функций", icon: Settings2 },
] as const;

export function Sidebar() {
  const { location } = useRouterState();
  return (
    <aside className="glass-panel m-4 flex w-64 shrink-0 flex-col rounded-2xl p-4">
      <div className="mb-8 flex items-center gap-3 px-2 pt-2">
        <div className="neon-border grid h-10 w-10 place-items-center rounded-xl bg-[oklch(0.78_0.18_200_/_0.15)]">
          <Bot className="h-5 w-5 text-[oklch(0.9_0.15_200)]" />
        </div>
        <div>
          <div className="font-display text-lg font-semibold neon-text">
            businessbot
          </div>
          <div className="-mt-0.5 text-xs text-muted-foreground">.kg</div>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                active
                  ? "neon-border bg-[oklch(0.78_0.18_200_/_0.12)] text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">
        Локальный ИИ · Встроенный WhatsApp · SQLite
      </div>
    </aside>
  );
}