"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useLocale } from "@/components/locale-provider";
import { Card, CardContent } from "@/components/ui/card";

export const SummaryCard = ({
  label,
  value,
  detail,
  accent,
  icon,
  href,
}: {
  label: string;
  value: string;
  detail: string;
  accent: string;
  icon: ReactNode;
  href?: string;
}) => {
  const { messages } = useLocale();

  return (
    <Card className="border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(160,96,120,0.12)] backdrop-blur transition-transform hover:-translate-y-1">
      <CardContent className="p-0">
        <Link href={href ?? "#"} className="block space-y-4 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted-copy)]">
              {label}
            </p>
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-white"
              style={{ background: accent }}
            >
              {icon}
            </span>
          </div>
          <div>
            <p className="font-display text-4xl text-[var(--color-ink)]">
              {value}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
              {detail}
            </p>
          </div>
          {href ? (
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-[var(--color-ink)]">
              {messages.common.more}
            </span>
          ) : null}
        </Link>
      </CardContent>
    </Card>
  );
};
