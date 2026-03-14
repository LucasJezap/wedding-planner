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
  <section className="space-y-6">
    <header className="space-y-3">
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
    </header>
    {children}
  </section>
);
