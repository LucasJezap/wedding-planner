"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const LocaleSwitcher = ({ className }: { className?: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { locale, messages } = useLocale();

  const handleSwitch = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }

    startTransition(() => {
      void (async () => {
        await fetch("/api/preferences/locale", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ locale: nextLocale }),
        });

        router.refresh();
      })();
    });
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-2 py-2 shadow-[0_10px_35px_rgba(140,90,110,0.12)] backdrop-blur",
        className,
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-card-tint)] text-[var(--color-dusty-rose)]">
        <Languages className="h-4 w-4" />
      </span>
      <div className="flex items-center rounded-full bg-[var(--color-card-tint)]/70 p-1">
        {SUPPORTED_LOCALES.map((entry) => (
          <Button
            key={entry}
            type="button"
            variant="ghost"
            disabled={isPending}
            aria-label={`${messages.locale.switchTo} ${messages.locale[entry].toUpperCase()}`}
            onClick={() => handleSwitch(entry)}
            className={cn(
              "rounded-full px-4 py-2 text-sm",
              entry === locale
                ? "bg-[var(--color-dusty-rose)] text-white hover:bg-[var(--color-dusty-rose)]"
                : "text-[var(--color-ink)] hover:bg-white/80",
            )}
          >
            {messages.locale[entry]}
          </Button>
        ))}
      </div>
      {isPending ? (
        <span className="pr-2 text-xs uppercase tracking-[0.2em] text-[var(--color-muted-copy)]">
          {messages.locale.loading}
        </span>
      ) : null}
    </div>
  );
};
