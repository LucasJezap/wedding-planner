"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  DEFAULT_LOCALE,
  getMessages,
  type Locale,
  type Messages,
} from "@/lib/i18n";

const defaultValue = {
  locale: DEFAULT_LOCALE,
  messages: getMessages(DEFAULT_LOCALE),
};

const LocaleContext = createContext<{
  locale: Locale;
  messages: Messages;
}>(defaultValue);

export const LocaleProvider = ({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) => {
  const messages = useMemo(() => getMessages(locale), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, messages }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);
