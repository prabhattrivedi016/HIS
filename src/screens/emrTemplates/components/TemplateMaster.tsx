import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { EmrSectionItem } from "@/screens/emrControls/types";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { TemplateFormData, templateSchema } from "@/validation/templateMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Reorder, useDragControls } from "framer-motion";
import { Eye, GripVertical, Pencil, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  TemplateCategoryItem,
  TemplateItem,
  TemplateSectionMapping,
  TemplateSectionMappingItem,
  TemplateSectionMappingRecord,
} from "../types";
import TemplateCategoryPopup from "./TemplateCategoryPopup";

interface TemplatePayload extends TemplateFormData {
  sectionMappings: { sectionId: number; sequenceNo: number }[];
}

/** one draggable row in the "Sections in this Template" checklist — mirrors EMRControls.tsx's
 * SortableHeaderRow, swapping headers for EMR Sections */
const SortableSectionRow = ({
  item,
  checked,
  onToggle,
}: {
  item: TemplateSectionMappingItem;
  checked: boolean;
  onToggle: () => void;
}) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      as="tr"
      dragListener={false}
      dragControls={dragControls}
      className="table-row"
    >
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
      <td className="table-td font-medium text-gray-800">{item.sectionName}</td>
      <td className="table-td text-gray-500">{item.displayName || "—"}</td>
    </Reorder.Item>
  );
};

const TemplateMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();

  const [rows, setRows] = useState<TemplateSectionMappingItem[]>([]);
  const [checkedSectionIds, setCheckedSectionIds] = useState<Set<number>>(new Set());
  const [sectionSearch, setSectionSearch] = useState("");

  const [listActiveFilter, setListActiveFilter] = useState<number>(1);
  const [templateSearch, setTemplateSearch] = useState("");

  const [viewTemplate, setViewTemplate] = useState<TemplateItem | null>(null);
  const [viewSections, setViewSections] = useState<TemplateSectionMappingRecord[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  const [showCategoryPopup, setShowCategoryPopup] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(templateSchema),
    defaultValues: {
      templateId: 0,
      templateName: "",
      displayName: "",
      templateCategoryId: 0,
      isActive: 1,
    },
  });

  const isEdit = Boolean(watch("templateId"));
  const buttonTitle = isEdit ? "Update" : "Create";

  const getCategories = async (): Promise<TemplateCategoryItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_TEMPLATE_CATEGORY_LIST,
      {},
      {},
      { component: "TemplateMaster", silent: true }
    );
    const raw: any[] = resp?.data ?? [];
    return raw.map(c => ({
      templateCategoryId: c.TemplateCategoryId ?? c.templateCategoryId,
      categoryName: c.CategoryName ?? c.categoryName ?? "",
      isActive: c.IsActive ?? c.isActive ?? 1,
    }));
  };

  const { data: categoryList = [] } = useQuery<TemplateCategoryItem[]>({
    queryKey: ["getTemplateCategoryList"],
    queryFn: getCategories,
  });

  // a category created via the "+" popup is selected immediately (no need to wait for the list
  // above to refetch) while still invalidating the query so the dropdown itself picks it up too
  const handleCategoryCreated = (category: TemplateCategoryItem) => {
    setValue("templateCategoryId", category.templateCategoryId, { shouldValidate: true });
    queryClient.invalidateQueries({ queryKey: ["getTemplateCategoryList"] });
  };

  // sections catalog — reuses the real, already-working GET_ALL_EMR_SECTIONS (a Template is a
  // curated bundle of these, not its own header composition)
  const getAllSectionsForCatalog = async (): Promise<EmrSectionItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_EMR_SECTIONS,
      {},
      { params: { isActive: 1 } },
      { component: "TemplateMaster" }
    );
    const raw: any[] = resp?.data ?? [];
    return raw.map(s => ({
      sectionId: s.SectionId,
      sectionName: s.SectionName,
      displayName: s.DisplayName,
      isActive: s.IsActive,
    }));
  };

  const { data: sectionCatalog = [] } = useQuery<EmrSectionItem[]>({
    queryKey: ["getAllEmrSectionsForTemplateCatalog"],
    queryFn: getAllSectionsForCatalog,
  });

  // UNVERIFIED — GET_TEMPLATE_SECTION_MAPPING is a guessed endpoint, see config/defaults/index.ts
  const getTemplateSectionMapping = async (
    templateId: number
  ): Promise<TemplateSectionMappingRecord[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_TEMPLATE_SECTION_MAPPING,
      {},
      { params: { templateId } },
      { component: "TemplateMaster", silent: true }
    );
    const raw: any[] = resp?.data ?? [];
    return raw.map(m => ({
      mappingId: m.MappingId,
      templateId: m.TemplateId,
      sectionId: m.SectionId,
      sectionName: m.SectionName,
      displayName: m.DisplayName,
      sequenceNo: m.SequenceNo,
    }));
  };

  const buildRows = (mapping: TemplateSectionMapping[]) => {
    const sequenceBySectionId = new Map(mapping.map(m => [m.sectionId, m.sequenceNo]));

    const mapped = sectionCatalog
      .filter(s => sequenceBySectionId.has(s.sectionId))
      .sort((a, b) => sequenceBySectionId.get(a.sectionId)! - sequenceBySectionId.get(b.sectionId)!);
    const unmapped = sectionCatalog.filter(s => !sequenceBySectionId.has(s.sectionId));

    const data: TemplateSectionMappingItem[] = [...mapped, ...unmapped].map(s => ({
      sectionId: s.sectionId,
      sectionName: s.sectionName,
      displayName: s.displayName,
      mappingId: sequenceBySectionId.has(s.sectionId) ? 1 : 0,
      sequenceNo: sequenceBySectionId.get(s.sectionId) ?? 0,
    }));

    setRows(data);
    setCheckedSectionIds(new Set(mapping.map(m => m.sectionId)));
  };

  useEffect(() => {
    if (sectionCatalog.length > 0) buildRows([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionCatalog]);

  const toggleSectionId = (sectionId: number) => {
    setCheckedSectionIds(prev => {
      const updated = new Set(prev);
      if (updated.has(sectionId)) updated.delete(sectionId);
      else updated.add(sectionId);
      return updated;
    });
  };

  const isAllChecked = rows.length > 0 && checkedSectionIds.size === rows.length;

  const handleSectionCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedSectionIds(e.target.checked ? new Set(rows.map(r => r.sectionId)) : new Set());
  };

  const filteredRows = useMemo(() => {
    const q = sectionSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      r => r.sectionName.toLowerCase().includes(q) || r.displayName?.toLowerCase().includes(q)
    );
  }, [rows, sectionSearch]);

  const canReorder = sectionSearch.trim() === "";

  const createUpdateTemplate = async (data: TemplatePayload) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_TEMPLATE,
      data,
      {},
      { component: "TemplateMaster" }
    );
    return resp;
  };

  const mutation = useMutation<any, Error, TemplatePayload>({
    mutationKey: ["createUpdateTemplate"],
    mutationFn: (data: TemplatePayload) => createUpdateTemplate(data),

    onSuccess: resp => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "Something went wrong");
        return;
      }
      showSuccess(resp?.message ?? "Template saved successfully");
      queryClient.invalidateQueries({ queryKey: ["getAllTemplates"] });

      reset({ templateId: 0, templateName: "", displayName: "", templateCategoryId: 0, isActive: 1 });
      buildRows([]);
    },

    onError: error => {
      showError(error?.message);
    },
  });

  const onsubmit = (data: TemplateFormData) => {
    if (checkedSectionIds.size === 0) {
      showWarning("Please select at least one section for this template");
      return;
    }

    const checkedItems = rows.filter(r => checkedSectionIds.has(r.sectionId));

    const payload: TemplatePayload = {
      ...data,
      sectionMappings: checkedItems.map((item, idx) => ({
        sectionId: item.sectionId,
        sequenceNo: idx + 1,
      })),
    };

    mutation.mutate(payload);
  };

  // UNVERIFIED — GET_ALL_TEMPLATES is a guessed endpoint, see config/defaults/index.ts
  const getAllTemplates = async (): Promise<TemplateItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_TEMPLATES,
      {},
      { params: { isActive: listActiveFilter } },
      { component: "TemplateMaster", silent: true }
    );
    const raw: any[] = resp?.data ?? [];
    return raw.map(t => ({
      templateId: t.TemplateId,
      templateName: t.TemplateName,
      displayName: t.DisplayName,
      templateCategoryId: t.TemplateCategoryId,
      categoryName: t.CategoryName,
      isActive: t.IsActive,
    }));
  };

  const { data: templates = [] } = useQuery({
    queryKey: ["getAllTemplates", listActiveFilter],
    queryFn: getAllTemplates,
  });

  const filteredTemplates = useMemo(() => {
    const q = templateSearch.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t: TemplateItem) =>
        t.templateName?.toLowerCase().includes(q) || t.displayName?.toLowerCase().includes(q)
    );
  }, [templates, templateSearch]);

  const editHandler = async (template: TemplateItem) => {
    reset({
      templateId: template?.templateId ?? 0,
      templateName: template?.templateName ?? "",
      displayName: template?.displayName ?? "",
      templateCategoryId: template?.templateCategoryId ?? 0,
      isActive: template?.isActive ?? 1,
    });

    const mapping = await getTemplateSectionMapping(template?.templateId ?? 0);
    buildRows(mapping.map(m => ({ sectionId: m.sectionId, sequenceNo: m.sequenceNo })));
  };

  const viewHandler = async (template: TemplateItem) => {
    setViewTemplate(template);
    setViewLoading(true);
    const mapping = await getTemplateSectionMapping(template.templateId);
    setViewSections(mapping.sort((a, b) => a.sequenceNo - b.sequenceNo));
    setViewLoading(false);
  };

  const closeViewPopup = () => {
    setViewTemplate(null);
    setViewSections([]);
  };

  const cancelHandler = () => {
    reset({ templateId: 0, templateName: "", displayName: "", templateCategoryId: 0, isActive: 1 });
    buildRows([]);
  };

  return (
    <>
      <div className="card mt-1">
        <div className="card-header">
          <h2 className="card-title">{isEdit ? "Edit Template" : "New Template"}</h2>
        </div>

        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            <InputField label="Template Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Radio Therapy Description Chart"
                {...register("templateName")}
              />
              {errors.templateName && (
                <p className="input-field-error">{errors.templateName.message}</p>
              )}
            </InputField>

            <InputField label="Display Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Radio Therapy Description Chart"
                {...register("displayName")}
              />
              {errors.displayName && (
                <p className="input-field-error">{errors.displayName.message}</p>
              )}
            </InputField>

            <InputField label="Template Category" required>
              <div className="flex gap-2 items-center">
                <select className="input-field" {...register("templateCategoryId")}>
                  <option value={0}>--Select--</option>
                  {categoryList.map((c: TemplateCategoryItem) => (
                    <option key={c.templateCategoryId} value={c.templateCategoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="-mt-1"
                  onClick={() => setShowCategoryPopup(true)}
                  title="Add template category"
                >
                  <Plus size={18} className="add-popup-icon" />
                </button>
              </div>
              {errors.templateCategoryId && (
                <p className="input-field-error">{errors.templateCategoryId.message}</p>
              )}
            </InputField>

            <InputField label="Status" required>
              <select className="input-field" {...register("isActive")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </InputField>
          </div>

          {/* ── sections checklist ── */}
          <div className="mt-2">
            <div className="flex items-center justify-between mt-5 mb-2 gap-3 flex-wrap">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Sections ({checkedSectionIds.size} / {rows.length} selected)
              </h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="input-checkbox"
                    checked={isAllChecked}
                    onChange={handleSectionCheckAll}
                  />
                  Select all
                </label>
                <div className="relative w-48">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    className="input-field !mb-0 pl-9 !py-1.5 text-xs"
                    placeholder="Search sections…"
                    value={sectionSearch}
                    onChange={e => setSectionSearch(e.target.value)}
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
                      <th className="table-th">Section Name</th>
                      <th className="table-th">Display Name</th>
                    </tr>
                  </thead>
                  {filteredRows.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={4} className="table-empty">
                          No sections found
                        </td>
                      </tr>
                    </tbody>
                  ) : canReorder ? (
                    <Reorder.Group as="tbody" axis="y" values={rows} onReorder={setRows}>
                      {rows.map(item => (
                        <SortableSectionRow
                          key={item.sectionId}
                          item={item}
                          checked={checkedSectionIds.has(item.sectionId)}
                          onToggle={() => toggleSectionId(item.sectionId)}
                        />
                      ))}
                    </Reorder.Group>
                  ) : (
                    <tbody>
                      {filteredRows.map(item => (
                        <tr key={item.sectionId} className="table-row">
                          <td className="table-td"></td>
                          <td className="table-td">
                            <input
                              type="checkbox"
                              className="input-checkbox"
                              checked={checkedSectionIds.has(item.sectionId)}
                              onChange={() => toggleSectionId(item.sectionId)}
                            />
                          </td>
                          <td className="table-td font-medium text-gray-800">
                            {item.sectionName}
                          </td>
                          <td className="table-td text-gray-500">{item.displayName || "—"}</td>
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

      {/* ── template list ── */}
      <div className="card mt-1">
        <div className="card-header">
          <h2 className="card-title">Templates</h2>
        </div>

        <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input-field !mb-0 pl-9 !py-1.5 text-xs"
              placeholder="Search templates…"
              value={templateSearch}
              onChange={e => setTemplateSearch(e.target.value)}
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
                  <th className="table-th">Template Name</th>
                  <th className="table-th">Display Name</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      No templates found
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map((item: TemplateItem, i: number) => {
                    const active = Number(item.isActive) === 1;
                    return (
                      <tr key={item.templateId} className="table-row">
                        <td className="table-td">{i + 1}</td>
                        <td className="table-td font-medium text-gray-800">
                          {item.templateName}
                        </td>
                        <td className="table-td text-gray-500">{item.displayName}</td>
                        <td className="table-td text-gray-500">{item.categoryName}</td>
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

      {viewTemplate && (
        <div className="fixed inset-0 z-999">
          <div className="popup-bg-overlay" />
          <div className="central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] max-w-md opacity-full">
            <div className="popup-header">
              <h2 className="popup-helper-text">
                {viewTemplate.displayName || viewTemplate.templateName}
              </h2>
              <button onClick={closeViewPopup} className="close-drawer-btn">
                ×
              </button>
            </div>

            {viewLoading ? (
              <p className="table-empty">Loading…</p>
            ) : viewSections.length === 0 ? (
              <p className="table-empty">No sections mapped yet</p>
            ) : (
              <div className="table-scroll-wrapper">
                <div className="table-size">
                  <table className="base-table">
                    <thead className="table-head">
                      <tr>
                        <th className="table-th">#</th>
                        <th className="table-th">Section Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewSections.map((s, idx) => (
                        <tr key={s.mappingId} className="table-row">
                          <td className="table-td">{idx + 1}</td>
                          <td className="table-td font-medium text-gray-800">{s.sectionName}</td>
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

      {showCategoryPopup && (
        <TemplateCategoryPopup
          isOpen={showCategoryPopup}
          onClose={() => setShowCategoryPopup(false)}
          onCreated={handleCategoryCreated}
        />
      )}
    </>
  );
};

export default TemplateMaster;
