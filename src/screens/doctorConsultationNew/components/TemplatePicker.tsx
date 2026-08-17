import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { TemplateCategoryItem, TemplateItem } from "@/screens/emrTemplates/types";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useQuery } from "@tanstack/react-query";
import { LayoutTemplate } from "lucide-react";
import { useMemo, useState } from "react";

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateItem) => void;
}

const ALL_CATEGORY_ID = 0;

/**
 * Category-tabs + grid-of-named-templates picker, modeled on the reference EMR product's
 * Templates panel. UNVERIFIED backend — GET_TEMPLATE_CATEGORY_LIST / GET_ALL_TEMPLATES are
 * guessed endpoints (see config/defaults/index.ts), so both queries are silent: a 404/network
 * error degrades to an empty list ("No templates found") rather than a toast or crash.
 */
const TemplatePicker = ({ isOpen, onClose, onSelectTemplate }: TemplatePickerProps) => {
  const { fetchApi } = useGlobalApi();
  const [activeCategoryId, setActiveCategoryId] = useState<number>(ALL_CATEGORY_ID);

  useScrollLock(isOpen);

  const getCategories = async (): Promise<TemplateCategoryItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_TEMPLATE_CATEGORY_LIST,
      {},
      { params: { isActive: 1 } },
      { component: "TemplatePicker", silent: true }
    );
    const raw: any[] = resp?.data ?? [];
    return raw.map(c => ({
      templateCategoryId: c.TemplateCategoryId ?? c.templateCategoryId,
      categoryName: c.CategoryName ?? c.categoryName ?? "",
      isActive: c.IsActive ?? c.isActive ?? 1,
    }));
  };

  const { data: categories = [] } = useQuery<TemplateCategoryItem[]>({
    queryKey: ["templatePickerCategories"],
    queryFn: getCategories,
    enabled: isOpen,
  });

  const getTemplates = async (): Promise<TemplateItem[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_TEMPLATES,
      {},
      { params: { isActive: 1 } },
      { component: "TemplatePicker", silent: true }
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

  const { data: templates = [] } = useQuery<TemplateItem[]>({
    queryKey: ["templatePickerTemplates"],
    queryFn: getTemplates,
    enabled: isOpen,
  });

  const visibleTemplates = useMemo(() => {
    if (activeCategoryId === ALL_CATEGORY_ID) return templates;
    return templates.filter(t => t.templateCategoryId === activeCategoryId);
  }, [templates, activeCategoryId]);

  const handleSelect = (template: TemplateItem) => {
    onSelectTemplate(template);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999">
      <div className="popup-bg-overlay opacity-100" onClick={onClose} />

      <div className="central-popup overflow-hidden max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-260 opacity-full flex flex-col">
        <div className="popup-header">
          <h2 className="popup-helper-text flex items-center gap-2">
            <LayoutTemplate size={16} />
            Templates
          </h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>

        {/* category tabs */}
        <div className="flex items-center gap-1.5 px-1 pb-2 overflow-x-auto scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveCategoryId(ALL_CATEGORY_ID)}
            className={`tab-btn whitespace-nowrap ${
              activeCategoryId === ALL_CATEGORY_ID ? "tab-btn-active" : "tab-btn-inactive"
            }`}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c.templateCategoryId}
              type="button"
              onClick={() => setActiveCategoryId(c.templateCategoryId)}
              className={`tab-btn whitespace-nowrap ${
                activeCategoryId === c.templateCategoryId ? "tab-btn-active" : "tab-btn-inactive"
              }`}
            >
              {c.categoryName}
            </button>
          ))}
        </div>

        {/* template grid */}
        <div className="flex-1 overflow-y-auto px-1 pb-2">
          {visibleTemplates.length === 0 ? (
            <p className="table-empty">No templates found</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {visibleTemplates.map(template => (
                <button
                  key={template.templateId}
                  type="button"
                  onClick={() => handleSelect(template)}
                  className="text-left px-3 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-colors text-xs font-medium text-gray-700 truncate"
                  title={template.displayName || template.templateName}
                >
                  {template.displayName || template.templateName}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatePicker;
