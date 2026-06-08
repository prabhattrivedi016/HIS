import TextEditor from "@/components/ckEditor";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TemplateItem } from "../types";

const CreateUpdateTemplatePopup = ({
  isOpen,
  onClose,
  data,
  refreshTemplate,
  resetTemplateId,
}: {
  isOpen: boolean;
  onClose: () => void;
  data?: TemplateItem | null;
  refreshTemplate: any;
  resetTemplateId: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const [textValue, setTextValue] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [templateNameError, setTemplateNameError] = useState<string>("");
  const [textEditorError, setTextEditorError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const buttonTitle = data?.ItemId! > 0 ? "Update" : "Create";

  const [templateFormData, setTemplateFormData] = useState({
    id: 0,
    typeId: 1,
    type: "Template",
    name: "",
    contentValue: "",
    isActive: 1,
  });

  const getTemplateFields = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_TEMPLATE_COMMENT_MASTER,
      {},
      { params: { id: data?.ItemId, typeId: Status?.ACTIVE } },
      { component: "CreateUpdateTemplatePopup" }
    );
    const value = resp?.data?.[0];
    setTemplateFormData({
      id: value?.Id ?? 0,
      typeId: 1,
      type: "Template",
      name: value?.Name ?? "",
      contentValue: value?.ContentValue,
      isActive: value?.IsActive ?? 1,
    });
    setTextValue(value?.ContentValue);
  };

  //   get template
  useEffect(() => {
    if (!isOpen) return;

    if (!data) {
      setTemplateFormData({
        id: 0,
        typeId: 1,
        type: "Template",
        name: "",
        contentValue: "",
        isActive: 1,
      });

      setTextValue("");
      return;
    }

    getTemplateFields();
  }, [isOpen, data]);

  //   input handler
  const inputFieldHandler = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setTemplateFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === "name") {
      if (!value.trim()) {
        setTemplateNameError("Please add template name");
      } else {
        setTemplateNameError("");
      }
    }
  };

  //   text change handler
  const textChangeHandler = (value: string) => {
    if (value === "") {
      setTextEditorError("Please add some content");
      setTextValue("");
      return;
    }
    setTextValue(value);
    setTemplateFormData(prev => ({
      ...prev,
      contentValue: value,
    }));
  };

  const saveTemplateMapping = async (itemid: number) => {
    const payload = [
      { typeId: 1, type: "Template", investigationId: data?.InvestigationId, itemid },
    ];
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_INVESTIGATION_TEMPLATE_INTERPRETATION_MAPPING,
      payload,
      {},
      { component: "CreateUpdateTemplatePopup" }
    );
    if (!resp?.result) {
      setErrorMessage(resp?.message ?? "Failed to save mapping");
      return;
    }
    setSuccessMessage(resp?.message ?? "Data saved successfully");
    setErrorMessage("");
    refreshTemplate(0);

    setTimeout(() => {
      setTemplateFormData({
        id: 0,
        typeId: 1,
        type: "Template",
        name: "",
        contentValue: "",
        isActive: 1,
      });
      setTextValue("");
      onClose?.();
      setSuccessMessage("");
    }, 500);
  };

  //   submit handler
  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    let isValid = true;

    // Template Name validation
    if (!templateFormData.name.trim()) {
      setTemplateNameError("Please add template name");
      isValid = false;
    }

    if (!textValue) {
      setTextEditorError("Please add some content");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    setTemplateNameError("");
    setTextEditorError("");
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_INVESTIGATION_TEMPLATE_COMMENT_MASTER,
      [templateFormData],
      {},
      { component: "CreateUpdateTemplatePopup" }
    );
    if (!resp?.result) {
      setErrorMessage(resp?.message ?? "Failed to save template");
      return;
    }

    saveTemplateMapping(Number(resp?.data?.itemId));
  };

  const resetForm = () => {
    if (data === null) {
      setTemplateFormData({
        id: 0,
        typeId: 1,
        type: "Template",
        name: "",
        contentValue: "",
        isActive: 1,
      });

      setTextValue("");
      setSuccessMessage("");
      setErrorMessage("");
      setTemplateNameError("");
      setTextEditorError("");
      setIsSubmitting(false);

      refreshTemplate?.(null);
      resetTemplateId?.(0);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
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
          <button onClick={handleClose} className="close-drawer-btn">
            ×
          </button>
        </div>
        {!!successMessage && <SuccessMessage text={successMessage} />}
        {!!errorMessage && <ErrorMessage text={errorMessage} />}
        <form onSubmit={submitHandler}>
          <div className="form-grid-4 ">
            <InputField label="Template">
              <input
                className="disabled-input-field cursor-not-allowed"
                name="type"
                value={templateFormData?.type}
                onChange={inputFieldHandler}
                disabled={true}
              />
            </InputField>

            <InputField label="Template Name">
              <input
                className="input-field"
                name="name"
                value={templateFormData?.name}
                onChange={inputFieldHandler}
              />
              {isSubmitting && templateNameError && (
                <p className="input-field-error">{templateNameError}</p>
              )}
            </InputField>

            <InputField label="Status">
              <select
                className="input-field"
                name="isActive"
                value={templateFormData?.isActive}
                onChange={inputFieldHandler}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </InputField>
          </div>
          <TextEditor value={textValue} onChange={textChangeHandler} />
          {isSubmitting && textEditorError && (
            <p className="input-field-error">{textEditorError}</p>
          )}

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            {/* <button type="button" className="cancel-button">
              Cancel
            </button> */}
          </div>
        </form>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default CreateUpdateTemplatePopup;
