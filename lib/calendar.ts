const escapeIcsText = (value: string): string =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

const formatUtcDate = (value: string): string =>
  new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");

const addHours = (value: string, hours: number): string =>
  new Date(new Date(value).getTime() + hours * 60 * 60 * 1000).toISOString();

export type CalendarEntry = {
  uid: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  description?: string;
  location?: string;
};

export const buildIcsCalendar = (input: {
  calendarName: string;
  prodId: string;
  entries: CalendarEntry[];
}): string => {
  const timestamp = formatUtcDate(new Date().toISOString());

  const events = input.entries.map((entry) =>
    [
      "BEGIN:VEVENT",
      `UID:${escapeIcsText(entry.uid)}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART:${formatUtcDate(entry.startsAt)}`,
      `DTEND:${formatUtcDate(entry.endsAt ?? addHours(entry.startsAt, 1))}`,
      `SUMMARY:${escapeIcsText(entry.title)}`,
      entry.description
        ? `DESCRIPTION:${escapeIcsText(entry.description)}`
        : null,
      entry.location ? `LOCATION:${escapeIcsText(entry.location)}` : null,
      "END:VEVENT",
    ]
      .filter(Boolean)
      .join("\r\n"),
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${escapeIcsText(input.prodId)}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(input.calendarName)}`,
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
};
