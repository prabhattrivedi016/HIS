import Animation from "@/components/animation";
import CustomLoader from "@/components/customLoader";
import { letterHeaderTableHeader } from "@/constants/constants";
import { letterHeadSchema } from "@/validation/printSettingSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../../../components/customInputField";
import { ENDPOINTS } from "../../../config/defaults";
import useGetBranchList from "../../../hooks/useGetBranchList";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { usePickMaster } from "../../../hooks/usePickMaster";
import { LetterHeadItem } from "../types";
import LetterHeadImagePreview from "./LetterHeadImagePreview";

const LetterHead = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const branchList = useGetBranchList();
  const branches = branchList?.branchList?.data ?? [];

  const letterHeadName = usePickMaster("LetterHeadTypeName");
  const letterHeadList = letterHeadName?.pickMasterValue ?? [];
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [letterHeadTableData, setLetterHeadTableData] = useState<LetterHeadItem[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const buttonLabel = isEdit ? "Update" : "Save";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(letterHeadSchema),
    defaultValues: {
      id: 0,
      BranchId: 0,
      TypeId: 0,
      TypeName: "",
      PaddingLeft: 100,
      PaddingRight: 100,
      PaddingTop: 100,
      PaddingBottom: 100,
      LetterHeadFile: null,
    },
  });

  const onSubmit = async (data: any) => {
    const formData = new FormData();

    formData.append("Id", String(data.id));
    formData.append("BranchId", String(data.BranchId));
    formData.append("TypeId", String(data.TypeId));
    formData.append("TypeName", data.TypeName);

    formData.append("PaddingLeft", String(data.PaddingLeft));
    formData.append("PaddingRight", String(data.PaddingRight));
    formData.append("PaddingTop", String(data.PaddingTop));
    formData.append("PaddingBottom", String(data.PaddingBottom));

    if (data.LetterHeadFile) {
      formData.append("LetterHeadFile", data.LetterHeadFile);
    } else if (data.id > 0) {
      formData.append("LetterHeadFile", "");
    }

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_LAB_REPORT_LETTER_HEAD,
      formData,
      {},
      { component: "LetterHead" }
    );
    if (!resp) return;
    if (resp?.result) {
      setSuccessMessage(resp?.message || "Saved successfully");

      setIsEdit(false);
      reset({
        id: 0,
        BranchId: 0,
        TypeId: 0,
        TypeName: "",
        PaddingLeft: 100,
        PaddingRight: 100,
        PaddingTop: 100,
        PaddingBottom: 100,
        LetterHeadFile: null,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    await getLetterHead();
  };

  /*---------------------------letter head lists--------------------- */
  const getLetterHead = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_LAB_REPORT_LETTER_HEAD_LIST,
      {},
      {},
      { component: "LetterHead" }
    );
    setLetterHeadTableData(resp?.data ?? []);
  };
  useEffect(() => {
    if (showDetails) {
      getLetterHead();
    }
  }, [showDetails]);

  /*--------------------------------reset form------------------- */
  const resetForm = () => {
    setIsEdit(false);
    reset({
      id: 0,
      BranchId: 0,
      TypeId: 0,
      TypeName: "",
      PaddingLeft: 100,
      PaddingRight: 100,
      PaddingTop: 100,
      PaddingBottom: 100,
      LetterHeadFile: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /*--------------------------------edit handler------------------- */
  const editHandler = (item: LetterHeadItem) => {
    setIsEdit(true);

    reset({
      id: item?.id,
      BranchId: item?.branchId,
      TypeId: item?.typeId,
      TypeName: item?.typeName,

      PaddingLeft: item?.paddingLeft,
      PaddingRight: item?.paddingRight,
      PaddingTop: item?.paddingTop,
      PaddingBottom: item?.paddingBottom,

      LetterHeadFile: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /*--------------------delete handler--------------------- */
  const deleteHandler = async (item: LetterHeadItem) => {
    await fetchApi(
      "PATCH",
      ENDPOINTS.DELETE_LETTER_HEAD_MASTER,
      {},
      {
        params: { id: item?.id },
      },
      { component: "LetterHead" }
    );
    await getLetterHead();
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
      { LetterHeadImagePreview }
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

  return (
    <>
      <div className="-mt-3">
        <div className="card mb-1">
          <h2 className="mb-4 text-xl font-semibold">Letter Head</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid-4">
              <InputField label="Branch" required>
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

              <InputField label="Type">
                <select
                  className="input-field"
                  {...register("TypeId")}
                  onChange={e => {
                    const id = Number(e.target.value);

                    const selected = letterHeadList.find(l => Number(l.key) === id);

                    setValue("TypeId", id);
                    setValue("TypeName", selected?.value ?? "");
                  }}
                >
                  <option value={0}>Select</option>

                  {letterHeadList.map(l => (
                    <option key={l.key} value={l.key}>
                      {l.value}
                    </option>
                  ))}
                </select>

                {errors.TypeName && <p className="input-field-error">{errors.TypeName.message}</p>}
              </InputField>

              <InputField label="Padding Left">
                <input type="number" className="input-field" {...register("PaddingLeft")} />
                {errors.PaddingLeft && (
                  <p className="input-field-error">{errors.PaddingLeft.message}</p>
                )}
              </InputField>

              <InputField label="Padding Right">
                <input type="number" className="input-field" {...register("PaddingRight")} />
                {errors.PaddingRight && (
                  <p className="input-field-error">{errors.PaddingRight.message}</p>
                )}
              </InputField>

              <InputField label="Padding Top">
                <input type="number" className="input-field" {...register("PaddingTop")} />
                {errors.PaddingTop && (
                  <p className="input-field-error">{errors.PaddingTop.message}</p>
                )}
              </InputField>

              <InputField label="Padding Bottom">
                <input type="number" className="input-field" {...register("PaddingBottom")} />
                {errors.PaddingBottom && (
                  <p className="input-field-error">{errors.PaddingBottom.message}</p>
                )}
              </InputField>

              <InputField label="Upload Header" required={!isEdit}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  className="file-upload"
                  onChange={e =>
                    setValue("LetterHeadFile", e.target.files?.[0] || null, {
                      shouldValidate: true,
                    })
                  }
                />

                {errors.LetterHeadFile && (
                  <p className="input-field-error">{errors.LetterHeadFile.message}</p>
                )}
              </InputField>
            </div>

            <div className="form-actions-responsive mt-5">
              <button type="submit" className="save-btn">
                {buttonLabel}
              </button>
              <button type="button" className="cancel-button" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title ">Letter Head List</h2>

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
                        {letterHeaderTableHeader.map((h, index) => (
                          <th key={index} className="table-th ">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {letterHeadTableData?.length === 0 && (
                        <tr>
                          <td colSpan={letterHeadTableData.length} className="table-empty">
                            No records found
                          </td>
                        </tr>
                      )}

                      {letterHeadTableData.map((item, idx) => (
                        <tr key={idx} className="table-row">
                          <td className="table-td">{idx + 1}</td>
                          <td className="table-td">{item?.branchName || "-"}</td>

                          <td className="table-td">{item?.paddingLeft || "-"}</td>

                          <td className="table-td">{item?.paddingRight || "-"}</td>

                          <td className="table-td">{item?.paddingTop || "-"}</td>

                          <td className="table-td">{item?.paddingBottom || "-"}</td>

                          <td>
                            <LetterHeadImagePreview pathName={item?.letterHeadFilePath} />
                          </td>

                          <td
                            className="table-td"
                            onClick={() => downloadHandler(item?.letterHeadFilePath)}
                          >
                            <i className="fa-solid fa-download fa-2xl text-blue-600 ml-5"></i>
                          </td>

                          <td className="table-td" onClick={() => editHandler(item)}>
                            <i className="fa-edit fa-solid fa-xl "></i>
                          </td>

                          <td className="table-td" onClick={() => deleteHandler(item)}>
                            <i className="fa fa-trash text-red-500 fa-xl " aria-hidden="true"></i>
                          </td>
                        </tr>
                      ))}
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

export default LetterHead;
