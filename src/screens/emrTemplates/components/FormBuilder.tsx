import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { CustomFormData, customFormSchema } from "@/validation/templateMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Reorder, useDragControls } from "framer-motion";
import { Eye, GripVertical, Layers, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CustomFormBlock, CustomFormCategory, CustomFormField, CustomFormItem } from "../types";
import ParameterEditorPopup from "./ParameterEditorPopup";

interface CustomFormPayload extends CustomFormData {
  blocks: CustomFormBlock[];
}

/** where a "+ Add Parameter"/edit action should land — the popup itself stays agnostic of this */
type ParameterPopupTarget =
  | { mode: "add"; location: "direct" }
  | { mode: "add"; location: "category"; blockIndex: number }
  | { mode: "edit"; location: "direct"; blockIndex: number }
  | { mode: "edit"; location: "category"; blockIndex: number; fieldIndex: number };

/** renders one field's control per its type — disabled preview on the canvas, live/fillable in
 * the View popup. Shared so the two surfaces can't drift apart. */
const FieldPreview = ({ field, interactive }: { field: CustomFormField; interactive: boolean }) => {
  if (field.fieldType === "text") {
    return (
      <input
        type="text"
        disabled={!interactive}
        className={`input-field !mb-0 ${interactive ? "" : "bg-gray-50 text-gray-400"}`}
        placeholder={interactive ? "" : "Answer"}
      />
    );
  }

  if (field.fieldType === "dropdown") {
    return (
      <select
        disabled={!interactive}
        className={`input-field !mb-0 ${interactive ? "" : "bg-gray-50 text-gray-400"}`}
      >
        <option value="">--Select--</option>
        {(field.options ?? []).map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  // radio
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {(field.options ?? []).map(opt => (
        <label key={opt} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
          <input
            type="radio"
            name={`preview-${field.fieldId}-${field.labelText}`}
            disabled={!interactive}
            className="w-4 h-4 accent-blue-500"
          />
          {opt}
        </label>
      ))}
      {field.hasComments && (
        <input
          type="text"
          disabled={!interactive}
          placeholder="Comments"
          className={`input-field !mb-0 flex-1 min-w-40 ${interactive ? "" : "bg-gray-50 text-gray-400"}`}
        />
      )}
    </div>
  );
};

/** renders a block tree as an actual live form — category blocks as a gray section bar over their
 * fields, direct fields inline. Shared by the live right-side preview panel (fed the in-progress
 * `blocks` state) and the saved-form View popup (fed `viewBlocks`), so "as it is" always means the
 * same thing in both places. */
const RenderedForm = ({ blocks }: { blocks: CustomFormBlock[] }) => {
  if (blocks.length === 0) {
    return <p className="table-empty">Nothing here yet</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, idx) =>
        block.blockType === "category" ? (
          <div key={idx} className="border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-slate-100 px-3 py-2 border-b border-gray-200">
              <span className="text-sm font-bold uppercase tracking-wide text-slate-700">
                {block.category.categoryName || "Untitled Category"}
              </span>
            </div>
            <div className="p-3 flex flex-col gap-3">
              {block.category.fields.length === 0 ? (
                <p className="text-xs text-gray-400">No parameters yet</p>
              ) : (
                block.category.fields.map((field, fi) => (
                  <InputField key={fi} label={field.labelText || "Untitled"}>
                    <FieldPreview field={field} interactive />
                  </InputField>
                ))
              )}
            </div>
          </div>
        ) : (
          <InputField key={idx} label={block.field.labelText || "Untitled"}>
            <FieldPreview field={block.field} interactive />
          </InputField>
        )
      )}
    </div>
  );
};

/** one field row's body — reused both as a top-level direct-parameter row and nested inside a
 * category's own Reorder.Group, so the wrapping Reorder.Item differs but the content doesn't */
const FieldRowContent = ({
  field,
  onLabelChange,
  onEdit,
  onDelete,
  dragControls,
}: {
  field: CustomFormField;
  onLabelChange: (value: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  dragControls: ReturnType<typeof useDragControls>;
}) => (
  <div className="flex items-start gap-3 border border-gray-200 rounded-md px-3 py-2.5 bg-white">
    <button
      type="button"
      onPointerDown={e => dragControls.start(e)}
      className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing shrink-0 mt-1.5"
      title="Drag to reorder"
    >
      <GripVertical size={15} />
    </button>

    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="input-field !mb-0 !py-1 text-sm font-medium flex-1"
          placeholder="Parameter label"
          value={field.labelText}
          onChange={e => onLabelChange(e.target.value)}
        />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 shrink-0">
          {field.fieldType}
        </span>
      </div>
      <FieldPreview field={field} interactive={false} />
    </div>

    <div className="flex items-center gap-1.5 shrink-0 mt-1.5">
      <button
        type="button"
        onClick={onEdit}
        className="text-gray-400 hover:text-blue-500 transition"
        title="Edit parameter"
      >
        <Pencil size={14} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="text-gray-400 hover:text-red-500 transition"
        title="Remove parameter"
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

/** a field row nested INSIDE a category's own Reorder.Group — that group's `values` is
 * `category.fields` (bare CustomFormField[]), so this item's drag value must be the bare field */
const CategoryFieldItem = ({
  field,
  onLabelChange,
  onEdit,
  onDelete,
}: {
  field: CustomFormField;
  onLabelChange: (value: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const dragControls = useDragControls();
  return (
    <Reorder.Item value={field} dragListener={false} dragControls={dragControls}>
      <FieldRowContent
        field={field}
        onLabelChange={onLabelChange}
        onEdit={onEdit}
        onDelete={onDelete}
        dragControls={dragControls}
      />
    </Reorder.Item>
  );
};

/** a category's content — no Reorder.Item of its own; the drag handle controls the OUTER
 * top-level Reorder.Item (see BlockItem), whose `values` is the `blocks` array, not this category
 * object. Internally owns its own nested Reorder.Group for reordering its fields. */
const CategoryBlockContent = ({
  category,
  dragControls,
  onNameChange,
  onDelete,
  onAddParameter,
  onEditField,
  onDeleteField,
  onFieldLabelChange,
  onReorderFields,
}: {
  category: CustomFormCategory;
  dragControls: ReturnType<typeof useDragControls>;
  onNameChange: (value: string) => void;
  onDelete: () => void;
  onAddParameter: () => void;
  onEditField: (fieldIndex: number) => void;
  onDeleteField: (fieldIndex: number) => void;
  onFieldLabelChange: (fieldIndex: number, value: string) => void;
  onReorderFields: (fields: CustomFormField[]) => void;
}) => (
  <div className="border border-gray-200 rounded-md overflow-hidden">
    <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 border-b border-gray-200">
      <button
        type="button"
        onPointerDown={e => dragControls.start(e)}
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing shrink-0"
        title="Drag to reorder"
      >
        <GripVertical size={15} />
      </button>
      <Layers size={13} className="text-slate-400 shrink-0" />
      <input
        type="text"
        className="input-field !mb-0 !py-1 text-sm font-bold uppercase tracking-wide bg-transparent flex-1"
        placeholder="Category name"
        value={category.categoryName}
        onChange={e => onNameChange(e.target.value)}
      />
      <button
        type="button"
        onClick={onDelete}
        className="text-gray-400 hover:text-red-500 transition shrink-0"
        title="Remove category"
      >
        <Trash2 size={14} />
      </button>
    </div>

    <div className="p-3 flex flex-col gap-2 bg-slate-50/50">
      {category.fields.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">No parameters in this category yet</p>
      ) : (
        <Reorder.Group
          axis="y"
          values={category.fields}
          onReorder={onReorderFields}
          className="flex flex-col gap-2"
        >
          {category.fields.map((field, fieldIndex) => (
            <CategoryFieldItem
              key={field.fieldId || `cat-field-${fieldIndex}-${field.labelText}`}
              field={field}
              onLabelChange={value => onFieldLabelChange(fieldIndex, value)}
              onEdit={() => onEditField(fieldIndex)}
              onDelete={() => onDeleteField(fieldIndex)}
            />
          ))}
        </Reorder.Group>
      )}

      <button
        type="button"
        onClick={onAddParameter}
        className="inline-flex items-center gap-1 self-start text-xs font-medium border border-gray-300 rounded-md px-2.5 py-1.5 hover:bg-white transition bg-white/60"
      >
        <Plus size={13} /> Add Parameters
      </button>
    </div>
  </div>
);

/** top-level canvas row — owns the Reorder.Item whose `value` is the whole block, matching the
 * outer Reorder.Group's `values={blocks}`. Renders either a category or a direct field inside. */
const BlockItem = ({
  block,
  onCategoryNameChange,
  onDeleteBlock,
  onAddInCategory,
  onEditCategoryField,
  onDeleteCategoryField,
  onCategoryFieldLabelChange,
  onReorderCategoryFields,
  onDirectLabelChange,
  onEditDirect,
}: {
  block: CustomFormBlock;
  onCategoryNameChange: (value: string) => void;
  onDeleteBlock: () => void;
  onAddInCategory: () => void;
  onEditCategoryField: (fieldIndex: number) => void;
  onDeleteCategoryField: (fieldIndex: number) => void;
  onCategoryFieldLabelChange: (fieldIndex: number, value: string) => void;
  onReorderCategoryFields: (fields: CustomFormField[]) => void;
  onDirectLabelChange: (value: string) => void;
  onEditDirect: () => void;
}) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item value={block} dragListener={false} dragControls={dragControls}>
      {block.blockType === "category" ? (
        <CategoryBlockContent
          category={block.category}
          dragControls={dragControls}
          onNameChange={onCategoryNameChange}
          onDelete={onDeleteBlock}
          onAddParameter={onAddInCategory}
          onEditField={onEditCategoryField}
          onDeleteField={onDeleteCategoryField}
          onFieldLabelChange={onCategoryFieldLabelChange}
          onReorderFields={onReorderCategoryFields}
        />
      ) : (
        <FieldRowContent
          field={block.field}
          onLabelChange={onDirectLabelChange}
          onEdit={onEditDirect}
          onDelete={onDeleteBlock}
          dragControls={dragControls}
        />
      )}
    </Reorder.Item>
  );
};

const FormBuilder = () => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();

  const [blocks, setBlocks] = useState<CustomFormBlock[]>([]);
  const [popupTarget, setPopupTarget] = useState<ParameterPopupTarget | null>(null);
  const [popupInitialField, setPopupInitialField] = useState<CustomFormField | null>(null);

  const [listActiveFilter, setListActiveFilter] = useState<number>(1);
  const [formSearch, setFormSearch] = useState("");

  const [viewForm, setViewForm] = useState<CustomFormItem | null>(null);
  const [viewBlocks, setViewBlocks] = useState<CustomFormBlock[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(customFormSchema),
    defaultValues: {
      formId: 0,
      formName: "",
      displayName: "",
      isActive: 1,
    },
  });

  const isEdit = Boolean(watch("formId"));
  const buttonTitle = isEdit ? "Update" : "Save Form";

  // ── canvas mutations ──
  const addCategory = () => {
    setBlocks(prev => [
      ...prev,
      {
        blockType: "category",
        sequenceNo: prev.length + 1,
        category: {
          categoryId: 0,
          categoryName: "New Category",
          sequenceNo: prev.length + 1,
          fields: [],
        },
      },
    ]);
  };

  const updateCategoryName = (blockIndex: number, name: string) => {
    setBlocks(prev =>
      prev.map((b, i) =>
        i === blockIndex && b.blockType === "category"
          ? { ...b, category: { ...b.category, categoryName: name } }
          : b
      )
    );
  };

  const deleteBlock = (blockIndex: number) => {
    setBlocks(prev => prev.filter((_, i) => i !== blockIndex));
  };

  const updateDirectFieldLabel = (blockIndex: number, value: string) => {
    setBlocks(prev =>
      prev.map((b, i) =>
        i === blockIndex && b.blockType === "field"
          ? { ...b, field: { ...b.field, labelText: value } }
          : b
      )
    );
  };

  const updateCategoryFields = (blockIndex: number, fields: CustomFormField[]) => {
    setBlocks(prev =>
      prev.map((b, i) =>
        i === blockIndex && b.blockType === "category"
          ? { ...b, category: { ...b.category, fields } }
          : b
      )
    );
  };

  const updateCategoryFieldLabel = (blockIndex: number, fieldIndex: number, value: string) => {
    setBlocks(prev =>
      prev.map((b, i) => {
        if (i !== blockIndex || b.blockType !== "category") return b;
        const fields = b.category.fields.map((f, fi) =>
          fi === fieldIndex ? { ...f, labelText: value } : f
        );
        return { ...b, category: { ...b.category, fields } };
      })
    );
  };

  const deleteCategoryField = (blockIndex: number, fieldIndex: number) => {
    setBlocks(prev =>
      prev.map((b, i) => {
        if (i !== blockIndex || b.blockType !== "category") return b;
        return {
          ...b,
          category: {
            ...b.category,
            fields: b.category.fields.filter((_, fi) => fi !== fieldIndex),
          },
        };
      })
    );
  };

  // ── parameter popup wiring ──
  const openAddDirect = () => {
    setPopupInitialField(null);
    setPopupTarget({ mode: "add", location: "direct" });
  };

  const openAddInCategory = (blockIndex: number) => {
    setPopupInitialField(null);
    setPopupTarget({ mode: "add", location: "category", blockIndex });
  };

  const openEditDirect = (blockIndex: number, field: CustomFormField) => {
    setPopupInitialField(field);
    setPopupTarget({ mode: "edit", location: "direct", blockIndex });
  };

  const openEditInCategory = (blockIndex: number, fieldIndex: number, field: CustomFormField) => {
    setPopupInitialField(field);
    setPopupTarget({ mode: "edit", location: "category", blockIndex, fieldIndex });
  };

  const closePopup = () => {
    setPopupTarget(null);
    setPopupInitialField(null);
  };

  const handlePopupSave = (field: CustomFormField) => {
    if (!popupTarget) return;

    if (popupTarget.mode === "add" && popupTarget.location === "direct") {
      setBlocks(prev => [...prev, { blockType: "field", sequenceNo: prev.length + 1, field }]);
    } else if (popupTarget.mode === "add" && popupTarget.location === "category") {
      setBlocks(prev =>
        prev.map((b, i) =>
          i === popupTarget.blockIndex && b.blockType === "category"
            ? { ...b, category: { ...b.category, fields: [...b.category.fields, field] } }
            : b
        )
      );
    } else if (popupTarget.mode === "edit" && popupTarget.location === "direct") {
      setBlocks(prev =>
        prev.map((b, i) =>
          i === popupTarget.blockIndex && b.blockType === "field" ? { ...b, field } : b
        )
      );
    } else if (popupTarget.mode === "edit" && popupTarget.location === "category") {
      setBlocks(prev =>
        prev.map((b, i) => {
          if (i !== popupTarget.blockIndex || b.blockType !== "category") return b;
          const fields = b.category.fields.map((f, fi) =>
            fi === popupTarget.fieldIndex ? field : f
          );
          return { ...b, category: { ...b.category, fields } };
        })
      );
    }
  };

  // ── save ──
  const buildBlocksPayload = (source: CustomFormBlock[]): CustomFormBlock[] =>
    source.map((b, idx) => {
      if (b.blockType === "field") {
        return {
          blockType: "field",
          sequenceNo: idx + 1,
          field: { ...b.field, sequenceNo: idx + 1 },
        };
      }
      return {
        blockType: "category",
        sequenceNo: idx + 1,
        category: {
          ...b.category,
          sequenceNo: idx + 1,
          fields: b.category.fields.map((f, fi) => ({ ...f, sequenceNo: fi + 1 })),
        },
      };
    });

  const createUpdateCustomForm = async (data: CustomFormPayload) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_CUSTOM_FORM,
      data,
      {},
      { component: "FormBuilder" }
    );
    return resp;
  };

  const mutation = useMutation<any, Error, CustomFormPayload>({
    mutationKey: ["createUpdateCustomForm"],
    mutationFn: (data: CustomFormPayload) => createUpdateCustomForm(data),
    onSuccess: resp => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "Something went wrong");
        return;
      }
      showSuccess(resp?.message ?? "Form saved successfully");
      queryClient.invalidateQueries({ queryKey: ["getAllCustomForms"] });
      reset({ formId: 0, formName: "", displayName: "", isActive: 1 });
      setBlocks([]);
    },
    onError: error => {
      showError(error?.message);
    },
  });

  const onsubmit = (data: CustomFormData) => {
    if (blocks.length === 0) {
      showWarning("Please add at least one category or parameter to the form");
      return;
    }

    const payload: CustomFormPayload = {
      ...data,
      blocks: buildBlocksPayload(blocks),
    };

    mutation.mutate(payload);
  };

  // ── mapping raw backend rows (all UNVERIFIED shape) into our CustomFormBlock tree ──
  const mapRawField = (raw: any): CustomFormField => ({
    fieldId: raw.FieldId ?? raw.fieldId ?? 0,
    fieldType: raw.FieldType ?? raw.fieldType ?? "text",
    labelText: raw.LabelText ?? raw.labelText ?? "",
    options: raw.Options ?? raw.options ?? undefined,
    hasComments: raw.HasComments ?? raw.hasComments ?? undefined,
    sequenceNo: raw.SequenceNo ?? raw.sequenceNo ?? 0,
  });

  const mapRawBlocks = (raw: any[]): CustomFormBlock[] =>
    raw
      .map((b: any): CustomFormBlock => {
        const blockType = b.BlockType ?? b.blockType;
        if (blockType === "category") {
          const rawCategory = b.Category ?? b.category ?? {};
          return {
            blockType: "category",
            sequenceNo: b.SequenceNo ?? b.sequenceNo ?? 0,
            category: {
              categoryId: rawCategory.CategoryId ?? rawCategory.categoryId ?? 0,
              categoryName: rawCategory.CategoryName ?? rawCategory.categoryName ?? "",
              sequenceNo: rawCategory.SequenceNo ?? rawCategory.sequenceNo ?? 0,
              fields: (rawCategory.Fields ?? rawCategory.fields ?? []).map(mapRawField),
            },
          };
        }
        return {
          blockType: "field",
          sequenceNo: b.SequenceNo ?? b.sequenceNo ?? 0,
          field: mapRawField(b.Field ?? b.field ?? b),
        };
      })
      .sort((a, b) => a.sequenceNo - b.sequenceNo);

  const getCustomFormFields = async (formId: number): Promise<CustomFormBlock[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CUSTOM_FORM_FIELDS,
      {},
      { params: { formId } },
      { component: "FormBuilder", silent: true }
    );
    const raw: any[] = resp?.data?.blocks ?? resp?.data ?? [];
    return mapRawBlocks(raw);
  };

  const getAllCustomForms = async (): Promise<CustomFormItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_CUSTOM_FORMS,
      {},
      { params: { isActive: listActiveFilter } },
      { component: "FormBuilder", silent: true }
    );
    const raw: any[] = resp?.data ?? [];
    return raw.map(f => ({
      formId: f.FormId,
      formName: f.FormName,
      displayName: f.DisplayName,
      isActive: f.IsActive,
    }));
  };

  const { data: customForms = [] } = useQuery({
    queryKey: ["getAllCustomForms", listActiveFilter],
    queryFn: getAllCustomForms,
  });

  const filteredForms = useMemo(() => {
    const q = formSearch.trim().toLowerCase();
    if (!q) return customForms;
    return customForms.filter(
      (f: CustomFormItem) =>
        f.formName?.toLowerCase().includes(q) || f.displayName?.toLowerCase().includes(q)
    );
  }, [customForms, formSearch]);

  const editHandler = async (form: CustomFormItem) => {
    reset({
      formId: form?.formId ?? 0,
      formName: form?.formName ?? "",
      displayName: form?.displayName ?? "",
      isActive: form?.isActive ?? 1,
    });

    const savedBlocks = await getCustomFormFields(form?.formId ?? 0);
    setBlocks(savedBlocks);
  };

  const viewHandler = async (form: CustomFormItem) => {
    setViewForm(form);
    setViewLoading(true);
    const savedBlocks = await getCustomFormFields(form.formId);
    setViewBlocks(savedBlocks);
    setViewLoading(false);
  };

  const closeViewPopup = () => {
    setViewForm(null);
    setViewBlocks([]);
  };

  const cancelHandler = () => {
    reset({ formId: 0, formName: "", displayName: "", isActive: 1 });
    setBlocks([]);
  };

  return (
    <>
      <div className="card mt-1">
        <div className="card-header">
          <h2 className="card-title">{isEdit ? "Edit Form" : "New Form"}</h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5 items-start">
          <form onSubmit={handleSubmit(onsubmit)}>
            <div className="form-grid-4">
              <InputField label="Form Name" required>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Neonatal Assessment"
                  {...register("formName")}
                />
                {errors.formName && <p className="input-field-error">{errors.formName.message}</p>}
              </InputField>

              <InputField label="Display Name" required>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Neonatal Assessment"
                  {...register("displayName")}
                />
                {errors.displayName && (
                  <p className="input-field-error">{errors.displayName.message}</p>
                )}
              </InputField>

              <InputField label="Status" required>
                <select className="input-field" {...register("isActive")}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </InputField>
            </div>

            {/* ── toolbar + canvas ── */}
            <div className="mt-2">
              <div className="flex items-center justify-between mt-5 mb-2 gap-3 flex-wrap">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Form Layout ({blocks.length})
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={addCategory}
                    className="inline-flex items-center gap-1 text-xs font-medium border border-gray-300 rounded-md px-2.5 py-1.5 hover:bg-gray-50 transition"
                  >
                    <Layers size={13} /> Add Category
                  </button>
                  <button
                    type="button"
                    onClick={openAddDirect}
                    className="inline-flex items-center gap-1 text-xs font-medium border border-gray-300 rounded-md px-2.5 py-1.5 hover:bg-gray-50 transition"
                  >
                    <Plus size={13} /> Direct Parameter
                  </button>
                </div>
              </div>

              <div className="border border-dashed border-gray-300 rounded-md p-3 min-h-32 bg-gray-50/50">
                {blocks.length === 0 ? (
                  <p className="table-empty">
                    Empty canvas — click "Add Category" to group related parameters, or "Direct
                    Parameter" to add a standalone field
                  </p>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={blocks}
                    onReorder={setBlocks}
                    className="flex flex-col gap-2.5"
                  >
                    {blocks.map((block, blockIndex) => (
                      <BlockItem
                        key={
                          block.blockType === "category"
                            ? `category-${block.category.categoryId || blockIndex}`
                            : block.field.fieldId || `direct-${blockIndex}-${block.field.labelText}`
                        }
                        block={block}
                        onCategoryNameChange={value => updateCategoryName(blockIndex, value)}
                        onDeleteBlock={() => deleteBlock(blockIndex)}
                        onAddInCategory={() => openAddInCategory(blockIndex)}
                        onEditCategoryField={fieldIndex => {
                          if (block.blockType === "category") {
                            openEditInCategory(
                              blockIndex,
                              fieldIndex,
                              block.category.fields[fieldIndex]
                            );
                          }
                        }}
                        onDeleteCategoryField={fieldIndex =>
                          deleteCategoryField(blockIndex, fieldIndex)
                        }
                        onCategoryFieldLabelChange={(fieldIndex, value) =>
                          updateCategoryFieldLabel(blockIndex, fieldIndex, value)
                        }
                        onReorderCategoryFields={fields => updateCategoryFields(blockIndex, fields)}
                        onDirectLabelChange={value => updateDirectFieldLabel(blockIndex, value)}
                        onEditDirect={() => {
                          if (block.blockType === "field") {
                            openEditDirect(blockIndex, block.field);
                          }
                        }}
                      />
                    ))}
                  </Reorder.Group>
                )}
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

          <div className="border border-gray-200 rounded-md overflow-hidden xl:sticky xl:top-4">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 border-b border-gray-200">
              <Eye size={13} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Live Preview
              </span>
            </div>
            <div className="p-3 max-h-[70vh] overflow-y-auto">
              <RenderedForm blocks={blocks} />
            </div>
          </div>
        </div>
        {!!loading && <CustomLoader isLoading={loading} />}
      </div>

      {/* ── saved forms list ── */}
      <div className="card mt-1">
        <div className="card-header">
          <h2 className="card-title">Forms</h2>
        </div>

        <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="input-field !mb-0 pl-9 !py-1.5 text-xs"
              placeholder="Search forms…"
              value={formSearch}
              onChange={e => setFormSearch(e.target.value)}
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
                  <th className="table-th">Form Name</th>
                  <th className="table-th">Display Name</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="table-empty">
                      No forms found
                    </td>
                  </tr>
                ) : (
                  filteredForms.map((item: CustomFormItem, i: number) => {
                    const active = Number(item.isActive) === 1;
                    return (
                      <tr key={item.formId} className="table-row">
                        <td className="table-td">{i + 1}</td>
                        <td className="table-td font-medium text-gray-800">{item.formName}</td>
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

      {viewForm && (
        <div className="fixed inset-0 z-999">
          <div className="popup-bg-overlay" />
          <div className="central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] max-w-xl opacity-full">
            <div className="popup-header">
              <h2 className="popup-helper-text">{viewForm.displayName || viewForm.formName}</h2>
              <button onClick={closeViewPopup} className="close-drawer-btn">
                ×
              </button>
            </div>

            {viewLoading ? (
              <p className="table-empty">Loading…</p>
            ) : (
              <div className="p-1">
                <RenderedForm blocks={viewBlocks} />
              </div>
            )}
          </div>
        </div>
      )}

      <ParameterEditorPopup
        isOpen={Boolean(popupTarget)}
        onClose={closePopup}
        initialField={popupInitialField}
        onSave={handlePopupSave}
      />
    </>
  );
};

export default FormBuilder;
