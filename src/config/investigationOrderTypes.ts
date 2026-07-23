export const INVESTIGATION_ORDER_TYPES = ["Routine", "Urgent", "STAT", "Emergency"] as const;

export type InvestigationOrderType = (typeof INVESTIGATION_ORDER_TYPES)[number];
