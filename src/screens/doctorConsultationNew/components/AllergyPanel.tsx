import { useState, useEffect, useRef, useMemo } from "react";
import InputField from "@/components/customInputField";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { showSuccess } from "@/utils/alert";
import AllergyMasterPopup from "./AllergyMasterPopup";

interface SnomedItem {
  conceptId: string;
  term: string;
  conceptFsn: string;
}

interface AllergyType {
  id: number;
  allergyTypeName: string;
}

interface AllergenOption {
  id: number;
  name: string;
  snomedCode: string;
}

interface AllergyRecord {
  id: number;
  date: string;
  allergyTypeId: number;
  allergyType: string;
  allergyId: number;
  allergy: string;
  reaction: string;
  remarks: string;
  severity: string;
  clinicalStatus: string;
  verificationStatus: string;
  snomedCode: string;
  notKnownAllergy: number;
}

interface AllergyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: number;
  visitId?: number;
  onBind?: (allergyText: string) => void;
}

const SEVERITY_OPTIONS = ["Major", "Moderate", "Minor", "No Alert"];
const CLINICAL_STATUS_OPTIONS = ["Active", "Inactive", "Resolved"];
const VERIFICATION_STATUS_OPTIONS = ["Unconfirmed", "Presumed", "Confirmed", "Refuted", "Entered in Error"];

const AllergyPanel = ({ isOpen, onClose, patientId, onBind }: AllergyPanelProps) => {
  const { loading, fetchApi } = useGlobalApi();

  const { pickMasterValue } = usePickMaster("AllergyTypeName");
  const allergyTypes = useMemo<AllergyType[]>(
    () => pickMasterValue.map((item: PickMasterItem) => ({
      id: Number(item.key),
      allergyTypeName: item.value as string,
    })),
    [pickMasterValue]
  );

  const [allergenOptions, setAllergenOptions] = useState<AllergenOption[]>([]);

  const [notKnownAllergy, setNotKnownAllergy] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number>(0);
  const [selectedAllergenId, setSelectedAllergenId] = useState<number>(0);
  const [reaction, setReaction] = useState("");
  const [remarks, setRemarks] = useState("");
  const [severity, setSeverity] = useState("");
  const [clinicalStatus, setClinicalStatus] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [deActivationRemarks, setDeActivationRemarks] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<number>(0);
  const [editId, setEditId] = useState<number>(0);
  const deActivationRef = useRef<HTMLTextAreaElement>(null);

  const [snomedQuery, setSnomedQuery] = useState("");
  const [snomedCode, setSnomedCode] = useState("");
  const [snomedResults, setSnomedResults] = useState<SnomedItem[]>([]);
  const [showSnomedDropdown, setShowSnomedDropdown] = useState(false);
  const [snomedLoading, setSnomedLoading] = useState(false);
  const snomedRef = useRef<HTMLDivElement>(null);
  const skipSnomedRef = useRef(false);

  const [allergyRecords, setAllergyRecords] = useState<AllergyRecord[]>([]);
  const [showAllergyMaster, setShowAllergyMaster] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const loadAllergyRecords = async () => {
    if (!patientId) return;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_ALLERGY_DETAIL_LIST,
      {},
      { params: { patientId } },
      { component: "AllergyPanel" }
    );
    const data: any[] = resp?.data ?? [];
    setAllergyRecords(data.map((r) => ({
      id: r.Id ?? r.id ?? 0,
      date: r.CreatedOn ?? r.EntryDate ?? r.createdOn ?? r.entryDate ?? "",
      allergyTypeId: Number(r.AllergyTypeId ?? r.allergyTypeId ?? 0),
      allergyType: r.AllergyType ?? r.allergyType ?? "",
      allergyId: Number(r.AllergyId ?? r.allergyId ?? 0),
      allergy: r.AllergyName ?? r.allergyName ?? "",
      reaction: r.Reaction ?? r.reaction ?? "",
      remarks: r.Remarks ?? r.remarks ?? "",
      severity: r.InteractionSeverity ?? r.interactionSeverity ?? "",
      clinicalStatus: r.ClinicalStatus ?? r.clinicalStatus ?? "",
      verificationStatus: r.VerificationStatus ?? r.verificationStatus ?? "",
      snomedCode: r.SnomedCode ?? r.snomedCode ?? "",
      notKnownAllergy: r.NotKnownAllergy ?? r.notKnownAllergy ?? 0,
    })));
    const hasNoKnown = data.some((r) => (r.NotKnownAllergy ?? r.notKnownAllergy ?? 0) === 1);
    setNotKnownAllergy(hasNoKnown);
  };

  useEffect(() => {
    if (isOpen && patientId) {
      loadAllergyRecords();
    }
  }, [isOpen, patientId]);

  useEffect(() => {
    if (!isOpen || !selectedTypeId) { setAllergenOptions([]); return; }

    const typeName = allergyTypes.find((t) => t.id === selectedTypeId)?.allergyTypeName ?? "";

    if (typeName.toLowerCase() === "drug") {
      fetchApi("GET", ENDPOINTS.GET_SALT_NAME_MASTER_LIST, {}, {}, { component: "AllergyPanel" })
        .then((resp) => {
          const data = resp?.data ?? [];
          setAllergenOptions(data.map((s: any, i: number) => ({
            id: Number(s.SaltId ?? s.saltId ?? s.SaltMasterId ?? s.saltMasterId ?? s.Id ?? s.id ?? i + 1),
            name: String(s.SaltName ?? s.saltName ?? s.Name ?? s.name ?? ""),
            snomedCode: String(s.SnomedCode ?? s.snomedCode ?? ""),
          })));
        });
    } else {
      fetchApi(
        "GET",
        ENDPOINTS.GET_ALLERGY_MASTER_LIST,
        {},
        { params: { isActive: 1, allergyTypeId: selectedTypeId } },
        { component: "AllergyPanel" }
      ).then((resp) => {
        const data = resp?.data ?? [];
        setAllergenOptions(data.map((a: any) => ({
          id: a.AllergyId,
          name: a.AllergyName,
          snomedCode: a.SnomedCode ?? "",
        })));
      });
    }
  }, [isOpen, selectedTypeId, allergyTypes]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (snomedRef.current && !snomedRef.current.contains(e.target as Node)) {
        setShowSnomedDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (skipSnomedRef.current) { skipSnomedRef.current = false; return; }
    const q = snomedQuery.trim();
    if (!q || q.length < 2) { setSnomedResults([]); setShowSnomedDropdown(false); return; }

    const timer = setTimeout(async () => {
      setSnomedLoading(true);
      try {
        const url = `http://localhost:8080/csnoserv/api/search/search?term=${encodeURIComponent(q)}&state=active&semantictag=finding&acceptability=preferred&returnlimit=100`;
        const res = await fetch(url);
        const data: SnomedItem[] = await res.json();
        setSnomedResults(data ?? []);
        setShowSnomedDropdown((data ?? []).length > 0);
      } catch {
        setSnomedResults([]);
        setShowSnomedDropdown(false);
      } finally {
        setSnomedLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [snomedQuery]);

  const handleSnomedSelect = (item: SnomedItem) => {
    skipSnomedRef.current = true;
    setSnomedQuery(item.term);
    setSnomedCode(item.conceptId);
    setSnomedResults([]);
    setShowSnomedDropdown(false);
  };

  const clearSnomed = () => {
    setSnomedQuery("");
    setSnomedCode("");
    setSnomedResults([]);
    setShowSnomedDropdown(false);
  };

  const handleAllergenChange = (id: number) => {
    setSelectedAllergenId(id);
    const option = allergenOptions.find((a) => Number(a.id) === Number(id));
    if (option?.snomedCode) {
      skipSnomedRef.current = true;
      setSnomedQuery(option.snomedCode);
      setSnomedCode(option.snomedCode);
    } else {
      clearSnomed();
    }
  };

  const resetForm = () => {
    setSelectedTypeId(0);
    setSelectedAllergenId(0);
    setReaction("");
    setRemarks("");
    setSeverity("");
    setClinicalStatus("");
    setVerificationStatus("");
    setEditId(0);
    clearSnomed();
  };

  const handleEdit = (rec: AllergyRecord) => {
    setEditId(rec.id);
    setSelectedTypeId(rec.allergyTypeId);
    setSelectedAllergenId(rec.allergyId);
    setReaction(rec.reaction);
    setRemarks(rec.remarks);
    setSeverity(rec.severity);
    setClinicalStatus(rec.clinicalStatus);
    setVerificationStatus(rec.verificationStatus);
    if (rec.snomedCode) {
      skipSnomedRef.current = true;
      setSnomedQuery(rec.snomedCode);
      setSnomedCode(rec.snomedCode);
    } else {
      clearSnomed();
    }
  };

  const handleDelete = (id: number) => {
    setPendingDeleteId(id);
    setDeActivationRemarks("");
    setTimeout(() => deActivationRef.current?.focus(), 100);
  };

  const handleConfirmDelete = async () => {
    if (!deActivationRemarks.trim()) {
      deActivationRef.current?.focus();
      return;
    }

    const payload = {
      id: pendingDeleteId,
      patientId,
      deactivationRemarks: deActivationRemarks.trim(),
    };

    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.DELETE_PATIENT_ALLERGY_DETAILS,
      payload,
      {},
      { component: "AllergyPanel" }
    );

    if (resp?.result) {
      showSuccess("Allergy deleted successfully");
      setPendingDeleteId(0);
      setDeActivationRemarks("");
      loadAllergyRecords();
    }
  };

  const handleCancelDelete = () => {
    setPendingDeleteId(0);
    setDeActivationRemarks("");
  };

  const saveAllergy = async (overrides: Record<string, any> = {}) => {
    const payload = {
      id: editId,
      patientId,
      allergyId: selectedAllergenId,
      allergyName: allergenOptions.find((a) => Number(a.id) === Number(selectedAllergenId))?.name ?? "",
      allergyTypeId: selectedTypeId,
      allergyType: allergyTypes.find((t) => t.id === selectedTypeId)?.allergyTypeName ?? "",
      reaction,
      remarks,
      interactionSeverity: severity,
      clinicalStatus,
      verificationStatus,
      snomedCode: snomedCode || "",
      notKnownAllergy: notKnownAllergy ? 1 : 0,
      ...overrides,
    };

    return fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_PATIENT_ALLERGY_DETAILS,
      payload,
      {},
      { component: "AllergyPanel" }
    );
  };

  const handleNotKnownAllergyChange = async (checked: boolean) => {
    setNotKnownAllergy(checked);
    const resp = await saveAllergy({ notKnownAllergy: checked ? 1 : 0 });
    if (resp?.result) {
      showSuccess(checked ? "Marked as no known allergies" : "No known allergy status cleared");
    }
  };

  const handleSave = async () => {
    const resp = await saveAllergy();
    if (resp?.result) {
      showSuccess(editId > 0 ? "Updated successfully" : "Saved successfully");
      resetForm();
      loadAllergyRecords();
    }
  };

  const buildAllergySummary = () => {
    if (notKnownAllergy && allergyRecords.length === 0) return "No Known Allergy";

    const order: string[] = [];
    const groups: Record<string, string[]> = {};
    allergyRecords.forEach((r) => {
      if (!r.allergy) return;
      const type = r.allergyType || "Other";
      if (!groups[type]) {
        groups[type] = [];
        order.push(type);
      }
      groups[type].push(r.allergy);
    });

    return order.map((type) => `${type}: ${groups[type].join(",")}`).join(" ; ");
  };

  const allergySummary = buildAllergySummary();

  const handleBind = () => {
    onBind?.(allergySummary);
    onClose();
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3">
      <div className="bg-white w-full max-w-6xl h-full max-h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50 rounded-t-xl shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Allergy</h2>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="input-checkbox"
                checked={notKnownAllergy}
                onChange={(e) => handleNotKnownAllergyChange(e.target.checked)}
              />
              <span className="text-sm text-gray-700 font-medium">Not Known Allergies</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="save-btn"
              onClick={() => setShowAllergyMaster(true)}
            >
              Allergy Master
            </button>
            <button type="button" className="cancel-button" onClick={resetForm}>
              New
            </button>
            <button
              type="button"
              className={allergySummary ? "save-btn" : "disabled-btn"}
              onClick={handleBind}
              disabled={!allergySummary}
              title="Bind selected allergies to the consultation page"
            >
              Bind
            </button>
            <button type="button" className="close-drawer-btn" onClick={onClose}>
              &times;
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">

          <div className="w-72 shrink-0 border-r overflow-y-auto p-4 flex flex-col gap-1">

            <InputField label="Type Of Allergy">
              <select
                className="input-field"
                value={selectedTypeId}
                onChange={(e) => { setSelectedTypeId(Number(e.target.value)); setSelectedAllergenId(0); }}
              >
                <option value={0}>-- Select --</option>
                {allergyTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.allergyTypeName}</option>
                ))}
              </select>
            </InputField>

            <InputField label="Allergen Name">
              <select
                className="input-field"
                value={selectedAllergenId}
                onChange={(e) => handleAllergenChange(Number(e.target.value))}
              >
                <option value={0}>Select</option>
                {allergenOptions.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </InputField>

            <InputField label="SNOMED Code (optional)">
              <div className="relative" ref={snomedRef}>
                <div className="relative">
                  <input
                    type="text"
                    className="input-field !mb-0 pr-8"
                    placeholder="Search SNOMED concept…"
                    value={snomedQuery}
                    onChange={(e) => { setSnomedQuery(e.target.value); setSnomedCode(""); }}
                    onFocus={() => snomedResults.length > 0 && setShowSnomedDropdown(true)}
                  />
                  {snomedQuery && (
                    <button
                      type="button"
                      onClick={clearSnomed}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                    >
                      &times;
                    </button>
                  )}
                </div>

                {snomedCode && (
                  <p className="text-xs text-blue-600 mt-1 font-medium">Code: {snomedCode}</p>
                )}

                {(showSnomedDropdown || snomedLoading) && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-44 overflow-y-auto">
                    {snomedLoading ? (
                      <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>
                    ) : snomedResults.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-400">No results found</div>
                    ) : (
                      snomedResults.map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSnomedSelect(item)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-800">{item.term}</div>
                          <div className="text-xs text-gray-500">{item.conceptId}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </InputField>

            <InputField label="Reaction / Any Adverse Drug Event">
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Describe the reaction…"
                value={reaction}
                onChange={(e) => setReaction(e.target.value)}
              />
            </InputField>

            <InputField label="Remarks">
              <textarea
                className="input-field resize-none"
                rows={2}
                placeholder="Optional remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </InputField>

            <InputField label="Interaction Severity" required>
              <select
                className="input-field"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="">-- Select --</option>
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </InputField>

            <InputField label="Clinical Status">
              <select
                className="input-field"
                value={clinicalStatus}
                onChange={(e) => setClinicalStatus(e.target.value)}
              >
                <option value="">-- Select --</option>
                {CLINICAL_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </InputField>

            <InputField label="Verification Status">
              <select
                className="input-field"
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
              >
                <option value="">-- Select --</option>
                {VERIFICATION_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </InputField>

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                className={loading ? "disabled-btn flex-1" : "save-btn flex-1"}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving…" : editId > 0 ? "Update" : "Save"}
              </button>
              <button type="button" className="cancel-button" onClick={resetForm} disabled={loading}>
                Cancel
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">

            <div className="flex-1 overflow-auto">
              <table className="base-table w-full">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">#</th>
                    <th className="table-th">Date</th>
                    <th className="table-th">Allergy Type</th>
                    <th className="table-th">Allergy</th>
                    <th className="table-th">Reaction / Adverse Drug Event</th>
                    <th className="table-th">Remarks</th>
                    <th className="table-th">Severity</th>
                    <th className="table-th text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allergyRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="table-empty">Record not found</td>
                    </tr>
                  ) : (
                    allergyRecords.map((rec, i) => (
                      <tr key={rec.id} className="table-row">
                        <td className="table-td">{i + 1}</td>
                        <td className="table-td whitespace-nowrap">{rec.date}</td>
                        <td className="table-td">{rec.allergyType}</td>
                        <td className="table-td">{rec.allergy}</td>
                        <td className="table-td">{rec.reaction}</td>
                        <td className="table-td">{rec.remarks}</td>
                        <td className="table-td">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            rec.severity === "Major" ? "bg-red-50 text-red-600" :
                            rec.severity === "Moderate" ? "bg-orange-50 text-orange-600" :
                            rec.severity === "Minor" ? "bg-yellow-50 text-yellow-700" :
                            "bg-gray-50 text-gray-500"
                          }`}>
                            {rec.severity}
                          </span>
                        </td>
                        <td className="table-action text-center">
                          <button
                            type="button"
                            onClick={() => handleEdit(rec)}
                            className="inline-flex items-center px-2 py-1 rounded hover:bg-blue-50 transition"
                          >
                            <i className="fa-solid fa-edit icon-color-button" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(rec.id)}
                            className="inline-flex items-center px-2 py-1 rounded hover:bg-red-50 transition ml-1"
                          >
                            <i className="fa-solid fa-trash delete-icon" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t pt-3 shrink-0">
              <InputField label="De-Activation Remarks" required={pendingDeleteId > 0}>
                <textarea
                  ref={deActivationRef}
                  className={`input-field resize-none ${pendingDeleteId > 0 ? "!border-red-400 focus:!ring-red-300" : ""}`}
                  rows={2}
                  placeholder={pendingDeleteId > 0 ? "Required — enter remarks to confirm delete" : "Enter de-activation remarks if applicable"}
                  value={deActivationRemarks}
                  onChange={(e) => setDeActivationRemarks(e.target.value)}
                />
              </InputField>
              {pendingDeleteId > 0 && (
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    className={loading ? "disabled-btn flex-1" : "save-btn flex-1 !bg-red-500 hover:!bg-red-600"}
                    onClick={handleConfirmDelete}
                    disabled={loading}
                  >
                    {loading ? "Deleting…" : "Confirm Delete"}
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCancelDelete}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAllergyMaster && (
        <AllergyMasterPopup onClose={() => setShowAllergyMaster(false)} />
      )}
    </div>
  );
};

export default AllergyPanel;
