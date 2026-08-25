import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardCheck, ClipboardList, Loader2 } from "lucide-react";
import { useState } from "react";
import { CarePlanItem, EmrSectionVisitSnapshotEntry } from "../types";

interface CarePlanHeaderEntry {
  sectionId: number;
  headerId: number;
  controlTypeId: number;
  headerValue: string;
}

interface CarePlanPanelProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId?: number;
  /** the doctor's currently-filled EMR Sections data, already flattened the same way
   * consultationPayload does for the real save — this is what gets saved under a new Care Plan
   * name */
  currentHeadersData: CarePlanHeaderEntry[];
  /** called once a saved Care Plan's rows have been fetched and grouped by section — the caller
   * (ConsultationEmrSections) applies them via the same applySnapshotToSectionData utility the
   * current-visit hydration path already uses */
  onApply: (rowsBySectionId: Map<number, EmrSectionVisitSnapshotEntry["values"]>) => void;
}

/**
 * Doctor-wise "Care Plan" presets — save whatever's currently filled in under a name (e.g.
 * "Fever"), reapply it to a different patient later. Mirrors TemplatePicker.tsx's drawer chrome
 * for visual consistency with the sibling Templates feature.
 *
 * Backend: CREATE_UPDATE_CARE_PLAN (the save) and GET_CARE_PLAN_DETAILS (the apply fetch) are both
 * CONFIRMED against the real API. GET_CARE_PLAN_LIST (the saved-plans list) is still an UNVERIFIED
 * guess (see config/defaults/index.ts) — its query stays silent so a 404/network error degrades to
 * an empty list rather than a crash, same convention every other invented endpoint here follows.
 */
const CarePlanPanel = ({
  isOpen,
  onClose,
  doctorId,
  currentHeadersData,
  onApply,
}: CarePlanPanelProps) => {
  const { fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();
  useScrollLock(isOpen);

  const [carePlanName, setCarePlanName] = useState("");
  const [applyingId, setApplyingId] = useState<number | null>(null);

  const getCarePlans = async (): Promise<CarePlanItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CARE_PLAN_LIST,
      {},
      { params: { doctorId } },
      { component: "CarePlanPanel", silent: true }
    );
    const raw: any[] = resp?.data ?? [];
    return raw.map(c => ({
      carePlanId: c.CarePlanId,
      carePlanName: c.CarePlanName,
    }));
  };

  const { data: carePlans = [], isLoading: carePlansLoading } = useQuery<CarePlanItem[]>({
    queryKey: ["carePlanList", doctorId],
    queryFn: getCarePlans,
    enabled: isOpen && doctorId != null,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const resp = await fetchApi(
        "POST",
        ENDPOINTS.CREATE_UPDATE_CARE_PLAN,
        {
          carePlanId: 0,
          carePlanName: carePlanName.trim(),
          doctorId,
          headersData: currentHeadersData,
        },
        {},
        { component: "CarePlanPanel" }
      );
      return resp;
    },
    onSuccess: resp => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "Could not save Care Plan");
        return;
      }
      showSuccess(resp?.message ?? "Care Plan saved successfully");
      setCarePlanName("");
      queryClient.invalidateQueries({ queryKey: ["carePlanList", doctorId] });
    },
    onError: error => {
      showError((error as any)?.message ?? "Could not save Care Plan");
    },
  });

  const handleSave = () => {
    if (!carePlanName.trim()) {
      showWarning("Please enter a name for this Care Plan");
      return;
    }
    if (currentHeadersData.length === 0) {
      showWarning("Nothing is filled in yet — there's nothing to save as a Care Plan");
      return;
    }
    saveMutation.mutate();
  };

  const handleApply = async (carePlan: CarePlanItem) => {
    const confirmed = window.confirm(
      `Apply "${carePlan.carePlanName}"? This will overwrite any values already entered for the sections it covers.`
    );
    if (!confirmed) return;

    setApplyingId(carePlan.carePlanId);
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CARE_PLAN_DETAILS,
      {},
      { params: { carePlanId: carePlan.carePlanId } },
      { component: "CarePlanPanel", silent: true }
    );
    setApplyingId(null);

    const raw: any[] = resp?.data ?? [];
    if (raw.length === 0) {
      showWarning("This Care Plan has no saved data");
      return;
    }

    const rowsBySectionId = new Map<number, EmrSectionVisitSnapshotEntry["values"]>();
    raw.forEach(row => {
      let value: unknown;
      try {
        value = JSON.parse(row.HeaderValue);
      } catch {
        value = row.HeaderValue;
      }
      const bucket = rowsBySectionId.get(row.SectionId) ?? [];
      bucket.push({ headerId: row.HeaderId, headerName: "", controlType: "", value });
      rowsBySectionId.set(row.SectionId, bucket);
    });

    onApply(rowsBySectionId);
    showSuccess(`"${carePlan.carePlanName}" applied`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="care-plan-backdrop"
        className="fixed inset-0 z-[95] bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        key="care-plan-drawer"
        className="fixed inset-y-0 right-0 z-[96] w-[92vw] max-w-[420px] bg-white shadow-2xl flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
      >
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 shrink-0">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
            <ClipboardCheck size={13} className="text-white" />
          </span>
          <h3 className="text-[13px] font-bold text-slate-700 tracking-wide flex-1">Care Plan</h3>
          <button className="close-drawer-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 shrink-0">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Save current as…
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="input-field !mb-0"
              placeholder="e.g. Fever"
              value={carePlanName}
              onChange={e => setCarePlanName(e.target.value)}
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="save-btn !w-auto !py-2.5 !px-4 !text-xs shrink-0 disabled:opacity-50"
            >
              {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : "Save"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Your saved Care Plans
          </p>

          {carePlansLoading ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 px-1 py-2">
              <Loader2 size={13} className="animate-spin" />
              Loading…
            </div>
          ) : carePlans.length === 0 ? (
            <p className="table-empty">No Care Plans saved yet</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {carePlans.map(carePlan => (
                <button
                  key={carePlan.carePlanId}
                  type="button"
                  onClick={() => handleApply(carePlan)}
                  disabled={applyingId !== null}
                  className="flex items-center gap-2.5 text-left px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors disabled:opacity-50"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 shrink-0">
                    {applyingId === carePlan.carePlanId ? (
                      <Loader2 size={14} className="animate-spin text-emerald-500" />
                    ) : (
                      <ClipboardList size={14} className="text-slate-400" />
                    )}
                  </span>
                  <span className="text-[12.5px] font-semibold text-slate-700 truncate">
                    {carePlan.carePlanName}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CarePlanPanel;
