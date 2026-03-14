"use client";

type PreviewRow = Record<string, string>;

export const mapPreviewRows = (
  rows: PreviewRow[],
  mapping: Record<string, string>,
) =>
  rows.map((row) => ({
    firstName: row[mapping.firstName] ?? "",
    lastName: row[mapping.lastName] ?? "",
    side: row[mapping.side] ?? "FRIENDS",
    email: row[mapping.email] ?? "",
    phone: row[mapping.phone] ?? "",
    dietaryRestrictions: (row[mapping.dietaryRestrictions] ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
    invitationReceived:
      (row[mapping.invitationReceived] ?? "").toLowerCase() === "true",
    paymentCoverage: row[mapping.paymentCoverage] === "HALF" ? "HALF" : "FULL",
    transportToVenue:
      (row[mapping.transportToVenue] ?? "").toLowerCase() === "true",
    transportFromVenue:
      (row[mapping.transportFromVenue] ?? "").toLowerCase() === "true",
    notes: row[mapping.notes] ?? "",
  }));
