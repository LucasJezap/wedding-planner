"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_rgba(254,244,242,0.95),_rgba(255,251,245,0.95)_35%,_rgba(241,234,223,0.88))] px-4">
      <Card className="w-full max-w-md border-white/80 bg-white/85 shadow-[0_30px_120px_rgba(155,90,116,0.15)]">
        <CardContent className="space-y-4 p-8 text-center">
          <h2 className="font-display text-3xl text-[var(--color-ink)]">
            Coś poszło nie tak
          </h2>
          <p className="text-sm leading-6 text-[var(--color-muted-copy)]">
            Wystąpił nieoczekiwany błąd. Spróbuj ponownie lub odśwież stronę.
          </p>
          <Button className="rounded-full" onClick={reset}>
            Spróbuj ponownie
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
