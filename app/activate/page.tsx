"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";

export default function ActivatePage() {
  const { messages } = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_rgba(254,244,242,0.95),_rgba(255,251,245,0.95)_35%,_rgba(241,234,223,0.88))] px-4">
      <div className="absolute left-0 top-0 flex w-full justify-end p-6">
        <LocaleSwitcher />
      </div>
      <Card className="w-full max-w-md border-white/80 bg-white/85 shadow-[0_30px_120px_rgba(155,90,116,0.15)]">
        <CardContent className="space-y-6 p-8">
          <div className="space-y-2 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-dusty-rose)]">
              {messages.access.activationEyebrow}
            </p>
            <h1 className="font-display text-5xl text-[var(--color-ink)]">
              {messages.access.activationTitle}
            </h1>
            <p className="text-sm leading-6 text-[var(--color-muted-copy)]">
              {messages.access.activationDescription}
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              try {
                await apiClient("/api/access/activate", {
                  method: "POST",
                  body: JSON.stringify({
                    token,
                    name,
                    password,
                    confirmPassword,
                  }),
                });
                startTransition(() => {
                  router.push("/login");
                  router.refresh();
                });
              } catch (activationError) {
                setError(
                  activationError instanceof Error
                    ? activationError.message
                    : messages.login.error,
                );
              }
            }}
          >
            <Input
              placeholder={messages.access.name}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              type="password"
              placeholder={messages.access.password}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Input
              type="password"
              placeholder={messages.access.confirmPassword}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button
              className="w-full rounded-full py-6"
              disabled={isPending || !token}
              type="submit"
            >
              {messages.access.activate}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
