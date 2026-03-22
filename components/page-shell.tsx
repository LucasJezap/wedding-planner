import type { ReactNode } from "react";

export const PageShell = ({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <section className="space-y-8">
    <header className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,244,229,0.8),rgba(255,238,246,0.82))] px-6 py-8 shadow-[0_28px_100px_rgba(155,90,116,0.12)] sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-8 top-5 h-28 w-28 rounded-full bg-[#ff7a21]/14 blur-2xl" />
        <div className="absolute right-10 top-4 h-24 w-24 rounded-full bg-[#e93cac]/14 blur-2xl" />
        <div className="absolute bottom-0 right-24 h-20 w-20 rounded-full bg-[#3148d8]/10 blur-2xl" />
      </div>
      <div className="relative space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-dusty-rose)]">
          {eyebrow}
        </p>
        <div className="space-y-2">
          <h1 className="font-display text-4xl text-[var(--color-ink)] sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-[var(--color-muted-copy)]">
            {description}
          </p>
        </div>
      </div>
    </header>
    {children}
  </section>
);
