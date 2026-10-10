import CentralPopup from "@/components/centralPopup";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import TemplateInlineSections from "@/screens/doctorConsultationNew/components/TemplateInlineSections";
import { EmrSectionAnswerEntry } from "@/screens/doctorConsultationNew/types";
import { TemplateItem } from "@/screens/emrTemplates/types";
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

  console.log("templateEntriesByTemplateId", templateEntriesByTemplateId);

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

  //   consulation details
  const consultationDetailsPayloadData = () => {
    return {
      doctorId: selectedPatient?.PrimaryDoctorId,
      patientId: selectedPatient?.PatientId,
      visitId: selectedPatient?.VisitId,
      visitTypeId: selectedPatient?.VisitTypeId,
      isFileClosed: selectedPatient?.IsFileClosed,
      isTemperatureRoomOut: 0,
      patientVitalId: 0,
      vitalDateTime: "",
    };
  };

  //   consultation headers data
  const consultationHeadersDataPayloadData = () => {
    return templateEntriesByTemplateId?.[templateId].map((item: EmrSectionAnswerEntry) => {
      return {
        dataId: item?.dataId ?? 0,
        sectionId: item?.sectionId,
        headerId: item?.headerId,
        controlTypeId: item?.controlTypeId,
        templateId: item?.templateId,
        headerValue: item?.headerName,
      };
    });
  };

  //   save handler
  const saveHandler = async () => {
    const payload = {
      consultationDetails: consultationDetailsPayloadData(),
      consultationHeadersData: consultationHeadersDataPayloadData(),
      patientVitalValue: [
        {
          vitalId: 0,
          vitalValue: "",
        },
      ],
    };

    console.log("payload", payload);
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
            <TemplateInlineSections
              key={selectedTemplate?.templateId}
              template={selectedTemplate}
              doctorId={selectedPatient?.PrimaryDoctorId}
              patientId={selectedPatient?.PatientId}
              visitId={selectedPatient?.VisitId}
              initialEntries={templateEntriesByTemplateId?.[selectedTemplate?.templateId]}
              onEntriesChange={onTemplateEntriesChange ?? (() => {})}
              onPrint={onPrintTemplate ?? (() => {})}
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

      {loading && <CustomLoader isLoading={loading} />}
    </CentralPopup>
  );
};

export default OtNoteTemplate;
