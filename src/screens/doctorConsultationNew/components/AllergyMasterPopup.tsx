import InputField from "@/components/customInputField";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { showSuccess } from "@/utils/alert";
import { useEffect, useRef, useState } from "react";

interface SnomedItem {
  conceptId: string;
  term: string;
}

interface AllergyMasterItem {
  AllergyId: number;
  AllergyName: string;
  AllergyTypeId: number;
  AllergyType: string;
  SnomedCode: string;
  IsActive: number;
}

const AllergyMasterPopup = ({ onClose }: { onClose: () => void }) => {
  const { loading, fetchApi } = useGlobalApi();

  const { pickMasterValue } = usePickMaster("AllergyTypeName");
  const allergyTypes = pickMasterValue.map((item: PickMasterItem) => ({
    id: Number(item.key),
    allergyTypeName: item.value as string,
  }));

  const [selectedTypeId, setSelectedTypeId] = useState<number>(0);

  useEffect(() => {
    if (allergyTypes.length > 0 && selectedTypeId === 0) {
      setSelectedTypeId(allergyTypes[0].id);
    }
  }, [allergyTypes]);

  const [allergyName, setAllergyName] = useState("");
  const [snomedCode, setSnomedCode] = useState("");
  const [status, setStatus] = useState<number>(1);
  const [editId, setEditId] = useState<number>(0);

  const [snomedResults, setSnomedResults] = useState<SnomedItem[]>([]);
  const [showSnomedDropdown, setShowSnomedDropdown] = useState(false);
  const [snomedLoading, setSnomedLoading] = useState(false);
  const snomedRef = useRef<HTMLDivElement>(null);
  const skipSnomedRef = useRef(false);

  const [allergyList, setAllergyList] = useState<AllergyMasterItem[]>([]);

  const loadList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALLERGY_MASTER_LIST,
      {},
      {},
      { component: "AllergyMasterPopup" }
    );
    setAllergyList(resp?.data ?? []);
  };

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (snomedRef.current && !snomedRef.current.contains(e.target as Node))
        setShowSnomedDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (skipSnomedRef.current) {
      skipSnomedRef.current = false;
      return;
    }
    const q = allergyName.trim();
    if (!q || q.length < 2) {
      setSnomedResults([]);
      setShowSnomedDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSnomedLoading(true);
      try {
        const url =
          `http://localhost:8080/csnoserv/api/search/search?term=${encodeURIComponent(q)}` +
          `&state=active&semantictag=finding&acceptability=preferred&returnlimit=50`;
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
  }, [allergyName]);

  const handleSnomedSelect = (item: SnomedItem) => {
    skipSnomedRef.current = true;
    setAllergyName(item.term);
    setSnomedCode(item.conceptId);
    setSnomedResults([]);
    setShowSnomedDropdown(false);
  };

  const resetForm = () => {
    setAllergyName("");
    setSnomedCode("");
    setStatus(1);
    setEditId(0);
    setSnomedResults([]);
    setShowSnomedDropdown(false);
  };

  const handleSave = async () => {
    if (!allergyName.trim()) return;

    const payload = {
      allergyId: editId,
      allergyTypeId: selectedTypeId,
      allergyType: allergyTypes.find(t => t.id === selectedTypeId)?.allergyTypeName ?? "",
      allergyName: allergyName.trim(),
      snomedCode: snomedCode || null,
      active: status,
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_ALLERGY_MASTER,
      payload,
      {},
      { component: "AllergyMasterPopup" }
    );

    if (resp?.result) {
      showSuccess(editId > 0 ? "Updated successfully" : "Saved successfully");
      resetForm();
      loadList();
    }
  };

  const handleEdit = (item: AllergyMasterItem) => {
    skipSnomedRef.current = true;
    setEditId(item.AllergyId);
    setAllergyName(item.AllergyName);
    setSnomedCode(item.SnomedCode ?? "");
    setStatus(item.IsActive);
    setSelectedTypeId(item.AllergyTypeId);
  };

  const handleDelete = async (id: number) => {
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.DELETE_ALLERGY_MASTER,
      {},
      { params: { allergyId: id } },
      { component: "AllergyMasterPopup" }
    );
    if (resp?.result) {
      setAllergyList(prev => prev.filter(i => i.AllergyId !== id));
    }
  };

  const visibleList = allergyList.filter(a => a.AllergyTypeId === selectedTypeId);

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/30" onClick={onClose} />

      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col pointer-events-auto max-h-[92vh]">
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50 rounded-t-xl shrink-0">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              Allergy Master
            </h3>
            <button className="close-drawer-btn" onClick={onClose}>
              &times;
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            <InputField label="Allergy Type">
              <select
                className="input-field"
                value={selectedTypeId}
                onChange={e => setSelectedTypeId(Number(e.target.value))}
              >
                {allergyTypes.length === 0 && <option value={0}>Loading…</option>}
                {allergyTypes.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.allergyTypeName}
                  </option>
                ))}
              </select>
            </InputField>

            <div className="border rounded-lg p-4 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField label="Allergy Name" required>
                <div className="relative" ref={snomedRef}>
                  <input
                    type="text"
                    className="input-field !mb-0"
                    placeholder="Type to search SNOMED or enter name…"
                    value={allergyName}
                    onChange={e => {
                      setAllergyName(e.target.value);
                      setSnomedCode("");
                    }}
                  />

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
                            onMouseDown={e => e.preventDefault()}
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

              <InputField label="SNOMED Code (optional)">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Auto-filled or enter code directly"
                  value={snomedCode}
                  onChange={e => setSnomedCode(e.target.value)}
                />
              </InputField>

              <InputField label="Status" required>
                <select
                  className="input-field"
                  value={status}
                  onChange={e => setStatus(Number(e.target.value))}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </InputField>

              <div className="flex items-end gap-2 pb-4">
                <button
                  type="button"
                  className={loading ? "disabled-btn flex-1" : "save-btn flex-1"}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving…" : editId > 0 ? "Update" : "Save"}
                </button>
                {editId > 0 && (
                  <button type="button" className="cancel-button" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="table-scroll-wrapper">
              <div className="table-size lg:max-h-56">
                <table className="base-table">
                  <thead className="table-head">
                    <tr>
                      <th className="table-th">#</th>
                      <th className="table-th">Allergy Name</th>
                      <th className="table-th">SNOMED Code</th>
                      <th className="table-th">Status</th>
                      <th className="table-th text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    ) : (
                      visibleList.map((item, i) => (
                        <tr key={item.AllergyId} className="table-row">
                          <td className="table-td">{i + 1}</td>
                          <td className="table-td font-medium text-gray-800">{item.AllergyName}</td>
                          <td className="table-td text-xs text-gray-500">
                            {item.SnomedCode || "—"}
                          </td>
                          <td className="table-td">
                            <span
                              className={`card-status ${item.IsActive === 1 ? "active" : "inactive"}`}
                            >
                              {item.IsActive === 1 ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="table-action text-center">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm font-medium transition px-2 py-1 rounded hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.AllergyId)}
                              className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium transition px-2 py-1 rounded hover:bg-red-50 ml-1"
                            >
                              Delete
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
        </div>
      </div>
    </>
  );
};

export default AllergyMasterPopup;
