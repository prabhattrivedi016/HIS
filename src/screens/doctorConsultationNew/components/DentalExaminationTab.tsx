export type ExaminationGroupKey = "extraOral" | "softTissue" | "hardTissue";
export type ExaminationStatus = "normal" | "abnormal";

export interface ExaminationFieldValue {
  status?: ExaminationStatus;
  /** only meaningful when status is "abnormal" — what the finding actually was */
  note?: string;
}

export type DentalExaminationValue = Partial<
  Record<ExaminationGroupKey, Partial<Record<string, ExaminationFieldValue>>>
>;

export const isExaminationFilled = (value?: DentalExaminationValue): boolean =>
  Object.values(value ?? {}).some(group =>
    Object.values(group ?? {}).some(field => Boolean(field?.status))
  );

const EXAMINATION_GROUPS: {
  key: ExaminationGroupKey;
  title: string;
  fields: { key: string; label: string }[];
}[] = [
  {
    key: "extraOral",
    title: "Extra Oral Examination",
    fields: [
      { key: "headNeck", label: "Head & Neck" },
      { key: "lymphNodes", label: "Lymph Nodes" },
      { key: "tmj", label: "TMJ" },
      { key: "salivaryGlands", label: "Salivary Glands" },
      { key: "muscles", label: "Muscles" },
    ],
  },
  {
    key: "softTissue",
    title: "Soft Tissue Examination",
    fields: [
      { key: "cheeks", label: "Cheeks" },
      { key: "lips", label: "Lips" },
      { key: "tongue", label: "Tongue" },
      { key: "palate", label: "Palate" },
      { key: "gingiva", label: "Gingiva" },
      { key: "alveolarRidge", label: "Alveolar Ridge" },
      { key: "halitosis", label: "Halitosis" },
    ],
  },
  {
    key: "hardTissue",
    title: "Hard Tissue Examination",
    fields: [
      { key: "missingTeeth", label: "Missing Teeth" },
      { key: "stains", label: "Stains" },
      { key: "caries", label: "Caries" },
      { key: "wastingDisease", label: "Wasting Disease" },
      { key: "tenderness", label: "Tenderness" },
      { key: "mobility", label: "Mobility" },
      { key: "rootStumps", label: "Root Stumps" },
      { key: "occlusion", label: "Occlusion" },
      { key: "malalignment", label: "Malalignment" },
      { key: "faultyRestorations", label: "Faulty Restorations" },
      { key: "other", label: "Other" },
    ],
  },
];

interface ExaminationFieldCardProps {
  label: string;
  value?: ExaminationFieldValue;
  onChange: (value: ExaminationFieldValue) => void;
}

const ExaminationFieldCard = ({ label, value, onChange }: ExaminationFieldCardProps) => {
  const status = value?.status;

  const setStatus = (next: ExaminationStatus) =>
    onChange({
      status: status === next ? undefined : next,
      note: next === "normal" ? undefined : value?.note,
    });

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-[12.5px] font-bold text-slate-700 mb-2 truncate" title={label}>
        {label}
      </p>
      <div className="flex rounded-lg border border-slate-200 overflow-hidden text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => setStatus("normal")}
          className={`flex-1 py-1.5 transition-colors ${
            status === "normal"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-white text-slate-500 hover:bg-slate-50"
          }`}
        >
          Normal
        </button>
        <button
          type="button"
          onClick={() => setStatus("abnormal")}
          className={`flex-1 py-1.5 transition-colors border-l border-slate-200 ${
            status === "abnormal"
              ? "bg-rose-100 text-rose-600"
              : "bg-white text-slate-500 hover:bg-slate-50"
          }`}
        >
          Abnormal
        </button>
      </div>

      {status === "abnormal" && (
        <input
          type="text"
          className="input-field !mb-0 !mt-2 !py-1.5 !text-[12px]"
          placeholder="Describe finding…"
          value={value?.note ?? ""}
          onChange={e => onChange({ status, note: e.target.value })}
        />
      )}
    </div>
  );
};

interface DentalExaminationTabProps {
  value?: DentalExaminationValue;
  onChange: (value: DentalExaminationValue) => void;
}

const DentalExaminationTab = ({ value, onChange }: DentalExaminationTabProps) => {
  const examinationValue = value ?? {};

  const patchField = (
    group: ExaminationGroupKey,
    fieldKey: string,
    fieldValue: ExaminationFieldValue
  ) =>
    onChange({
      ...examinationValue,
      [group]: { ...(examinationValue[group] ?? {}), [fieldKey]: fieldValue },
    });

  return (
    <div className="w-full space-y-5">
      {EXAMINATION_GROUPS.map(group => (
        <div
          key={group.key}
          className="rounded-xl border border-slate-200 bg-white overflow-hidden"
        >
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
            <p className="text-sm font-bold text-slate-700">{group.title}</p>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {group.fields.map(field => (
              <ExaminationFieldCard
                key={field.key}
                label={field.label}
                value={examinationValue[group.key]?.[field.key]}
                onChange={fieldValue => patchField(group.key, field.key, fieldValue)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DentalExaminationTab;
