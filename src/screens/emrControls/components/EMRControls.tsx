import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { EmrSectionFormData, emrSectionSchema } from "@/validation/emrControlsSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Reorder, useDragControls } from "framer-motion";
import { Calculator, Eye, GripVertical, Pencil, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  EmrSectionItem,
  MasterHeaderItem,
  SectionHeaderMapping,
  SectionHeaderMappingItem,
  SectionHeaderMappingRecord,
} from "../types";
import SectionScoreFormula from "./SectionScoreFormula";

interface EmrSectionPayload extends EmrSectionFormData {
  headerMappings: { headerId: number; sequenceNo: number }[];
}

/** one draggable row in the "Controls in this Section" checklist — has its own drag
 * handle (not the whole row) so clicking the checkbox/text doesn't start a drag */
const SortableHeaderRow = ({
  item,
  checked,
  onToggle,
}: {
  item: SectionHeaderMappingItem;
  checked: boolean;
  onToggle: () => void;
}) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item value={item} as="tr" dragListener={false} dragControls={dragControls} className="table-row">
      <td className="table-td">
        <button
          type="button"
          onPointerDown={e => dragControls.start(e)}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical size={15} />
        </button>
      </td>
      <td className="table-td">
        <input type="checkbox" className="input-checkbox" checked={checked} onChange={onToggle} />
      </td>
      <td className="table-td font-medium text-gray-800">{item.headerName}</td>
      <td className="table-td text-gray-500">{item.displayName || "—"}</td>
      <td className="table-td text-gray-500">{item.controlType || "—"}</td>
    </Reorder.Item>
  );
};

const EMRControls = () => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();

  const [rows, setRows] = useState<SectionHeaderMappingItem[]>([]);
  const [checkedHeaderIds, setCheckedHeaderIds] = useState<Set<number>>(new Set());
  const [headerSearch, setHeaderSearch] = useState("");

  const [listActiveFilter, setListActiveFilter] = useState<number>(1);
  const [sectionSearch, setSectionSearch] = useState("");

  const [viewSection, setViewSection] = useState<EmrSectionItem | null>(null);
  const [viewHeaders, setViewHeaders] = useState<SectionHeaderMappingRecord[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  const [scoreSection, setScoreSection] = useState<EmrSectionItem | null>(null);

  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(emrSectionSchema),
    defaultValues: {
      sectionId: 0,
      sectionName: "",
      displayName: "",
      isActive: 1,
    },
  });

  const isEdit = Boolean(watch("sectionId"));
  const buttonTitle = isEdit ? "Update" : "Create";

  const getAllHeaders = async (): Promise<MasterHeaderItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_DOCTOR_HEADER_MASTER,
      {},
      {},
      { component: "EMRControls" }
    );
    return resp?.data ?? [];
  };

  const { data: headerCatalog = [] } = useQuery<MasterHeaderItem[]>({
    queryKey: ["getAllHeadersForSection"],
    queryFn: getAllHeaders,
  });

  const getSectionHeaderMapping = async (sectionId: number): Promise<SectionHeaderMappingRecord[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_EMR_SECTION_HEADER_MAPPING,
      {},
      { params: { sectionId } },
      { component: "EMRControls" }
    );
    const raw: any[] = resp?.data ?? [];
    return raw.map(m => ({
      mappingId: m.MappingId,
      sectionId: m.SectionId,
      headerId: m.HeaderId,
      headerName: m.HeaderName,
      displayName: m.DisplayName,
      controlType: m.ControlType,
      controlTypeId: m.ControlTypeId,
      sequenceNo: m.SequenceNo,
    }));
  };

  const buildRows = (mapping: SectionHeaderMapping[]) => {
    const sequenceByHeaderId = new Map(mapping.map(m => [m.headerId, m.sequenceNo]));

    const mapped = headerCatalog
      .filter(h => sequenceByHeaderId.has(h.headerId))
      .sort((a, b) => sequenceByHeaderId.get(a.headerId)! - sequenceByHeaderId.get(b.headerId)!);
    const unmapped = headerCatalog.filter(h => !sequenceByHeaderId.has(h.headerId));

    const data: SectionHeaderMappingItem[] = [...mapped, ...unmapped].map(h => ({
      headerId: h.headerId,
      headerName: h.headerName,
      displayName: h.displayName,
      controlType: h.controlType,
      mappingId: sequenceByHeaderId.has(h.headerId) ? 1 : 0,
      sequenceNo: sequenceByHeaderId.get(h.headerId) ?? 0,
    }));

    setRows(data);
    setCheckedHeaderIds(new Set(mapping.map(m => m.headerId)));
  };

  useEffect(() => {
    if (headerCatalog.length > 0) buildRows([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerCatalog]);

  const toggleHeaderId = (headerId: number) => {
    setCheckedHeaderIds(prev => {
      const updated = new Set(prev);
      if (updated.has(headerId)) updated.delete(headerId);
      else updated.add(headerId);
      return updated;
    });
  };

  const isAllChecked = rows.length > 0 && checkedHeaderIds.size === rows.length;

  const handleHeaderCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedHeaderIds(e.target.checked ? new Set(rows.map(r => r.headerId)) : new Set());
  };

  const filteredRows = useMemo(() => {
    const q = headerSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      r => r.headerName.toLowerCase().includes(q) || r.displayName?.toLowerCase().includes(q)
    );
  }, [rows, headerSearch]);

  const canReorder = headerSearch.trim() === "";

  const createUpdateSection = async (data: EmrSectionPayload) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_EMR_SECTION,
      data,
      {},
      { component: "EMRControls" }
    );
    return resp;
  };

  const mutation = useMutation<any, Error, EmrSectionPayload>({
    mutationKey: ["createUpdateEmrSection"],
    mutationFn: (data: EmrSectionPayload) => createUpdateSection(data),

    onSuccess: resp => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "Something went wrong");
        return;
      }
      showSuccess(resp?.message ?? "Section saved successfully");
      queryClient.invalidateQueries({ queryKey: ["getAllEmrSections"] });

      reset({ sectionId: 0, sectionName: "", displayName: "", isActive: 1 });
      buildRows([]);
    },

    onError: error => {
      showError(error?.message);
    },
  });

  const onsubmit = (data: EmrSectionFormData) => {
    if (checkedHeaderIds.size === 0) {
      showWarning("Please select at least one control for this section");
      return;
    }

    const checkedItems = rows.filter(r => checkedHeaderIds.has(r.headerId));

    const payload: EmrSectionPayload = {
      ...data,
      headerMappings: checkedItems.map((item, idx) => ({
        headerId: item.headerId,
        sequenceNo: idx + 1,
      })),
    };

    mutation.mutate(payload);
  };

  const getAllSections = async (): Promise<EmrSectionItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_EMR_SECTIONS,
      {},
      { params: { isActive: listActiveFilter } },
      { component: "EMRControls" }
    );
    const raw: any[] = resp?.data ?? [];
    return raw.map(s => ({
      sectionId: s.SectionId,
      sectionName: s.SectionName,
      displayName: s.DisplayName,
      isActive: s.IsActive,
    }));
  };

  const { data: sections = [] } = useQuery({
    queryKey: ["getAllEmrSections", listActiveFilter],
    queryFn: getAllSections,
  });

  const filteredSections = useMemo(() => {
    const q = sectionSearch.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(
      (s: EmrSectionItem) =>
        s.sectionName?.toLowerCase().includes(q) || s.displayName?.toLowerCase().includes(q)
    );
  }, [sections, sectionSearch]);

  const editHandler = async (section: EmrSectionItem) => {
    reset({
      sectionId: section?.sectionId ?? 0,
      sectionName: section?.sectionName ?? "",
      displayName: section?.displayName ?? "",
      isActive: section?.isActive ?? 1,
    });

    const mapping = await getSectionHeaderMapping(section?.sectionId ?? 0);
    buildRows(mapping.map(m => ({ headerId: m.headerId, sequenceNo: m.sequenceNo })));
  };

  const viewHandler = async (section: EmrSectionItem) => {
    setViewSection(section);
    setViewLoading(true);
    const mapping = await getSectionHeaderMapping(section.sectionId);
    setViewHeaders(mapping.sort((a, b) => a.sequenceNo - b.sequenceNo));
    setViewLoading(false);
  };

  const closeViewPopup = () => {
    setViewSection(null);
    setViewHeaders([]);
  };

  const cancelHandler = () => {
    reset({ sectionId: 0, sectionName: "", displayName: "", isActive: 1 });
    buildRows([]);
  };

  return (
    <>
      <div className="card mt-1">
        <div className="card-header">
          <h2 className="card-title">{isEdit ? "Edit Section" : "New Section"}</h2>
        </div>

        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            <InputField label="Section Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Allergy"
                {...register("sectionName")}
              />
              {errors.sectionName && <p className="input-field-error">{errors.sectionName.message}</p>}
            </InputField>

            <InputField label="Display Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Allergy"
                {...register("displayName")}
              />
              {errors.displayName && <p className="input-field-error">{errors.displayName.message}</p>}
            </InputField>

            <InputField label="Status" required>
              <select className="input-field" {...register("isActive")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </InputField>
          </div>

          {/* ── controls checklist ── */}
          <div className="mt-2">
            <div className="flex items-center justify-between mt-5 mb-2 gap-3 flex-wrap">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Controls ({checkedHeaderIds.size} / {rows.length} selected)
              </h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="input-checkbox"
                    checked={isAllChecked}
                    onChange={handleHeaderCheckAll}
                  />
                  Select all
                </label>
                <div className="relative w-48">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="input-field !mb-0 pl-9 !py-1.5 text-xs"
                    placeholder="Search controls…"
                    value={headerSearch}
                    onChange={e => setHeaderSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {!canReorder && (
              <p className="text-xs text-gray-400 mb-1">Clear search to drag &amp; reorder rows</p>
            )}

            <div className="table-scroll-wrapper">
              <div className="table-size lg:min-h-72 lg:max-h-72">
                <table className="base-table">
                  <thead className="table-head">
                    <tr>
                      <th className="table-th w-8"></th>
                      <th className="table-th w-8"></th>
                      <th className="table-th">Header Name</th>
                      <th className="table-th">Display Name</th>
                      <th className="table-th">Control Type</th>
                    </tr>
                  </thead>
                  {filteredRows.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={5} className="table-empty">
                          No controls found
                        </td>
                      </tr>
                    </tbody>
                  ) : canReorder ? (
                    <Reorder.Group as="tbody" axis="y" values={rows} onReorder={setRows}>
                      {rows.map(item => (
                        <SortableHeaderRow
                          key={item.headerId}
                          item={item}
                          checked={checkedHeaderIds.has(item.headerId)}
                          onToggle={() => toggleHeaderId(item.headerId)}
                        />
                      ))}
                    </Reorder.Group>
                  ) : (
                    <tbody>
                      {filteredRows.map(item => (
                        <tr key={item.headerId} className="table-row">
                          <td className="table-td"></td>
                          <td className="table-td">
                            <input
                              type="checkbox"
                              className="input-checkbox"
                              checked={checkedHeaderIds.has(item.headerId)}
                              onChange={() => toggleHeaderId(item.headerId)}
                            />
                          </td>
                          <td className="table-td font-medium text-gray-800">{item.headerName}</td>
                          <td className="table-td text-gray-500">{item.displayName || "—"}</td>
                          <td className="table-td text-gray-500">{item.controlType || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button" onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
        {!!loading && <CustomLoader isLoading={loading} />}
      </div>

      {/* ── section list ── */}
      <div className="card mt-1">
        <div className="card-header">
          <h2 className="card-title">EMR Sections</h2>
        </div>

        <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input-field !mb-0 pl-9 !py-1.5 text-xs"
              placeholder="Search sections…"
              value={sectionSearch}
              onChange={e => setSectionSearch(e.target.value)}
            />
          </div>
          <div className="w-32">
            <select
              className="input-field !mb-0 !py-1.5 text-xs w-full"
              value={listActiveFilter}
              onChange={e => setListActiveFilter(Number(e.target.value))}
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
        </div>

        <div className="table-scroll-wrapper">
          <div className="table-size">
            <table className="base-table">
              <thead className="table-head">
                <tr>
                  <th className="table-th">#</th>
                  <th className="table-th">Section Name</th>
                  <th className="table-th">Display Name</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="table-empty">
                      No sections found
                    </td>
                  </tr>
                ) : (
                  filteredSections.map((item: EmrSectionItem, i: number) => {
                    const active = Number(item.isActive) === 1;
                    return (
                      <tr key={item.sectionId} className="table-row">
                        <td className="table-td">{i + 1}</td>
                        <td className="table-td font-medium text-gray-800">{item.sectionName}</td>
                        <td className="table-td text-gray-500">{item.displayName}</td>
                        <td className="table-td">
                          <span className={`card-status ${active ? "active" : "inactive"}`}>
                            {active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="table-action text-center">
                          <button
                            type="button"
                            onClick={() => viewHandler(item)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-blue-50 text-blue-500 transition active:scale-90"
                            title="View"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => editHandler(item)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-blue-50 text-blue-500 transition active:scale-90 ml-1"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setScoreSection(item)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-blue-50 text-blue-500 transition active:scale-90 ml-1"
                            title="Score Formula"
                          >
                            <Calculator size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewSection && (
        <div className="fixed inset-0 z-999">
          <div className="popup-bg-overlay" />
          <div className="central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] max-w-md opacity-full">
            <div className="popup-header">
              <h2 className="popup-helper-text">
                {viewSection.displayName || viewSection.sectionName}
              </h2>
              <button onClick={closeViewPopup} className="close-drawer-btn">
                ×
              </button>
            </div>

            {viewLoading ? (
              <p className="table-empty">Loading…</p>
            ) : viewHeaders.length === 0 ? (
              <p className="table-empty">No controls mapped yet</p>
            ) : (
              <div className="table-scroll-wrapper">
                <div className="table-size">
                  <table className="base-table">
                    <thead className="table-head">
                      <tr>
                        <th className="table-th">#</th>
                        <th className="table-th">Header Name</th>
                        <th className="table-th">Control Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewHeaders.map((h, idx) => (
                        <tr key={h.mappingId} className="table-row">
                          <td className="table-td">{idx + 1}</td>
                          <td className="table-td font-medium text-gray-800">{h.headerName}</td>
                          <td className="table-td text-gray-500">{h.controlType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {scoreSection && (
        <SectionScoreFormula section={scoreSection} onClose={() => setScoreSection(null)} />
      )}
    </>
  );
};

export default EMRControls;
