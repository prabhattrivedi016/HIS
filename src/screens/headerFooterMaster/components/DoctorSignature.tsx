import React, { ChangeEvent, useMemo, useState } from "react";
import InputField from "../../../components/customInputField";
import { FILE_UPLOAD_RULES } from "../../../constants/constants";
import useGetBranchList from "../../../hooks/useGetBranchList";
import { BranchItem } from "../types";

const DoctorSignature = () => {
  const [fileError, setFileError] = useState<string>("");
  const [formData, setFormData] = useState({
    branchId: 0,
    docName: "",
    xAxis: 20,
    yAxis: 10,
    signDoc: null as File | null,
  });

  /* -------------------- Branches -------------------- */
  const branchValues = useGetBranchList();
  const branches = useMemo<BranchItem[]>(
    () => branchValues?.branchList?.data ?? [],
    [branchValues]
  );

  /*--------------------------input handler------------------------------- */

  const inputHandler = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, files } = e.target as HTMLInputElement;

    if (type === "file" && files?.[0]) {
      const file = files[0];

      if (!FILE_UPLOAD_RULES.ALLOWED_TYPES?.includes(file.type)) {
        setFileError("Only PNG, JPG, JPEG files are allowed");
        e.target.value = "";
        return;
      }

      if (file.size > FILE_UPLOAD_RULES.MAX_FILE_SIZE) {
        setFileError("File size must be less than 2MB");
        e.target.value = "";
        return;
      }

      setFileError("");

      setFormData(prev => ({
        ...prev,
        signDoc: file,
      }));

      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === "branchId" || name === "xAxis" || name === "yAxis" ? Number(value) : value,
    }));
  };

  const handleDoctorSignature = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("branchId", String(formData.branchId));
    payload.append("docName", formData.docName);
    payload.append("xAxis", String(formData.xAxis));
    payload.append("yAxis", String(formData.yAxis));
    payload.append("signDoc", formData.signDoc);

    for (const [key, value] of payload.entries()) {
      console.log(key, value);
    }
  };

  return (
    <div className="shadow-lg m-2 p-6 rounded-lg">
      <form onSubmit={handleDoctorSignature}>
        <h2 className="mb-4 text-xl font-semibold">Doctor Signature </h2>

        <div className="form-grid-4">
          <InputField label="Branch Name">
            <select
              className="input-field"
              onChange={inputHandler}
              name="branchId"
              value={formData?.branchId}
            >
              <option value={0}>Default</option>
              {branches?.map(b => (
                <option key={b?.branchId} value={b?.branchId}>
                  {b?.branchName}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="Doctor Name">
            <input
              type="text"
              placeholder="Doctor Name"
              className="input-field"
              onChange={inputHandler}
              name="docName"
              value={formData?.docName}
            />
          </InputField>

          <InputField label="X-Axis Signature (Horizontal Move)">
            <input
              type="text"
              placeholder="X-Axis"
              className="input-field"
              onChange={inputHandler}
              name="xAxis"
              value={formData?.xAxis}
            />
          </InputField>

          <InputField label="Y-Axis Signature (Vertical Move)">
            <input
              type="text"
              placeholder="Y-Axis"
              className="input-field"
              onChange={inputHandler}
              name="yAxis"
              value={formData?.yAxis}
            />
          </InputField>
          <InputField label="Signature Upload">
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={inputHandler}
              name="signDoc"
              className="file-upload"
            />
            {fileError && <p className="input-field-error">{fileError}</p>}
          </InputField>
        </div>
        <button type="submit" className="grid-active-btn">
          Save
        </button>
      </form>
    </div>
  );
};

export default React.memo(DoctorSignature);
