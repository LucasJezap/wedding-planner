export const toDateTimeLocalValue = (value: string): string =>
  new Date(value).toISOString().slice(0, 16);

export const fromDateTimeLocalValue = (value: string): string =>
  new Date(value).toISOString();
