"use client";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { useLocale } from "@/components/locale-provider";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { messages } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(
        result.error.includes("Too many")
          ? messages.login.rateLimitError
          : messages.login.error,
      );
      return;
    }

    startTransition(() => {
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_rgba(254,244,242,0.95),_rgba(255,251,245,0.95)_35%,_rgba(241,234,223,0.88))] px-4">
      <div className="absolute left-0 top-0 flex w-full justify-end p-6">
        <LocaleSwitcher />
      </div>
      <Card className="w-full max-w-md border-white/80 bg-white/85 shadow-[0_30px_120px_rgba(155,90,116,0.15)]">
        <CardContent className="space-y-6 p-8">
          <div className="space-y-2 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-dusty-rose)]">
              {messages.login.eyebrow}
            </p>
            <h1 className="font-display text-5xl text-[var(--color-ink)]">
              {messages.login.title}
            </h1>
            <p className="text-sm leading-6 text-[var(--color-muted-copy)]">
              {messages.login.description}
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              placeholder={messages.login.emailPlaceholder}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              type="password"
              placeholder={messages.login.passwordPlaceholder}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button
              className="w-full rounded-full py-6"
              disabled={isPending}
              type="submit"
            >
              {isPending ? messages.login.pending : messages.login.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
