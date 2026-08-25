import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { TemplateCategoryItem, TemplateItem } from "@/screens/emrTemplates/types";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, LayoutTemplate } from "lucide-react";
import { useMemo, useState } from "react";

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateItem) => void;
}

const ALL_CATEGORY_ID = 0;

/**
 * Category-tabs + grid-of-named-templates picker, modeled on the reference EMR product's
 * Templates panel. Both queries stay silent (see config/defaults/index.ts) so a network hiccup
 * degrades to an empty list ("No templates found") rather than a toast or crash.
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
      {},
      { component: "TemplatePicker", silent: true }
    );
    const raw: any[] = resp?.data ?? [];
    return raw.map(c => ({
      templateCategoryId: c.TemplateCategoryId ?? c.templateCategoryId,
      templateCategoryName: c.TemplateCategoryName ?? c.templateCategoryName ?? "",
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
      categoryName: t.TemplateCategoryName,
      isActive: t.IsActive,
      isMultipleEntryAllow: t.IsMultipleEntryAllow ?? 0,
      applicableTo: t.ApplicableTo ?? 0,
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
    <AnimatePresence>
      <motion.div
        key="template-picker-backdrop"
        className="fixed inset-0 z-[95] bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        key="template-picker-drawer"
        className="fixed inset-y-0 right-0 z-[96] w-[92vw] max-w-[480px] bg-white shadow-2xl flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
      >
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 shrink-0">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-[#0B5394] to-[#1C7EC2] shadow-sm">
            <LayoutTemplate size={13} className="text-white" />
          </span>
          <h3 className="text-[13px] font-bold text-slate-700 tracking-wide flex-1">Templates</h3>
          <button className="close-drawer-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* category tabs */}
        <div className="flex items-center gap-1.5 px-4 py-3 overflow-x-auto scrollbar-none shrink-0 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setActiveCategoryId(ALL_CATEGORY_ID)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors ${
              activeCategoryId === ALL_CATEGORY_ID
                ? "bg-[#0B5394] text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c.templateCategoryId}
              type="button"
              onClick={() => setActiveCategoryId(c.templateCategoryId)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors ${
                activeCategoryId === c.templateCategoryId
                  ? "bg-[#0B5394] text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {c.templateCategoryName}
            </button>
          ))}
        </div>

        {/* template grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {visibleTemplates.length === 0 ? (
            <p className="table-empty">No templates found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {visibleTemplates.map(template => (
                <button
                  key={template.templateId}
                  type="button"
                  onClick={() => handleSelect(template)}
                  className="group text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-[#0B5394] hover:shadow-md transition-all"
                  title={template.displayName || template.templateName}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#0B5394]/10 transition-colors mb-2">
                    <FileText size={14} className="text-slate-400 group-hover:text-[#0B5394]" />
                  </span>
                  <p className="text-[12.5px] font-semibold text-slate-700 leading-snug line-clamp-2">
                    {template.displayName || template.templateName}
                  </p>
                  {activeCategoryId === ALL_CATEGORY_ID && template.categoryName && (
                    <p className="text-[10.5px] text-slate-400 mt-1 truncate">
                      {template.categoryName}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TemplatePicker;
