"use client";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { messages } = useLocale();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md border-white/80 bg-white/85">
        <CardContent className="space-y-4 p-8 text-center">
          <h2 className="font-display text-3xl text-[var(--color-ink)]">
            {messages.common.errorTitle}
          </h2>
          <p className="text-sm leading-6 text-[var(--color-muted-copy)]">
            {messages.common.errorDescription}
          </p>
          <Button className="rounded-full" onClick={reset}>
            {messages.common.errorRetry}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
