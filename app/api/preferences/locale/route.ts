import { NextResponse } from "next/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, resolveLocale } from "@/lib/i18n";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    locale?: string;
  };
  const locale = resolveLocale(payload.locale ?? DEFAULT_LOCALE);
  const response = NextResponse.json({ success: true, locale });

  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
