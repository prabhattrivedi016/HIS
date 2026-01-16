import React, { ChangeEvent, useEffect, useState } from "react";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ErrorMessage, SuccessMessage } from "../../../components/infoText";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { SequenceDrawerProps } from "../types";

const SequenceDrawer = React.memo(({ data, onClose, onSuccess }: SequenceDrawerProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const isEdit = Boolean(data?.sequenceId);
  const drawerTitle = isEdit ? "Update Sequence" : "Create Sequence";
  const buttonTitle = isEdit ? "Update " : "Create ";

  const [preview, setPreview] = useState<string>("");

  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    sequenceId: 0,
    name: "",
    typeId: data?.typeId,
    typeName: data?.typeName,
    prefix: "",
    firstSeprator: "",
    fyFormatId: 0,
    fyFormat: "",
    secondSeprator: "",
    length: 6,
    preview: "",
  });

  useEffect(() => {
    if (!data) return;

    setFormData({
      sequenceId: data.sequenceId ?? 0,
      name: data.name ?? "",
      typeId: data.typeId ?? 0,
      typeName: data.typeName ?? "",
      prefix: data.prefix ?? "",
      firstSeprator: data.firstSeprator ?? "",
      fyFormatId: data.fyFormatId ?? 0,
      fyFormat: data.fyFormat ?? "",
      secondSeprator: data.secondSeprator ?? "",
      length: data.length ?? 6,
      preview: data.preview ?? "",
    });
  }, [data]);

  useEffect(() => {
    const { prefix, firstSeprator, length } = formData;

    if (!prefix || !length) {
      setPreview("");
      return;
    }
    const numericPart = String(1).padStart(Number(length), "0");
    const generatedPreview = `${prefix}${firstSeprator || ""}${numericPart}`;
    setPreview(generatedPreview);
  }, [formData.prefix, formData.firstSeprator, formData.length]);

  /* -------------------- Input Handler -------------------- */
  const inputHandler = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(true);

    if (!formData.name.trim()) return;

    const payload = {
      ...formData,
      preview,
    };

    try {
      const resp = await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_SEQUENCE_MASTER, payload);

      if (!resp) return;

      setSuccessMessage(resp.message);

      setTimeout(() => {
        onSuccess();
        onClose;
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setShowError(false);
    }
  };

  const cancelHandler = () => {
    onClose();
  };

  return (
    <div>
      <div className="drawer-bg-fade opacity-100 visible  " onClick={onClose} />

      <div className="drawer-layout drawer-bg translate-x-0 lg:w-[1000px]">
        <div className="drawer-title-border ">
          <h2 className="drawer-title">{drawerTitle}</h2>
          <button onClick={onClose} className="drawer-close-btn">
            ×
          </button>
        </div>

        <div className="p-4">
          {/* success & error message*/}
          <div className="mb-2">
            {successMessage && <SuccessMessage text={successMessage} />}
            {error && <ErrorMessage text={error} />}
          </div>
          <form className="" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-2">
              <InputField label="Name" required={true}>
                <input
                  name="name"
                  type="text "
                  value={formData?.name}
                  className="input-field"
                  onChange={inputHandler}
                />

                {showError && !formData.name.trim() && (
                  <p className="input-field-error">Name is required</p>
                )}
              </InputField>
              <InputField label="Preview" required={false}>
                <input
                  name="preview"
                  type="text"
                  className="input-field"
                  value={preview}
                  readOnly={true}
                />
              </InputField>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-2 lg:grid-cols-3">
              <InputField label="Prefix" required={false}>
                <input
                  type="text"
                  name="prefix"
                  className="input-field"
                  value={formData?.prefix}
                  onChange={inputHandler}
                />
              </InputField>
              <InputField label="1st Separator" required={false}>
                <select
                  className="input-field"
                  name="firstSeprator"
                  onChange={inputHandler}
                  value={formData?.firstSeprator}
                >
                  <option value=""></option>
                  <option value="/">/</option>
                  <option value="-">-</option>
                </select>
              </InputField>
              <InputField label="FY Format" required={false}>
                <select
                  className="input-field"
                  value={formData?.fyFormat}
                  name="fyFormat"
                  onChange={inputHandler}
                >
                  <option value={0}></option>
                  <option value={1}>25-26</option>
                  <option value={2}>2026</option>
                </select>
              </InputField>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-2 lg:grid-cols-3">
              <InputField label="2nd Separator" required={false}>
                <select
                  className="input-field"
                  value={formData?.secondSeprator}
                  name="secondSeprator"
                  onChange={inputHandler}
                >
                  <option value=""></option>
                  <option value="/">/</option>
                  <option value="-">-</option>
                </select>
              </InputField>
              <InputField label="Length" required={true}>
                <select
                  className="input-field"
                  value={formData?.length}
                  name="length"
                  onChange={inputHandler}
                >
                  <option value="">Select</option>
                  <option value="6">000001</option>
                  <option value="7">0000001</option>
                  <option value="8">00000001</option>
                  <option value="9">000000001</option>
                </select>
              </InputField>
            </div>
            <div className="flex w-full gap-3 mt-5">
              <button type="submit" className="grid-active-btn">
                {buttonTitle}
              </button>
              <button type="button" className="grid-edit-btn" onClick={cancelHandler}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
});

export default SequenceDrawer;
