import { AnimatePresence, motion } from "framer-motion";
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { SelectStyles } from "../../../components/customSelect";
import { ENDPOINTS } from "../../../config/defaults";
import { DoctorSignatureTableHeader, FILE_UPLOAD_RULES } from "../../../constants/constants";
import useGetBranchList from "../../../hooks/useGetBranchList";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { BranchItem, DoctorItem, DoctorTableItem, SelectItem } from "../types";
import LetterHeadImagePreview from "./LetterHeadImagePreview";

const DoctorSignature = () => {
  const { loading, fetchApi } = useGlobalApi();

  const [fileError, setFileError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [doctorTableList, setDoctorTableList] = useState<DoctorTableItem[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(0);

  const [doctorsList, setDoctorsList] = useState<DoctorItem[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<SelectItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const buttonTitle = isEdit ? "Update" : "Save";

  const [formData, setFormData] = useState({
    Id: 0,
    BranchId: 0,
    DoctorId: 0,
    xSign: 20,
    ySign: 10,
    DocSignFile: null as File | null,
  });

  const branchValues = useGetBranchList();

  const branches = useMemo<BranchItem[]>(
    () => branchValues?.branchList?.data ?? [],
    [branchValues]
  );

  const getDoctorsList = async (branchId: number) => {
    if (!branchId) return;

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER_LIST_BY_BRANCH_ID,
      {},
      { params: { branchId } }
    );

    setDoctorsList(resp?.data ?? []);
  };

  useEffect(() => {
    getDoctorsList(formData?.BranchId);
  }, [formData.BranchId]);

  const doctorSelectOption = useMemo<SelectItem[]>(
    () =>
      doctorsList.map(d => ({
        label: d?.name,
        value: d?.doctorId,
      })),
    [doctorsList]
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.BranchId || formData.BranchId === 0) {
      newErrors.BranchId = "Branch is required";
    }

    if (!formData.DoctorId || formData.DoctorId === 0) {
      newErrors.DoctorId = "Doctor is required";
    }

    if (formData.xSign === null || formData.xSign < 0 || formData.xSign > 1000) {
      newErrors.xSign = "X-Axis value must be between 0 and 1000";
    }

    if (formData.ySign === null || formData.ySign < 0 || formData.ySign > 1000) {
      newErrors.ySign = "Y-Axis value must be between 0 and 1000";
    }

    if (!formData.DocSignFile) {
      newErrors.DocSignFile = "Signature file is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const doctorChangeHandler = (option: SelectItem | null) => {
    setSelectedDoctor(option);
    setErrors(p => ({ ...p, DoctorId: "" }));

    setFormData(prev => ({
      ...prev,
      DoctorId: option?.value ?? 0,
    }));
  };

  const inputHandler = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;

    setErrors(p => ({ ...p, [name]: "" }));

    if (name === "DocSignFile" && files?.[0]) {
      const file = files[0];

      if (!FILE_UPLOAD_RULES.ALLOWED_TYPES.includes(file.type)) {
        setFileError("Only PNG, JPG, JPEG files allowed");
        return;
      }

      if (file.size > FILE_UPLOAD_RULES.MAX_FILE_SIZE) {
        setFileError("File must be less than 5MB");
        return;
      }

      setFileError("");

      setFormData(prev => ({
        ...prev,
        DocSignFile: file,
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleDoctorSignature = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = new FormData();

    payload.append("Id", String(isEdit ? selectedId : 0));
    payload.append("BranchId", String(formData.BranchId));
    payload.append("DoctorId", String(formData.DoctorId));
    payload.append("xSign", String(formData.xSign));
    payload.append("ySign", String(formData.ySign));

    if (formData.DocSignFile) {
      payload.append("DocSignFile", formData.DocSignFile);
    }

    await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_DOCTOR_SIGNATURE_MASTER, payload);

    resetForm();
    getDoctorTableList();
  };

  const resetForm = () => {
    setIsEdit(false);
    setSelectedId(0);
    setSelectedDoctor(null);
    setFileError("");
    setErrors({});

    setFormData({
      Id: 0,
      BranchId: 0,
      DoctorId: 0,
      xSign: 20,
      ySign: 10,
      DocSignFile: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getDoctorTableList = async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_DOCTOR_SIGNATURE_MASTER_LAST);
    setDoctorTableList(resp?.data ?? []);
  };

  useEffect(() => {
    getDoctorTableList();
  }, []);

  const editHandler = (item: DoctorTableItem) => {
    setIsEdit(true);
    setSelectedId(item.id);

    setSelectedDoctor({
      label: item.doctorName,
      value: item.doctorId,
    });

    setFormData({
      Id: item.id,
      BranchId: item.branchId,
      DoctorId: item.doctorId,
      xSign: item.xSign,
      ySign: item.ySign,
      DocSignFile: null,
    });
  };

  const deleteHandler = async (item: DoctorTableItem) => {
    await fetchApi(
      "PATCH",
      ENDPOINTS.DELETE_DOCTOR_SIGNATURE_MASTER,
      {},
      { params: { id: item.id } }
    );

    getDoctorTableList();
  };

  return (
    <>
      <div className="shadow-lg m-2 p-6 rounded-lg">
        <form onSubmit={handleDoctorSignature}>
          <h2 className="mb-4 text-xl font-semibold">Doctor Signature</h2>

          <div className="form-grid-4">
            <InputField label="Branch Name" required>
              <select
                className="input-field"
                name="BranchId"
                value={formData.BranchId}
                onChange={inputHandler}
              >
                <option value={0}>Default</option>
                {branches.map(b => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchName}
                  </option>
                ))}
              </select>
              {errors.BranchId && <p className="input-field-error">{errors.BranchId}</p>}
            </InputField>

            <InputField label="Doctor Name" required>
              <Select
                value={selectedDoctor}
                options={doctorSelectOption}
                isSearchable
                isClearable
                placeholder="Select..."
                onChange={doctorChangeHandler}
                classNames={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.DoctorId && <p className="input-field-error">{errors.DoctorId}</p>}
            </InputField>

            <InputField label="X-Axis Signature (Horizontal Move)">
              <input
                className="input-field"
                name="xSign"
                value={formData.xSign}
                onChange={inputHandler}
              />

              {errors.xSign && <p className="input-field-error">{errors.xSign}</p>}
            </InputField>

            <InputField label="Y-Axis Signature (Vertical Move)">
              <input
                className="input-field"
                name="ySign"
                value={formData.ySign}
                onChange={inputHandler}
              />

              {errors.ySign && <p className="input-field-error">{errors.ySign}</p>}
            </InputField>

            <InputField label="Signature Upload" required>
              <input
                ref={fileInputRef}
                type="file"
                name="DocSignFile"
                accept=".png,.jpg,.jpeg"
                onChange={inputHandler}
                className="file-upload"
              />

              {fileError && <p className="input-field-error">{fileError}</p>}

              {errors.DocSignFile && <p className="input-field-error">{errors.DocSignFile}</p>}
            </InputField>

            <div className="flex justify-end gap-3 mt-6 col-start-4">
              <button type="submit" className="bg-[#0b5394] rounded-lg text-white min-w-20 h-10">
                {buttonTitle}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="shadow-lg m-2 p-6 rounded-lg bg-white overflow-hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Doctor Signature List</h2>

          <button
            className="border border-gray-500 bg-[#1e6da1] rounded-lg text-white px-4 py-2 active:scale-95"
            onClick={() => setShowDetails(p => !p)}
          >
            {showDetails ? "Hide" : "Show"}
          </button>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="max-w-290 w-full   rounded-xl shadow-lg border border-gray-200 mt-4 overflow-hidden bg-white">
                <div className="max-h-80 overflow-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-[#f5f9ff] sticky top-0 z-10">
                      <tr>
                        {DoctorSignatureTableHeader.map((h, index) => (
                          <th
                            key={index}
                            className="px-1 py-3 text-left font-semibold text-gray-900 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {doctorTableList.map((item, idx) => (
                        <tr
                          key={item?.id}
                          className="hover:bg-gray-150 transition last:border-none"
                        >
                          <td className="px-2 py-3 text-gray-500">{idx + 1}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.branchName}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.doctorName}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.xSign}</td>
                          <td className="px-1 py-3 text-gray-500">{item?.ySign}</td>

                          <td>
                            <LetterHeadImagePreview pathName={item.docSignPath} />
                          </td>
                          <td className="px-1 py-3 text-gray-500">
                            <i className="fa-solid fa-download fa-2xl text-blue-600"></i>
                          </td>
                          <td className="px-2 py-3 text-blue-500" onClick={() => editHandler(item)}>
                            <i className="fa-edit fa-solid fa-xl"></i>
                          </td>
                          <td
                            className="px-2 py-3 text-gray-500"
                            onClick={() => deleteHandler(item)}
                          >
                            <i className="fa fa-trash text-red-500 fa-xl" aria-hidden="true"></i>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </>
  );
};

export default React.memo(DoctorSignature);
