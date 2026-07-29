/** dose quantity picker — a fixed, small domain-specific list (fractional doses included for
 * tablets/capsules), same "hardcode a tiny constants file" precedent as investigationOrderTypes.ts
 * rather than a master-data endpoint for something this unlikely to need admin configuration */
export const MEDICINE_DOSE_QUANTITIES = ["1/4", "1/2", "3/4", "1", "1.5", "2", "3", "4", "5", "6", "7"] as const;

export const MEDICINE_DURATION_UNITS = ["Day(s)", "Week(s)", "Month(s)"] as const;

export type MedicineDurationUnit = (typeof MEDICINE_DURATION_UNITS)[number];

/** "When to take" for a Variable Dose day-slot (Dose 1 / Dose 2) — a small fixed list, same
 * precedent as the other tiny hardcoded option lists here */
export const MEDICINE_WHEN_OPTIONS = ["Before Food", "After Food", "With Food", "Empty Stomach"] as const;

/** default seed rows for the "Dose Master" popup (Morning-Afternoon-Evening-Night style patterns,
 * e.g. "1-0-1" = one in the morning, none at noon, one at night) — no backend master exists for
 * this yet, same "hardcode a starter list" precedent as the other option lists here; new patterns
 * added from the popup only live for the current session */
export const MEDICINE_DOSE_MASTER_DEFAULTS = [
  "1-0-0",
  "1-1-1",
  "0-1-0",
  "0-0-1",
  "1-0-1",
  "1-1-1-1",
  "1/4-0-0",
  "1/4-0-1/4",
  "1/2-1/2-1/2",
  "0-1-1",
  "1/2-1/2-1/2-1/2",
] as const;

/** time-of-day label shown above each segment input in the "Dose Master" popup, indexed by
 * segment position — up to MAX_SLOTS (6) segments; a segment beyond this list falls back to
 * a generic "Slot N" label */
export const MEDICINE_DOSE_TIME_LABELS = [
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
  "Bed Time",
  "Early Morning",
] as const;

/** default clock time (24h HH:mm, for an <input type="time">) pre-filled per segment position,
 * same index order as MEDICINE_DOSE_TIME_LABELS — the doctor can still override it manually */
export const MEDICINE_DOSE_TIME_DEFAULTS = [
  "08:00",
  "13:00",
  "20:00",
  "22:00",
  "23:00",
  "06:00",
] as const;
