"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { ReactNode } from "react";

import { AccountSection } from "@/components/account-section";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { useShellStore } from "@/hooks/use-shell-store";
import {
  canAccessSection,
  canManageAccess,
  type PlannerSection,
} from "@/lib/access-control";
import type { UserRole } from "@/lib/planner-domain";
import { cn } from "@/lib/utils";

export const AppShell = ({
  userName,
  userRole,
  children,
}: {
  userName: string;
  userRole: UserRole;
  children: ReactNode;
}) => {
  const pathname = usePathname();
  const { menuOpen, toggleMenu, setMenuOpen } = useShellStore();
  const { messages } = useLocale();
  const navigation = [
    {
      href: "/dashboard",
      label: messages.shell.nav.dashboard,
      section: "dashboard" as PlannerSection,
    },
    {
      href: "/guests",
      label: messages.shell.nav.guests,
      section: "guests" as PlannerSection,
    },
    {
      href: "/vendors",
      label: messages.shell.nav.vendors,
      section: "vendors" as PlannerSection,
    },
    {
      href: "/tasks",
      label: messages.shell.nav.tasks,
      section: "tasks" as PlannerSection,
    },
    {
      href: "/budget",
      label: messages.shell.nav.budget,
      section: "budget" as PlannerSection,
    },
    {
      href: "/timeline",
      label: messages.shell.nav.timeline,
      section: "timeline" as PlannerSection,
    },
    {
      href: "/seating",
      label: messages.shell.nav.seating,
      section: "seating" as PlannerSection,
    },
    {
      href: "/import",
      label: messages.shell.nav.import,
      section: "import" as PlannerSection,
    },
    {
      href: "/public",
      label: messages.shell.nav.publicSite,
      section: "public" as PlannerSection,
    },
    ...(canManageAccess(userRole)
      ? [
          {
            href: "/access",
            label: messages.shell.nav.access,
            section: "access" as PlannerSection,
          },
        ]
      : []),
  ].filter((item) => canAccessSection(userRole, item.section));

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fff8f1_0%,#fff4f7_30%,#fff7e7_65%,#fffdfa_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-5rem] top-[-2rem] h-56 w-56 rounded-full bg-[#e93cac]/16 blur-3xl" />
        <div className="absolute right-[-3rem] top-20 h-72 w-72 rounded-full bg-[#ff7a21]/14 blur-3xl" />
        <div className="absolute bottom-12 left-[10%] h-64 w-64 rounded-full bg-[#3148d8]/10 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-[12%] h-72 w-72 rounded-full bg-[#f7c929]/18 blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[2.3rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(255,244,229,0.82),rgba(255,238,246,0.8))] px-5 py-4 shadow-[0_24px_90px_rgba(140,90,110,0.12)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-dusty-rose)]">
                {messages.shell.eyebrow}
              </p>
              <h1 className="font-display text-3xl text-[var(--color-ink)]">
                {messages.shell.brand}
              </h1>
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <LocaleSwitcher />
              <AccountSection userName={userName} userRole={userRole} />
            </div>
            <Button
              type="button"
              variant="ghost"
              className="lg:hidden"
              onClick={toggleMenu}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
          <nav
            className={cn(
              "mt-4 grid gap-2 lg:mt-5 lg:flex",
              menuOpen ? "grid" : "hidden lg:flex",
            )}
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "border-transparent bg-[linear-gradient(135deg,#ff7a21,#e93cac)] text-white shadow-[0_12px_28px_rgba(233,60,172,0.24)]"
                    : "border-white/65 bg-white/55 text-[var(--color-ink)] hover:bg-[var(--color-card-tint)]",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-3 lg:hidden">
              <LocaleSwitcher className="justify-between" />
              <AccountSection userName={userName} userRole={userRole} />
            </div>
          </nav>
        </header>
        <main className="flex-1 py-8">{children}</main>
      </div>
    </div>
  );
};
