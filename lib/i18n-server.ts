import { cookies } from "next/headers";

import {
  DEFAULT_LOCALE,
  getMessages,
  LOCALE_COOKIE_NAME,
  type Locale,
  resolveLocale,
} from "@/lib/i18n";

export const getRequestLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies();
  return resolveLocale(
    cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? DEFAULT_LOCALE,
  );
};

export const getRequestMessages = async () => {
  const locale = await getRequestLocale();
  return {
    locale,
    messages: getMessages(locale),
  };
};
