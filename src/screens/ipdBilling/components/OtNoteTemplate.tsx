import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { TemplateMappingCode } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import PrintPreviewModal from "@/screens/doctorConsultationNew/components/PrintPreviewModal";
import TemplateInlineSections from "@/screens/doctorConsultationNew/components/TemplateInlineSections";
import { EmrSectionAnswerEntry } from "@/screens/doctorConsultationNew/types";
import { TemplateItem } from "@/screens/emrTemplates/types";
import { showError, showSuccess } from "@/utils/alert";
import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { IpdPatientItem, OtTemplateItem } from "../types";

const OtNoteTemplate = ({
  isOpen,
  onClose,
  selectedPatient,
  selectedTemplateId,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedPatient: IpdPatientItem;
  selectedTemplateId: number;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [templateId, setTemplateId] = useState<number>(0);
  const [templateEntriesByTemplateId, setTemplateEntriesByTemplateId] = useState<
    Record<number, EmrSectionAnswerEntry[]>
  >({});

  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);

  console.log(
    "templateEntriesByTemplateIdtemplateEntriesByTemplateIdtemplateEntriesByTemplateIdtemplateEntriesByTemplateId",
    templateEntriesByTemplateId
  );

  const [printTemplateContext, setPrintTemplateContext] = useState<{
    name: string;
    entries: EmrSectionAnswerEntry[];
    templateId: number;
  } | null>(null);

  const onTemplateEntriesChange = (templateId: number, entries: EmrSectionAnswerEntry[]) => {
    setTemplateEntriesByTemplateId(prev => ({ ...prev, [templateId]: entries }));
  };

  const onPrintTemplate = (name: string, entries: EmrSectionAnswerEntry[], templateId: number) =>
    setPrintTemplateContext({ name, entries, templateId });

  // template list
  const getTemplateList = async () => {
    try {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_EMR_TEMPLATE_MASTER,
        {},
        { params: { isActive: 1 } },
        { component: "OtNoteTemplate" }
      );

      const otNoteTemplate = resp?.data?.find(
        (item: OtTemplateItem) => item?.TemplateId === selectedTemplateId
      );

      if (otNoteTemplate) {
        setTemplateId(otNoteTemplate?.TemplateId);
        setSelectedTemplate({
          templateId: otNoteTemplate?.TemplateId,
          templateName: otNoteTemplate?.TemplateName,
          displayName: otNoteTemplate?.DisplayName,
          templateCategoryId: otNoteTemplate?.TemplateCategoryId,
          categoryName: otNoteTemplate?.TemplateCategoryName,
          isActive: otNoteTemplate?.IsActive,
          isMultipleEntryAllow: otNoteTemplate?.IsMultipleEntryAllow ?? 0,
          applicableTo: otNoteTemplate?.ApplicableTo ?? 0,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setTemplateEntriesByTemplateId({});
      setSelectedTemplate(null);
      setTemplateId(0);
    }
  }, [isOpen]);

  useEffect(() => {
    getTemplateList();
  }, [selectedPatient, isOpen]);

  //   consultation headers data
  const consultationHeadersDataPayloadData = () => {
    return templateEntriesByTemplateId?.[templateId].map((item: EmrSectionAnswerEntry) => {
      return {
        dataId: item?.dataId ?? 0,
        sectionId: item?.sectionId,
        headerId: item?.headerId,
        controlTypeId: item?.controlTypeId,
        templateId: item?.templateId,
        headerValue: item?.value,
        patientId: selectedPatient?.PatientId,
        visitId: selectedPatient?.VisitId,
      };
    });
  };

  //   save handler
  const saveHandler = async () => {
    const payload = {
      otNotesHeadersData: consultationHeadersDataPayloadData(),
    };

    console.log("payload", payload);

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_PATIENT_OT_NOTES,
      payload,
      {},
      { component: "OtNOteTemplate" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Data saved successfully");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    onClose?.();
  };

  return (
    <CentralPopup
      onClose={onClose}
      isOpen={isOpen}
      title={"Notes Template"}
      className="min-w-[95vw]"
    >
      {selectedTemplate ? (
        <>
          <div className="card mt-1">
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={() => setShowPrintPreview(true)}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-medium border border-gray-300 rounded-lg px-3 sm:px-4 py-1.5 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
              >
                <Printer size={14} />
                Print
              </button>
            </div>
            <TemplateInlineSections
              key={selectedTemplate?.templateId}
              template={selectedTemplate}
              doctorId={selectedPatient?.PrimaryDoctorId}
              patientId={selectedPatient?.PatientId}
              visitId={selectedPatient?.VisitId}
              initialEntries={templateEntriesByTemplateId?.[selectedTemplate?.templateId]}
              onEntriesChange={onTemplateEntriesChange ?? (() => {})}
              onPrint={onPrintTemplate ?? (() => {})}
              templateCode={TemplateMappingCode?.OT_NOTES}
            />
          </div>
          <div className="mt-1 justify-end flex">
            <button className="save-btn" onClick={saveHandler}>
              Save
            </button>
          </div>
        </>
      ) : (
        <></>
      )}

      {/* print */}
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        doctorId={selectedPatient?.PrimaryDoctorId}
        patientId={selectedPatient?.PatientId}
        usedForPatientTypeId={2}
        patient={selectedPatient}
        emrSectionsData={templateEntriesByTemplateId?.[Number(selectedTemplate?.templateId!)]}
        vitals={[]}
        vitalsData={[]}
        allergy={[]}
      />

      {loading && <CustomLoader isLoading={loading} />}
    </CentralPopup>
  );
};

export default OtNoteTemplate;
