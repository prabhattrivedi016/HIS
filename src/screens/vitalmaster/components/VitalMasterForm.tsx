import { useState, useEffect, useRef } from "react";
import InputField from "@/components/customInputField";
import useGlobalApi from "@/hooks/useGlobalApi";
import { ENDPOINTS } from "@/config/defaults";
import { showSuccess } from "@/utils/alert";

interface VitalUnit {
  id: number;
  unitName: string;
}

interface SnomedItem {
  conceptId: string;
  term: string;
  conceptFsn: string;
}

interface VitalRecord {
  vitalId: number;
  vitalName: string;
  unitID: number;
  unitName: string;
  minValue: string;
  maxValue: string;
  active: number;
  snomedCode?: string;
}

interface FormErrors {
  name?: string;
  unit?: string;
  min?: string;
  max?: string;
}

/* ── Unit Popup ────────────────────────────────────────────── */
const UnitPopup = ({
  existingUnits,
  onSave,
  onClose,
}: {
  existingUnits: VitalUnit[];
  onSave: (unit: VitalUnit) => void;
  onClose: () => void;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed) { setError("Unit name is required"); return; }
    if (existingUnits.some((u) => u.unitName.toLowerCase() === trimmed.toLowerCase())) {
      setError("Unit already exists"); return;
    }

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_VITAL_UNIT_MASTER,
      { id: 0, unitName: trimmed },
      {},
      { component: "VitalUnit" }
    );

    if (resp?.result !== false) {
      onSave({ id: resp?.data?.id ?? 0, unitName: trimmed });
    }
  };

  return (
    <>
      <div className="popup-bg-overlay" onClick={onClose} />
      <div className="central-popup opacity-full w-[90%] max-w-sm">
        <div className="popup-header">
          <h3 className="popup-helper-text">Add Unit</h3>
          <button className="close-drawer-btn" onClick={onClose}>&times;</button>
        </div>

        <InputField label="Unit Name" required>
          <input
            ref={inputRef}
            type="text"
            className="input-field"
            placeholder="e.g. mmHg, bpm, °C, mg/dL"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          {error && <p className="text-red-500 text-xs -mt-1">{error}</p>}
        </InputField>

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            className={loading ? "disabled-btn flex-1" : "save-btn flex-1"}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving…" : "Save"}
          </button>
          <button type="button" className="cancel-button flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

/* ── VitalMasterForm ───────────────────────────────────────── */
const VitalMasterForm = () => {
  const { loading, fetchApi } = useGlobalApi();

  /* form fields */
  const [name, setName] = useState("");
  const [unitOptions, setUnitOptions] = useState<VitalUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<VitalUnit | null>(null);
  const [showUnitPopup, setShowUnitPopup] = useState(false);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [isActive, setIsActive] = useState<number>(1);
  const [editId, setEditId] = useState<number>(0);
  const [records, setRecords] = useState<VitalRecord[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  /* snomed */
  const [snomedCode, setSnomedCode] = useState("");
  const [snomedResults, setSnomedResults] = useState<SnomedItem[]>([]);
  const [showSnomedDropdown, setShowSnomedDropdown] = useState(false);
  const [snomedLoading, setSnomedLoading] = useState(false);
  const snomedRef = useRef<HTMLDivElement>(null);
  const skipSnomedRef = useRef(false);

  /* ── on mount ── */
  useEffect(() => {
    loadUnitList();
    loadVitalList();
  }, []);

  /* ── close SNOMED dropdown on outside click ── */
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (snomedRef.current && !snomedRef.current.contains(e.target as Node)) {
        setShowSnomedDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  /* ── debounced SNOMED search (triggered by Vital Name typing) ── */
  useEffect(() => {
    if (skipSnomedRef.current) {
      skipSnomedRef.current = false;
      return;
    }
    const q = name.trim();
    if (!q || q.length < 2) {
      setSnomedResults([]);
      setShowSnomedDropdown(false);
      return;
    }
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
  }, [name]);

  /* ── API loaders ── */
  const loadUnitList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_VITAL_UNIT_MASTER_LIST,
      {},
      {},
      { component: "VitalMaster" }
    );
    if (resp?.result !== false) {
      const normalized: VitalUnit[] = (resp?.data ?? []).map((u: any) => ({
        id: u.id ?? u.unitID ?? u.unitId ?? 0,
        unitName: u.unitName ?? "",
      }));
      setUnitOptions(normalized);
    }
  };

  const loadVitalList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_VITAL_MASTER_LIST,
      {},
      { params: { isActive: 1 } },
      { component: "VitalMaster" }
    );
    if (resp?.result !== false) {
      setRecords(resp?.data ?? []);
    }
  };

  /* ── handlers ── */
  const handleUnitSave = (unit: VitalUnit) => {
    setUnitOptions((prev) => [...prev, unit]);
    setSelectedUnit(unit);
    setShowUnitPopup(false);
    setErrors((p) => ({ ...p, unit: undefined }));
  };

  const handleSnomedSelect = (item: SnomedItem) => {
    skipSnomedRef.current = true;
    setName(item.term);
    setSnomedCode(item.conceptId);
    setSnomedResults([]);
    setShowSnomedDropdown(false);
    setErrors((p) => ({ ...p, name: undefined }));
  };

  const clearSnomed = () => {
    setSnomedCode("");
    setSnomedResults([]);
    setShowSnomedDropdown(false);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Vital name is required";
    if (!selectedUnit) newErrors.unit = "Please select a unit";
    if (!min.trim()) newErrors.min = "Min range is required";
    if (!max.trim()) newErrors.max = "Max range is required";
    if (min && max && Number(min) >= Number(max))
      newErrors.max = "Max must be greater than Min";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (r: VitalRecord) => {
    skipSnomedRef.current = true;
    setName(r.vitalName);
    const unit = unitOptions.find((u) => u.unitName === r.unitName) ?? { id: r.unitID, unitName: r.unitName };
    setSelectedUnit(unit);
    setMin(r.minValue);
    setMax(r.maxValue);
    setIsActive(r.active === 0 ? 0 : 1);
    setEditId(r.vitalId);
    setSnomedCode(r.snomedCode ?? "");
    setErrors({});
  };

  const handleSave = async () => {
    if (!validate()) return;

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_VITAL_MASTER,
      {
        vitalId: editId,
        vitalName: name.trim(),
        unitId: selectedUnit?.id ?? 0,
        unitName: selectedUnit?.unitName ?? "",
        minValue: min,
        maxValue: max,
        active: isActive,
        snomedCode: snomedCode || null,
      },
      {},
      { component: "VitalMaster" }
    );

    if (resp?.result !== false) {
      showSuccess(editId > 0 ? "Updated successfully" : "Saved successfully");
      handleCancel();
      loadVitalList();
    }
  };

  const handleCancel = () => {
    setName("");
    setSelectedUnit(null);
    setMin("");
    setMax("");
    setIsActive(1);
    setEditId(0);
    setErrors({});
    clearSnomed();
  };

  return (
    <>
      {/* ── FORM CARD ── */}
      <div className="card mt-4">
        <div className="card-header">
          <h2 className="card-title">{editId > 0 ? "Edit Vital Attribute" : "Add Vital Attribute"}</h2>
        </div>

        <div className="form-grid-4">
          {/* Vital Name — SNOMED dropdown anchored here */}
          <InputField label="Vital Name" required>
            <div className="relative" ref={snomedRef}>
              <input
                type="text"
                className="input-field !mb-0"
                placeholder="e.g. Blood Pressure"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
              />

              {(showSnomedDropdown || snomedLoading) && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
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
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </InputField>

          {/* SNOMED Code — direct entry or auto-filled from dropdown above */}
          <InputField label="SNOMED Code (optional)">
            <div className="relative">
              <input
                type="text"
                className="input-field !mb-0 pr-8"
                placeholder="Auto-filled or enter code directly"
                value={snomedCode}
                onChange={(e) => setSnomedCode(e.target.value)}
              />
              {snomedCode && (
                <button
                  type="button"
                  onClick={clearSnomed}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  &times;
                </button>
              )}
            </div>
          </InputField>

          {/* Unit */}
          <InputField label="Unit" required>
            <div className="flex gap-2 items-center">
              <select
                className="input-field !mb-0 flex-1"
                value={selectedUnit != null ? String(unitOptions.findIndex((u) => u.unitName === selectedUnit.unitName)) : ""}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  const unit = idx >= 0 && idx < unitOptions.length ? unitOptions[idx] : null;
                  setSelectedUnit(unit);
                  setErrors((p) => ({ ...p, unit: undefined }));
                }}
              >
                <option value="-1">
                  {unitOptions.length === 0 ? "No units yet" : "Select unit…"}
                </option>
                {unitOptions.map((u, idx) => (
                  <option key={idx} value={String(idx)}>{u.unitName}</option>
                ))}
              </select>

              <button
                type="button"
                title="Add new unit"
                onClick={() => setShowUnitPopup(true)}
                className="flex items-center justify-center w-9 h-9 rounded-lg border-2 border-dashed border-blue-400 text-blue-500 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700 transition active:scale-90 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {unitOptions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {unitOptions.map((u) => (
                  <span
                    key={u.id}
                    onClick={() => {
                      setSelectedUnit(u);
                      setErrors((p) => ({ ...p, unit: undefined }));
                    }}
                    className={`cursor-pointer text-xs px-2.5 py-0.5 rounded-full border font-medium transition-all select-none
                      ${selectedUnit != null && selectedUnit.unitName === u.unitName
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-gray-50 text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                      }`}
                  >
                    {u.unitName}
                  </span>
                ))}
              </div>
            )}
            {errors.unit && (
              <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
            )}
          </InputField>

          {/* Min Range */}
          <InputField label="Min Range" required>
            <input
              type="number"
              className="input-field"
              placeholder="e.g. 60"
              value={min}
              onChange={(e) => {
                setMin(e.target.value);
                setErrors((p) => ({ ...p, min: undefined }));
              }}
            />
            {errors.min && (
              <p className="text-red-500 text-xs -mt-1 mb-1">{errors.min}</p>
            )}
          </InputField>

          {/* Max Range */}
          <InputField label="Max Range" required>
            <input
              type="number"
              className="input-field"
              placeholder="e.g. 120"
              value={max}
              onChange={(e) => {
                setMax(e.target.value);
                setErrors((p) => ({ ...p, max: undefined }));
              }}
            />
            {errors.max && (
              <p className="text-red-500 text-xs -mt-1 mb-1">{errors.max}</p>
            )}
          </InputField>

          {/* Status */}
          <InputField label="Status" required>
            <select
              className="input-field"
              value={isActive}
              onChange={(e) => setIsActive(Number(e.target.value))}
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </InputField>
        </div>

        <div className="form-actions-responsive mt-2">
          <button
            type="button"
            className={loading ? "disabled-btn" : "save-btn"}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving…" : editId > 0 ? "Update" : "Save"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* ── RECORDS TABLE ── */}
      <div className="card mt-4">
        <div className="card-header">
          <h2 className="card-title">Vital List</h2>
          <span className="text-sm text-gray-500 font-medium bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
            {records.length} {records.length === 1 ? "record" : "records"}
          </span>
        </div>

        <div className="table-scroll-wrapper">
          <div className="table-size lg:min-h-60 lg:max-h-60">
            <table className="base-table">
              <thead className="table-head">
                <tr>
                  <th className="table-th">#</th>
                  <th className="table-th">Vital Name</th>
                  <th className="table-th">Unit</th>
                  <th className="table-th">Min Value</th>
                  <th className="table-th">Max Value</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty">No vital attributes added yet</td>
                  </tr>
                ) : (
                  records.map((r, i) => (
                    <tr key={r.vitalId} className="table-row">
                      <td className="table-td">{i + 1}</td>
                      <td className="table-td font-medium text-gray-800">{r.vitalName}</td>
                      <td className="table-td">{r.unitName}</td>
                      <td className="table-td">{r.minValue}</td>
                      <td className="table-td">{r.maxValue}</td>
                      <td className="table-td">
                        <span className={`card-status ${r.active === 0 ? "inactive" : "active"}`}>
                          {r.active === 0 ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="table-action text-center">
                        <button
                          type="button"
                          onClick={() => handleEdit(r)}
                          className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm font-medium transition active:scale-90 px-2 py-1 rounded hover:bg-blue-50"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── UNIT POPUP ── */}
      {showUnitPopup && (
        <UnitPopup
          existingUnits={unitOptions}
          onSave={handleUnitSave}
          onClose={() => setShowUnitPopup(false)}
        />
      )}
    </>
  );
};

export default VitalMasterForm;
