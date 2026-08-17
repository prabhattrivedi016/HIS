import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { templateCategorySchema } from "@/validation/templateMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { TemplateCategoryItem } from "../types";

interface TemplateCategoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  /** called with the newly-created category so the caller (TemplateMaster's Template Category
   * select) can select it immediately without waiting for a separate list refetch */
  onCreated: (category: TemplateCategoryItem) => void;
}

/**
 * Quick "+" add-a-category popup, opened from TemplateMaster's Template Category select — same
 * inline-create-without-leaving-the-form pattern used throughout this codebase (e.g.
 * serviceMaster/packageMaster's category "+" buttons). Create-only; category status defaults
 * Active since it's being added specifically to use on a template right now.
 */
const TemplateCategoryPopup = ({ isOpen, onClose, onCreated }: TemplateCategoryPopupProps) => {
  const { loading, fetchApi } = useGlobalApi();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(templateCategorySchema),
    defaultValues: {
      templateCategoryId: 0,
      categoryName: "",
      isActive: 1,
    },
  });

  const onSubmit = async (data: { templateCategoryId?: number | null; categoryName: string; isActive: number }) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_TEMPLATE_CATEGORY,
      data,
      {},
      { component: "TemplateCategoryPopup" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed to save template category");
      return;
    }

    showSuccess(resp?.message ?? "Template category saved successfully");

    const saved = resp?.data ?? {};
    onCreated({
      templateCategoryId: Number(saved.templateCategoryId ?? saved.TemplateCategoryId ?? 0),
      categoryName: String(saved.categoryName ?? saved.CategoryName ?? data.categoryName),
      isActive: Number(saved.isActive ?? saved.IsActive ?? data.isActive),
    });

    reset({ templateCategoryId: 0, categoryName: "", isActive: 1 });
    onClose();
  };

  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Add Template Category">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid-1">
          <InputField label="Category Name" required>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Assessment"
              {...register("categoryName")}
            />
            {errors.categoryName && (
              <p className="input-field-error">{errors.categoryName.message}</p>
            )}
          </InputField>

          <InputField label="Status" required>
            <select className="input-field" {...register("isActive")}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </InputField>
        </div>

        <div className="form-actions-responsive mt-5">
          <button type="submit" className="save-btn">
            Create
          </button>
          <button type="button" className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
      {!!loading && <CustomLoader isLoading={loading} />}
    </CentralPopup>
  );
};

export default TemplateCategoryPopup;
