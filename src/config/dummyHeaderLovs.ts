import { OptionSchema } from "@/components/dynamicForm/types";

/**
 * Dummy dropdown options for a header whose real LOVs (GET_DOCTOR_HEARDER_LOVS) come back empty —
 * matched generically by header name, the same way emrHeaderBehavior.ts matches header names for
 * custom data sources. Only ever used as a fallback (see EmrSectionRenderer's getHeaderLovs) so a
 * section like Procedure or Diagnosis is testable before real LOVs are configured in EMRControls;
 * once real LOVs exist for a header, they always take precedence and this is never consulted.
 */
interface DummyLovRule {
  match: (headerName: string) => boolean;
  options: string[];
}

const normalize = (name: string) => (name || "").trim().toLowerCase().replace(/\s+/g, "");

const DUMMY_LOV_RULES: DummyLovRule[] = [
  {
    match: name => normalize(name).includes("procedure"),
    options: ["Wound Dressing", "Suturing", "Catheterization", "Endoscopy", "Biopsy", "Nebulization"],
  },
  {
    match: name => normalize(name).includes("diagnos"),
    options: ["Migraine", "Hypertension", "Type 2 Diabetes", "Asthma", "Gastritis", "Common Cold"],
  },
  {
    match: name => normalize(name).includes("followup"),
    options: ["None", "1 Week", "2 Weeks", "1 Month", "3 Months"],
  },
  {
    // shared by Procedure's and Diagnosis's own "Status" header — the real LOV per header (once
    // configured in EMRControls) will always narrow this down correctly per section
    match: name => normalize(name).includes("status"),
    options: [
      "Preparation",
      "In Progress",
      "Completed",
      "Finished",
      "UnFinished",
      "Cancelled",
      "Resolved",
      "Active",
      "Inactive",
    ],
  },
];

export const getDummyLovFallback = (headerName: string): OptionSchema[] => {
  const rule = DUMMY_LOV_RULES.find(r => r.match(headerName));
  return rule ? rule.options.map(v => ({ label: v, value: v })) : [];
};
