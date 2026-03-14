"use client";

import { LogOut, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTransition } from "react";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/planner-domain";

export const AccountSection = ({
  userName,
  userRole,
}: {
  userName: string;
  userRole: UserRole;
}) => {
  const [isPending, startTransition] = useTransition();
  const { messages } = useLocale();

  return (
    <div className="flex items-center gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-2 shadow-[0_12px_40px_rgba(140,90,110,0.12)] backdrop-blur">
      <div className="flex items-center gap-3 rounded-[1.2rem] bg-[var(--color-card-tint)]/70 px-4 py-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--color-dusty-rose)]">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted-copy)]">
            {messages.shell.account}
          </p>
          <p className="truncate text-sm text-[var(--color-ink)]">
            {messages.shell.signedInAs} {userName}
          </p>
          <p className="truncate text-xs text-[var(--color-muted-copy)]">
            {messages.shell.roles[userRole]}
          </p>
        </div>
      </div>
      <Button
        type="button"
        onClick={() =>
          startTransition(() => {
            void signOut({ callbackUrl: "/login" });
          })
        }
        className="rounded-full bg-[var(--color-dusty-rose)] px-4 text-white hover:bg-[var(--color-dusty-rose)]/90"
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isPending ? messages.shell.logoutPending : messages.shell.logout}
      </Button>
    </div>
  );
};
