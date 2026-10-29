import TextEditor from "@/components/ckEditor";
import InputField from "@/components/customInputField";
import { Settings } from "lucide-react";
import { FreetextInvestigationValue } from "../types";

interface Props {
  isExpanded: boolean;
  onToggleExpand: () => void;
  freeTextInvestigationResultvalue: FreetextInvestigationValue[];
}

export default function FreeTextTableData({
  isExpanded,
  onToggleExpand,
  freeTextInvestigationResultvalue,
}: Props) {
  console.log("freeTextInvestigationResultvalue", freeTextInvestigationResultvalue?.[0]);

  return (
    <div className="card">
      {/* Investigation Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2">
        <div className="flex items-center">
          <span className="text-xs font-extrabold text-blue-900">
            Investigation : {freeTextInvestigationResultvalue?.[0]?.InvestigationName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <span>Method :</span>
            <span className="rounded border border-gray-200 bg-white px-2 py-1 font-bold text-gray-900 shadow-sm">
              Automated Analyzer
            </span>
          </div>

          <button
            type="button"
            className="shrink-0 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-950"
          >
            Auto Fill
          </button>

          <button
            type="button"
            onClick={onToggleExpand}
            className={`shrink-0 rounded-lg border p-1.5 shadow-sm transition ${
              isExpanded
                ? "border-blue-950 bg-blue-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
            title="Toggle Right Panel"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Full-Width Table */}
      <div className=" flex flex-col gap-4 overflow-hidden">
        <div className="table-container mt-1">
          <div className="table-scroll-wrapper">
            <div className="table-size min-h-[320px]">
              {/* Template */}
              <div className="m-2 grid grid-cols-1 items-end gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <InputField label="Select Template">
                    <select
                      className="input-field w-full"
                      // {...register("templateId", { valueAsNumber: true })}
                      // onChange={templateChangeHandler}
                    >
                      <option value={0}>Select</option>
                      {[]?.map(t => (
                        <option key={t?.ItemId} value={t?.ItemId}>
                          {t?.Name}
                        </option>
                      ))}
                    </select>
                  </InputField>
                </div>

                <div className="min-w-0">
                  <InputField label="Template Name">
                    <input
                      type="text"
                      className="input-field w-full"
                      placeholder="Enter template name"
                      name="name"
                      // value={createUpdateTemplateFormData?.name}
                      // onChange={inputChangeHandler}
                    />
                  </InputField>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-center gap-2 lg:pb-0.5">
                  <button
                    type="button"
                    className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg bg-blue-900 px-3 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
                  >
                    Save New
                  </button>

                  <button
                    type="button"
                    className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg bg-blue-900 px-3 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="mx-1  w-full overflow-hidden rounded-lg">
                <TextEditor
                // key={editorInstanceKey}
                // onChange={textEditorChangeHandler}
                // value={textEditorValue}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Comments and Abnormal Report */}
        <div className="grid grid-cols-1 items-start gap-4 border-t border-gray-100 pt-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="min-w-0">
            <InputField label="Comments">
              <textarea
                rows={2}
                className="input-field w-full resize-y"
                // value={investigationCommentsValue ?? ""}
                onChange={e => {
                  const nextComment = e.target.value;

                  // setValue("investigationComments", nextComment);
                  // const selectedTemplateId = Number(
                  //   getValues("templateId") || 0
                  // );

                  // if (selectedTemplateId > 0) {
                  //   setTemplateCommentById((prev) => ({
                  //     ...prev,
                  //     [selectedTemplateId]: nextComment,
                  //   }));
                  // }
                }}
              />
            </InputField>
          </div>

          <div className="min-w-0">
            <InputField label="Abnormal Report">
              <select
                className="input-field w-full"
                // {...register("isAbnormalResult", { valueAsNumber: true })}
              >
                <option value={0}>No</option>
                <option value={1}>yes</option>
              </select>
            </InputField>
          </div>
        </div>
      </div>
    </div>
  );
}
