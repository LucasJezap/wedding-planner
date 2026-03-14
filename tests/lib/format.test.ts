import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  sentenceCase,
} from "@/lib/format";

describe("format helpers", () => {
  it("formats currency and dates for polish locale", () => {
    expect(formatCurrency(1200)).toContain("1");
    expect(formatDate("2026-09-10T14:00:00.000Z")).toBeTruthy();
    expect(formatDateTime("2026-09-10T14:00:00.000Z")).toBeTruthy();
    expect(formatTime("2026-09-10T14:00:00.000Z")).toBeTruthy();
  });

  it("converts enum-like tokens into sentence case", () => {
    expect(sentenceCase("IN_PROGRESS")).toBe("In Progress");
  });
});
