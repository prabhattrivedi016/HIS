import TextEditor from "@/components/ckEditor";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { InvestigationTableItem } from "../types";

const InterpretationPopup = ({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: InvestigationTableItem;
}) => {
  const { error, loading, fetchApi } = useGlobalApi();
  const [textValue, setTextValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    id: 0,
    typeId: 2,
    type: "Interpretation",
    name: "",
    contentValue: "",
    isActive: 1,
  });

  const buttonTitle = formData?.id ? "Update" : "Create";

  // template interpretation mapping
  const getTemplateInterpretationMapping = async (investigationId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_TEMPLATE_INTERPRETATION_MAPPINGS,
      {},
      { params: { investigationId } },
      { component: "InterpretationPopup" }
    );
    const respValue = resp?.data?.[0];
    setFormData({
      id: respValue?.ItemId ?? 0,
      typeId: 2,
      type: "Interpretation",
      name: respValue?.Name ?? "",
      contentValue: "",
      isActive: 1,
    });

    return resp?.data?.[0];
  };

  const { data: interpretation, refetch } = useQuery({
    queryKey: ["getTemplateInterpretationMapping", data?.serviceItemId],
    queryFn: () => getTemplateInterpretationMapping(data?.serviceItemId),
    enabled: false,
  });

  useEffect(() => {
    if (isOpen && data?.serviceItemId) {
      refetch();
    }
  }, [isOpen, data?.serviceItemId]);

  // get content value
  const getContentValue = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_TEMPLATE_COMMENT_MASTER,
      {},
      { params: { id: interpretation?.ItemId, typeId: 2 } },
      { component: "InterpretationPopup" }
    );
    const respResult = resp?.data?.[0];
    setFormData({
      id: respResult.Id ?? 0,
      typeId: respResult.Typeid ?? 2,
      type: respResult.Type ?? "",
      name: respResult.Name ?? "",
      contentValue: respResult.ContentValue ?? "",
      isActive: respResult.IsActive ?? 1,
    });
    setTextValue(respResult.ContentValue);
  };

  useEffect(() => {
    if (interpretation !== undefined) {
      getContentValue();
    }
  }, [interpretation]);

  const textChangeHandler = (value: string) => {
    setTextValue(value);
  };

  // input change handler
  const inputChangeHandler = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // save mapping
  const saveMapping = async (itemid: number) => {
    const payload = [
      {
        typeId: 2,
        type: "Interpretation",
        investigationId: data?.serviceItemId,
        itemid,
      },
    ];
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_INVESTIGATION_TEMPLATE_INTERPRETATION_MAPPING,
      payload,
      {},
      { component: "InterpretationPopup" }
    );
    if (!resp?.data) {
      showWarning(resp?.data ?? "failed to save interpretation");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    setFormData({
      id: 0,
      typeId: 1,
      type: "Interpretation",
      name: "",
      contentValue: "",
      isActive: 1,
    });
    onClose?.();
    setTextValue("");
    setIsSubmitting(false);
  };

  // submit handler
  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = [{ ...formData, contentValue: textValue }];
    setIsSubmitting(true);
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_INVESTIGATION_TEMPLATE_COMMENT_MASTER,
      payload,
      {},
      { component: "InterpretationPopup" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "failed to save interpretation");
      return;
    }
    saveMapping(Number(resp?.data?.itemId));
  };

  // cancel handler
  const cancelHandler = () => {
    setFormData({
      id: 0,
      typeId: 2,
      type: "Interpretation",
      name: "",
      contentValue: "",
      isActive: 1,
    });
    setTextValue("");
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
          <h2 className="popup-helper-text">Investigation Interpretation</h2>
          <button onClick={onClose} className="close-drawer-btn">
            ×
          </button>
        </div>
        <form onSubmit={submitHandler}>
          <div className="form-grid-4">
            <InputField label="Interpretation">
              <input
                className="disabled-input-field"
                name="type"
                value={formData?.type}
                disabled={true}
                onChange={inputChangeHandler}
              />
            </InputField>

            <InputField label="Template Name">
              <input
                className="input-field"
                name="name"
                placeholder="Enter template name"
                value={formData?.name}
                onChange={inputChangeHandler}
              />
              {!formData?.name && !!isSubmitting && (
                <span className="input-field-error">{"Template Name is required"}</span>
              )}
            </InputField>

            <InputField label="Status">
              <select
                className="input-field"
                name="isActive"
                value={formData?.isActive}
                onChange={inputChangeHandler}
              >
                <option value={1}>Active</option>
                <option value={2}>Inactive</option>
              </select>
            </InputField>
          </div>

          <div className="mt-4">
            <TextEditor value={textValue} onChange={textChangeHandler} />
            {!formData?.name && !!isSubmitting && (
              <span className="input-field-error">{"Content value is required"}</span>
            )}
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
      </div>

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default InterpretationPopup;
