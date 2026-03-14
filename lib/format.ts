import { DEFAULT_LOCALE, localeTag, type Locale } from "@/lib/i18n";

export const formatCurrency = (
  value: number,
  locale: Locale = DEFAULT_LOCALE,
): string =>
  new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (
  value: string,
  locale: Locale = DEFAULT_LOCALE,
): string =>
  new Intl.DateTimeFormat(localeTag(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export const formatDateTime = (
  value: string,
  locale: Locale = DEFAULT_LOCALE,
): string =>
  new Intl.DateTimeFormat(localeTag(locale), {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export const formatTime = (
  value: string,
  locale: Locale = DEFAULT_LOCALE,
): string =>
  new Intl.DateTimeFormat(localeTag(locale), {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export const sentenceCase = (value: string): string =>
  value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
