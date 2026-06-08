import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { TemplatePopupHeaderMaster } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { InvestigationTableItem, TemplateItem } from "../types";
import CreateUpdateTemplatePopup from "./CreateUpdateTemplatePopup";

const TemplatePopup = ({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: InvestigationTableItem;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [selectedTemplatedId, setSelectedTemplateId] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);

  const [savePayload, setSavePayload] = useState<TemplateItem[]>([]);
  const [error, setError] = useState<string>("");

  const [openCreateUpdatePopup, setOpenCreateUpdatePopup] = useState<boolean>(false);
  const [renderCreateUpdatePopup, setRenderCreateUpdatePopup] = useState<boolean>(false);
  const [templateError, setTemplateError] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const getInvestigationTemplate = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_TEMPLATE_INTERPRETATION_MAPPINGS,
      {},
      { params: { investigationId: data?.serviceItemId } },
      { component: "TemplatePopup" }
    );
    return resp?.data;
  };

  const { data: templateList = [] } = useQuery({
    queryKey: [getInvestigationTemplate],
    queryFn: getInvestigationTemplate,
  });

  //   template select handler
  const templateSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);

    setSelectedTemplateId(value);

    setTemplateError("");

    if (!value) {
      setTemplateError("Please select at least one template");
      setSelectedTemplate(null);
      setSelectedTemplateId(0);
      return;
    }

    const existItem = savePayload.find(i => i?.ItemId === value);

    if (existItem) {
      setSelectedTemplate(existItem);
      setError("This is already added please select another one");
      return;
    }

    setError("");

    const selectedTemplate = templateList?.find((t: TemplateItem) => Number(t?.ItemId) === value);
    setSelectedTemplate(selectedTemplate);

    if (selectedTemplate) {
      setSavePayload(prev => [...prev, selectedTemplate]);
    }
  };

  //   delete handler
  const deleteHandler = (item: TemplateItem) => {
    const filteredData = savePayload.filter((s: TemplateItem) => s?.ItemId !== item?.ItemId);
    setSavePayload(filteredData);
  };

  const createPayload = (savePayload: TemplateItem[]) => {
    const payload = savePayload?.map(p => ({
      typeId: p?.TypeId,
      type: p?.Type,
      investigationId: p?.InvestigationId,
      itemid: p?.ItemId,
    }));
    return payload;
  };

  //   submit handler
  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (savePayload.length === 0) {
      setTemplateError("Please select at least one template");
      return;
    }

    setTemplateError("");
    const payload = createPayload(savePayload);

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_INVESTIGATION_TEMPLATE_INTERPRETATION_MAPPING,
      payload,
      {},
      { component: "TemplatePopup" }
    );
    if (!resp?.message) {
      showWarning(resp?.message ?? "failed while mapping templates");
      setIsSubmitting(false);
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    onClose?.();
    setSavePayload([]);
    setError("");
    setSelectedTemplateId(0);
    setIsSubmitting(false);
  };

  //   button click handler
  const buttonClickHandler = (value: string) => {
    switch (value) {
      case "newTemplate": {
        setTemplateError("");
        setOpenCreateUpdatePopup(true);
        setRenderCreateUpdatePopup(true);
        return;
      }

      case "updateTemplate": {
        if (!selectedTemplatedId) {
          setTemplateError("Please select at least one template");
          return;
        }

        setTemplateError("");
        setOpenCreateUpdatePopup(true);
        setRenderCreateUpdatePopup(true);
        return;
      }

      default:
        return;
    }
  };

  //   close popup handler
  const closePopupHandler = useCallback(() => {
    setOpenCreateUpdatePopup(false);
    setTemplateError("");
    setSelectedTemplate(null);
    setSelectedTemplateId(0);
  }, []);

  function reset() {
    setSavePayload([]);
    setSelectedTemplate(null);
    setSelectedTemplateId(0);
    setTemplateError("");
  }

  const onCloseHandler = () => {
    reset();
    setTemplateError("");
    setError("");
    onClose();
  };

  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-250 ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header">
          <h2 className="popup-helper-text">Template Mapping</h2>
          <button onClick={onCloseHandler} className="close-drawer-btn">
            ×
          </button>
        </div>
        <div className="form-grid-4 ">
          <InputField label="Template list">
            <select
              className="input-field"
              onChange={templateSelectHandler}
              value={selectedTemplatedId}
            >
              <option value={0}>Select Template</option>
              {templateList?.map((t: TemplateItem) => (
                <option value={t?.ItemId} key={t?.ItemId}>
                  {t?.Name}
                </option>
              ))}
            </select>
            {isSubmitting && templateError && <p className="input-field-error">{templateError}</p>}
          </InputField>
          <button
            type="button"
            className={`${selectedTemplatedId ? "disabled-btn" : "save-btn"} h-10 max-w-35 mt-6`}
            onClick={() => buttonClickHandler("newTemplate")}
            disabled={!!selectedTemplatedId}
          >
            New Template
          </button>

          <button
            type="button"
            className={`${!selectedTemplatedId ? "disabled-btn" : "save-btn"} h-10 max-w-40 mt-6 -ml-20`}
            onClick={() => buttonClickHandler("updateTemplate")}
            disabled={!selectedTemplatedId}
          >
            Update Template
          </button>
        </div>

        {/* table */}

        <div className="table-container ">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-58 lg:max-h-58 ">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {TemplatePopupHeaderMaster.map((h, index) => (
                      <th key={index} className="table-th ">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {savePayload?.length === 0 && (
                    <tr>
                      <td colSpan={TemplatePopupHeaderMaster.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {savePayload.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>

                      <td className="table-td">{item?.Type || "-"}</td>

                      <td className="table-td">{item?.Name || "-"}</td>

                      <td className="table-td" onClick={() => deleteHandler(item)}>
                        <i className="fa-solid fa-trash  icon-color-delete" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {!!error && <p className="input-field-error">{error}</p>}

        <div className="form-actions-responsive mt-5">
          <button type="submit" className="save-btn" onClick={submitHandler}>
            Save
          </button>
        </div>
      </div>

      {!!loading && <CustomLoader isLoading={loading} />}

      {/* create update popup */}
      {!!renderCreateUpdatePopup && (
        <CreateUpdateTemplatePopup
          isOpen={openCreateUpdatePopup}
          onClose={closePopupHandler}
          data={selectedTemplate ?? null}
          refreshTemplate={setSelectedTemplate}
          resetTemplateId={setSelectedTemplateId}
        />
      )}
    </div>,
    document.body
  );
};

export default TemplatePopup;
