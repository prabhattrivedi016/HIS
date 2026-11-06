import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import EditIconButton from "@/components/globalButtons/EditIconButton";
import RemoveIconButton from "@/components/globalButtons/RemoveIconButton";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import {
  TechnicalNotesFormData,
  technicalNotesSchema,
} from "@/validation/sampleJourneyValidationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PatientDetailsInvestigationItem, TechnicalNotesItem } from "../types";

const TABS = ["Comments & Interpretation", "Predefined Comments", "Technical Notes"];

const CommentBox = ({
  selectedInvestigation,
}: {
  selectedInvestigation: PatientDetailsInvestigationItem;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [technicalNotesList, setTechnicalNotesLists] = useState<TechnicalNotesItem[]>([]);

  const [activeTab, setActiveTab] = useState(TABS[0]);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(technicalNotesSchema),
    defaultValues: {
      id: 0,
      investigationId: selectedInvestigation?.InvestigationId,
      technicalNote: "",
    },
  });

  useEffect(() => {
    reset({
      id: 0,
      investigationId: selectedInvestigation?.InvestigationId ?? 0,
      technicalNote: "",
    });
  }, [selectedInvestigation?.InvestigationId, reset]);

  console.log("selectedInvestigationselectedInvestigation of comment", selectedInvestigation);

  const [techComment, setTechComment] = useState("Sample is adequate. Result verified.");

  const [pathoComment, setPathoComment] = useState(
    "CBC shows elevated TLC with neutrophilia, suggestive of infection. Correlate clinically."
  );

  // get all technical note
  const getAllTechnicalNotes = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_INVESTIGATION_TECHNICAL_NOTE,
      {},
      { params: { investigationId: selectedInvestigation?.InvestigationId } },
      { component: "CommentBox" }
    );
    setTechnicalNotesLists(resp?.data ?? []);
  };

  useEffect(() => {
    getAllTechnicalNotes();
  }, [activeTab === "Technical Notes"]);

  // technical notes submit handler
  const technicalNotesSubmitHandler = async (formData: TechnicalNotesFormData) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_PATIENT_INVESTIGATION_TECHNICAL_NOTE,
      formData,
      {},
      { component: "CommentBox" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error while saving technical notes");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    await getAllTechnicalNotes();
    reset({
      id: 0,
      investigationId: selectedInvestigation?.InvestigationId,
      technicalNote: "",
    });
  };

  // edit technical notes
  const editHandler = (row: TechnicalNotesItem) => {
    if (!row) return;
    reset({
      id: row?.Id,
      investigationId: row?.InvestigationId,
      technicalNote: row?.TechnicalNote,
    });
  };

  // remove technical notes handler
  const removeTechnicalNotesHandler = async (row: TechnicalNotesItem) => {
    if (!row) return;
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.DELETE_PATIENT_INVESTIGATION_TECHNICAL_NOTE,
      {},
      { params: { id: row?.Id } },

      { component: "CommentBox" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error while saving technical notes");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    await getAllTechnicalNotes();
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-3 shadow-sm mt-1">
      {/* Tabs */}
      <div className="flex items-center gap-5 overflow-x-auto whitespace-nowrap border-b border-gray-100 mb-3">
        {TABS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-semibold pb-2 border-b-2 transition-colors shrink-0 ${
              activeTab === tab
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Comments & Interpretation */}
      {activeTab === "Comments & Interpretation" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Technician Comment */}
            <div className="space-y-1">
              <label htmlFor="techComment" className="text-[11px] font-bold text-gray-700">
                Technician Comment
              </label>

              <textarea
                id="techComment"
                rows={3}
                value={techComment}
                onChange={e => setTechComment(e.target.value)}
                placeholder="Enter technician comment..."
                className="w-full resize-y min-h-[65px] bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Pathologist Interpretation */}
            <div className="space-y-1">
              <label htmlFor="pathoComment" className="text-[11px] font-bold text-gray-700">
                Interpretation (Pathologist)
              </label>

              <textarea
                id="pathoComment"
                rows={3}
                value={pathoComment}
                onChange={e => setPathoComment(e.target.value)}
                placeholder="Enter pathologist interpretation..."
                className="w-full resize-y min-h-[65px] bg-gray-50 border border-gray-200 rounded-lg text-xs p-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Predefined Comments */}
      {activeTab === "Predefined Comments" && (
        <div className="text-xs text-gray-500 py-4 text-center">
          Predefined comments can be configured here.
        </div>
      )}

      {/* Technical Notes */}
      {activeTab === "Technical Notes" && (
        <>
          <div className="form-grid-2">
            <InputField label="Technical Notes">
              <textarea className="input-field w-full " {...register("technicalNote")} />
              {errors.technicalNote && (
                <p className="input-field-error">{errors.technicalNote.message}</p>
              )}
            </InputField>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full lg:col-start-4 mt-4">
              <button className="save-btn" onClick={handleSubmit(technicalNotesSubmitHandler)}>
                Save
              </button>
            </div>
          </div>
          <div className="table-container ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-40 lg:max-h-40">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      <th className="table-th">#</th>
                      <th className="table-th p-2">Technical Note</th>
                      <th className="table-th">Created By</th>
                      <th className="table-th">Created On</th>
                      <th className="table-th">Last Modified By</th>
                      <th className="table-th">Last Modified On</th>
                      <th className="table-th">Edit</th>
                      <th className="table-th">Delete</th>
                    </tr>
                  </thead>

                  <tbody>
                    {technicalNotesList?.length === 0 && (
                      <tr>
                        <td colSpan={8} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {technicalNotesList.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">{item?.TechnicalNote || "-"}</td>

                        <td className="table-td">{item?.CreatedBy || "-"}</td>
                        <td className="table-td">{item?.CreatedOn || "-"}</td>
                        <td className="table-td">{item?.LastModifiedBy || "-"}</td>
                        <td className="table-td">{item?.LastModifiedOn || "-"}</td>
                        <td className="table-td">
                          <EditIconButton onClick={() => editHandler(item)} />
                        </td>
                        <td className="table-td">
                          <RemoveIconButton onClick={() => removeTechnicalNotesHandler(item)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default CommentBox;
