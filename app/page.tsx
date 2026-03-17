import Link from "next/link";
import { CalendarDays, HeartHandshake, Sparkles } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { Card, CardContent } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { getRequestMessages } from "@/lib/i18n-server";
import { DEMO_CREDENTIALS, WITNESS_DEMO_CREDENTIALS } from "@/lib/planner-seed";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const { messages } = await getRequestMessages();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,_rgba(254,244,242,0.95),_rgba(255,251,245,0.95)_35%,_rgba(241,234,223,0.88))] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex justify-end">
          <LocaleSwitcher />
        </div>
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden border-white/80 bg-white/75 shadow-[0_30px_120px_rgba(155,90,116,0.15)] backdrop-blur">
            <CardContent className="space-y-8 p-8 sm:p-12">
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--color-dusty-rose)]">
                {messages.home.eyebrow}
              </p>
              <div className="space-y-4">
                <h1 className="max-w-3xl font-display text-6xl leading-none text-[var(--color-ink)] sm:text-7xl">
                  {messages.home.title}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[var(--color-muted-copy)]">
                  {messages.home.description}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--primary)] px-6 text-base text-white"
                >
                  {messages.home.openWorkspace}
                </Link>
                <Link
                  href="/public"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--color-dusty-rose)] px-6 text-base text-[var(--color-dusty-rose)]"
                >
                  {messages.home.viewGuestSite}
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: <HeartHandshake className="h-5 w-5" />,
                    title: messages.home.cards.guestsTitle,
                    text: messages.home.cards.guestsText,
                  },
                  {
                    icon: <CalendarDays className="h-5 w-5" />,
                    title: messages.home.cards.flowTitle,
                    text: messages.home.cards.flowText,
                  },
                  {
                    icon: <Sparkles className="h-5 w-5" />,
                    title: messages.home.cards.dashboardTitle,
                    text: messages.home.cards.dashboardText,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.6rem] bg-[var(--color-card-tint)]/80 p-5"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--color-dusty-rose)]">
                      {item.icon}
                    </div>
                    <h2 className="font-display text-2xl text-[var(--color-ink)]">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-muted-copy)]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/80 bg-[linear-gradient(180deg,_rgba(197,124,146,0.16),_rgba(255,255,255,0.88))] shadow-[0_30px_120px_rgba(155,90,116,0.15)]">
            <CardContent className="space-y-6 p-8">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-dusty-rose)]">
                  {messages.home.demoEyebrow}
                </p>
                <h2 className="mt-3 font-display text-4xl text-[var(--color-ink)]">
                  {messages.home.demoTitle}
                </h2>
              </div>
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted-copy)]">
                  {messages.home.demoAccounts}
                </p>
                <div className="rounded-[1.6rem] bg-white/85 p-6">
                  <p className="text-sm text-[var(--color-muted-copy)]">
                    {messages.home.adminAccount}
                  </p>
                  <p className="mt-1 text-lg text-[var(--color-ink)]">
                    {DEMO_CREDENTIALS.email}
                  </p>
                  <p className="mt-4 text-sm text-[var(--color-muted-copy)]">
                    {messages.home.password}
                  </p>
                  <p className="mt-1 text-lg text-[var(--color-ink)]">
                    {DEMO_CREDENTIALS.password}
                  </p>
                </div>
                <div className="rounded-[1.6rem] bg-white/85 p-6">
                  <p className="text-sm text-[var(--color-muted-copy)]">
                    {messages.home.witnessAccount}
                  </p>
                  <p className="mt-1 text-lg text-[var(--color-ink)]">
                    {WITNESS_DEMO_CREDENTIALS.email}
                  </p>
                  <p className="mt-4 text-sm text-[var(--color-muted-copy)]">
                    {messages.home.password}
                  </p>
                  <p className="mt-1 text-lg text-[var(--color-ink)]">
                    {WITNESS_DEMO_CREDENTIALS.password}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-7 text-[var(--color-muted-copy)]">
                {messages.home.demoDescription}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
