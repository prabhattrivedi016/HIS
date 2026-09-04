import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import { SelectStyles } from "@/components/customSelect";
import { showSuccess, showWarning } from "@/utils/alert";
import { doctorSignatureSchema } from "@/validation/printSettingSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import CustomLoader from "../../../components/customLoader";
import { ENDPOINTS } from "../../../config/defaults";
import { DoctorSignatureTableHeader } from "../../../constants/constants";
import useGetBranchList from "../../../hooks/useGetBranchList";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { BranchItem, DoctorItem, DoctorTableItem, SelectItem } from "../types";
import LetterHeadImagePreview from "./LetterHeadImagePreview";

const DoctorSignature = () => {
  const { loading, fetchApi } = useGlobalApi();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [doctorTableList, setDoctorTableList] = useState<DoctorTableItem[]>([]);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(0);

  const [doctorsList, setDoctorsList] = useState<DoctorItem[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<SelectItem | null>(null);
  const [defaultBranch, setDefaultBranch] = useState<BranchItem | null>(null);

  const buttonTitle = isEdit ? "Update" : "Create";

  const branchValues = useGetBranchList();

  const branches = useMemo<BranchItem[]>(
    () => branchValues?.branchList?.data ?? [],
    [branchValues]
  );

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(doctorSignatureSchema),
    defaultValues: {
      Id: 0,
      BranchId: defaultBranch?.branchId,
      DoctorId: 0,
      xSign: 20,
      ySign: 10,
      DocSignFile: null,
    },
  });

  useEffect(() => {
    const selected = branches.find(b => b?.branchId === 1);
    setValue("BranchId", selected?.branchId!);
    setDefaultBranch(selected!);
  }, [branches]);

  const currentBranch = watch("BranchId");

  /* ---------------- doctors list ---------------- */
  const getDoctorsList = async (branchId: number) => {
    if (!branchId) return;

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER_LIST_BY_BRANCH_ID,
      {},
      { params: { branchId, isDoctorUnit: 0 } },
      { component: "DoctorSignature" }
    );

    setDoctorsList(resp?.data ?? []);
  };

  useEffect(() => {
    getDoctorsList(currentBranch);
  }, [currentBranch]);

  const doctorSelectOption = useMemo<SelectItem[]>(
    () =>
      doctorsList.map(d => ({
        label: d?.name,
        value: d?.doctorId,
      })),
    [doctorsList]
  );

  const doctorChangeHandler = (option: SelectItem | null) => {
    setSelectedDoctor(option);
    setValue("DoctorId", option?.value ?? 0, { shouldValidate: true });
  };

  /* ---------------- submit ---------------- */
  const onsubmit = async (formData: any) => {
    const payload = new FormData();
    payload.append("Id", String(isEdit ? selectedId : 0));
    payload.append("BranchId", String(formData.BranchId));
    payload.append("DoctorId", String(formData.DoctorId));
    payload.append("xSign", String(formData.xSign));
    payload.append("ySign", String(formData.ySign));

    const file = formData.DocSignFile;
    if (file instanceof File) {
      payload.append("DocSignFile", file);
    } else if (file?.[0] instanceof File) {
      payload.append("DocSignFile", file[0]);
    }

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_DOCTOR_SIGNATURE_MASTER,
      payload,
      {},
      {
        component: "DoctorSignature",
      }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Something went wrong");
      return;
    }

    if (resp?.result) {
      showSuccess(resp?.message ?? "Data saved successfully");
      resetForm();
      await getDoctorTableList();
    }
  };

  /* ---------------- reset ---------------- */
  const resetForm = () => {
    reset({
      Id: 0,
      BranchId: defaultBranch?.branchId,
      DoctorId: 0,
      xSign: 20,
      ySign: 10,
      DocSignFile: null,
    });
    setSelectedDoctor(null);
    setIsEdit(false);
    setSelectedId(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  /* ----------------doctor table list ---------------- */
  const getDoctorTableList = async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_DOCTOR_SIGNATURE_MASTER_LAST);
    setDoctorTableList(resp?.data ?? []);
  };

  useEffect(() => {
    if (showDetails) getDoctorTableList();
  }, [showDetails]);

  const editHandler = (item: DoctorTableItem) => {
    setIsEdit(true);
    setSelectedId(item.id);
    setSelectedDoctor({ label: item.doctorName, value: item.doctorId });
    reset({
      Id: item.id,
      BranchId: item.branchId,
      DoctorId: item.doctorId,
      xSign: item.xSign,
      ySign: item.ySign,
      DocSignFile: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const deleteHandler = async (item: DoctorTableItem) => {
    await fetchApi(
      "PATCH",
      ENDPOINTS.DELETE_DOCTOR_SIGNATURE_MASTER,
      {},
      { params: { id: item.id } },
      {
        component: "DoctorSignature",
      }
    );

    await getDoctorTableList();
  };

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };

  const downloadHandler = async (pathName: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_IMAGE_FILE,
      {},
      {
        params: { filePath: pathName },
        responseType: "blob",
      },
      { component: "DoctorSignature" }
    );

    const blob = resp;
    if (!blob) return;

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = pathName.split("/").pop() || "image.png";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const cancelHandler = () => {
    resetForm();
  };

  return (
    <>
      <div className="-mt-3">
        <div className="card mb-1">
          <h2 className="card-title">Doctor Signature</h2>

          <form onSubmit={handleSubmit(onsubmit)}>
            <div className="form-grid-4">
              <InputField label="Branch Name" required>
                <select className="input-field" {...register("BranchId")}>
                  <option value={0}>Default</option>
                  {branches.map(b => (
                    <option key={b.branchId} value={b.branchId}>
                      {b.branchName}
                    </option>
                  ))}
                </select>
                {errors.BranchId && <p className="input-field-error">{errors.BranchId.message}</p>}
              </InputField>

              <InputField label="Doctor Name" required>
                <Select
                  value={selectedDoctor}
                  options={doctorSelectOption}
                  isSearchable
                  isClearable
                  placeholder="Select doctor name"
                  onChange={(option: any) => doctorChangeHandler(option)}
                  styles={SelectStyles}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
                {errors.DoctorId && <p className="input-field-error">{errors.DoctorId.message}</p>}
              </InputField>

              <InputField label="X-Axis Signature">
                <input className="input-field" {...register("xSign", { valueAsNumber: true })} />
                {errors.xSign && <p className="input-field-error">{errors.xSign.message}</p>}
              </InputField>

              <InputField label="Y-Axis Signature">
                <input className="input-field" {...register("ySign", { valueAsNumber: true })} />
                {errors.ySign && <p className="input-field-error">{errors.ySign.message}</p>}
              </InputField>

              <InputField label="Signature Upload" required>
                <div className="flex flex-col gap-1">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="file-upload"
                    ref={fileInputRef}
                    onChange={e => {
                      const file = e.target.files?.[0] ?? null;
                      setValue("DocSignFile", file, { shouldValidate: true });
                    }}
                  />
                </div>

                {errors.DocSignFile && (
                  <p className="input-field-error">{errors.DocSignFile.message}</p>
                )}
              </InputField>
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

        <div className="card">
          <div className="card-header">
            <h2 className="card-title ">Doctor Signature List</h2>

            <button onClick={tablePopupHandler}>
              {showDetails ? <Minus size={30} /> : <Plus size={30} />}
            </button>
          </div>

          <Animation isOpen={showDetails}>
            <div className="table-container ">
              <div className="table-scroll-wrapper">
                <div className="table-size">
                  <table className="base-table">
                    <thead className="table-head">
                      <tr>
                        {DoctorSignatureTableHeader.map((h, index) => (
                          <th key={index} className="table-th ">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {doctorTableList?.length === 0 ? (
                        <tr>
                          <td
                            colSpan={DoctorSignatureTableHeader.length}
                            className="table-empty text-center"
                          >
                            No records found
                          </td>
                        </tr>
                      ) : (
                        doctorTableList.map((item, idx) => (
                          <tr key={idx} className="table-row">
                            <td className="table-td">{idx + 1}</td>
                            <td className="table-td">{item?.branchName || "-"}</td>

                            <td className="table-td">{item?.doctorName || "-"}</td>

                            <td className="table-td">{item?.xSign || "-"}</td>

                            <td className="table-td">{item?.ySign || "-"}</td>

                            <td>
                              <LetterHeadImagePreview pathName={item.docSignPath} />
                            </td>

                            <td
                              className="table-td"
                              onClick={() => downloadHandler(item?.docSignPath)}
                            >
                              <i className="fa-solid fa-download icon-color-button"></i>
                            </td>

                            <td className="table-td" onClick={() => editHandler(item)}>
                              <i className="fa-edit fa-solid icon-color-button"></i>
                            </td>

                            <td className="table-td" onClick={() => deleteHandler(item)}>
                              <i
                                className="fa-solid fa-trash icon-color-delete"
                                aria-hidden="true"
                              ></i>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Animation>
        </div>
      </div>
      {loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default React.memo(DoctorSignature);
