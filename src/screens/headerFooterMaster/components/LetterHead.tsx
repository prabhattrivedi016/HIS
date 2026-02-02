import { yupResolver } from "@hookform/resolvers/yup";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../../../components/customInputField";
import CustomLoader from "../../../components/customLoader";
import { ENDPOINTS } from "../../../config/defaults";
import { letterHeaderTableHeader } from "../../../constants/constants";
import useGetBranchList from "../../../hooks/useGetBranchList";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { usePickMaster } from "../../../hooks/usePickMaster";
import { LetterHeadSchema } from "../../../validation/letterHeadSchema";
import { LetterHeadItem } from "../types";
import LetterHeadImagePreview from "./LetterHeadImagePreview";

const LetterHead = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const branchList = useGetBranchList();
  const branches = branchList?.branchList?.data ?? [];

  const letterHeadName = usePickMaster({ fieldName: "LetterHeadTypeName" });
  const letterHeadList = letterHeadName?.pickMasterValue?.data ?? [];
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [letterHeadTableData, setLetterHeadTableData] = useState<LetterHeadItem[]>([]);
  const [isEdit, setIsEdit] = useState(false);

  const buttonLabel = isEdit ? "Update" : "Save";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(LetterHeadSchema),
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

  const onSubmit = async data => {
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
    }

    await fetchApi("POST", ENDPOINTS.CREATE_UPDATE_LAB_REPORT_LETTER_HEAD, formData);
    getLetterHead();
  };

  /*---------------------------letter head lists--------------------- */
  const getLetterHead = async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_LAB_REPORT_LETTER_HEAD_LIST, {}, {});
    setLetterHeadTableData(resp?.data ?? []);
  };
  useEffect(() => {
    getLetterHead();
  }, []);

  const showDetailPopUpHandler = () => {
    setShowDetails(prev => !prev);
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
  };

  /*--------------------delete handler--------------------- */
  const deleteHandler = async item => {
    await fetchApi(
      "PATCH",
      ENDPOINTS.DELETE_LETTER_HEAD_MASTER,
      {},
      {
        params: { id: item?.id },
      }
    );
    getLetterHead();
  };

  return (
    <>
      <div className="shadow-lg m-2 p-6 rounded-lg">
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

            <InputField label="Upload Header" required>
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                className="file-upload"
                onChange={e => setValue("LetterHeadFile", e.target.files?.[0] || null)}
              />
              {errors.LetterHeadFile && (
                <p className="input-field-error">{errors.LetterHeadFile.message}</p>
              )}
            </InputField>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6  col-start-4">
              <button type="submit" className="bg-[#0b5394] rounded-lg text-white min-w-20 h-10">
                {buttonLabel}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="shadow-lg m-2 p-6 rounded-lg bg-white overflow-hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Letter Head List</h2>

          <button
            className="border border-gray-500 bg-[#1e6da1] rounded-lg text-white px-4 py-2 active:scale-95"
            onClick={showDetailPopUpHandler}
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
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="max-w-290 w-full   rounded-xl shadow-lg border border-gray-200 mt-4 overflow-hidden bg-white">
                <div className="max-h-80 overflow-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-[#f5f9ff] sticky top-0 z-10">
                      <tr>
                        {letterHeaderTableHeader.map((h, index) => (
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
                      {letterHeadTableData.map((item, idx) => (
                        <tr
                          key={item?.id}
                          className="hover:bg-gray-150 transition last:border-none"
                        >
                          <td className="px-2 py-3 text-gray-500">{idx + 1}</td>

                          <td className="px-1 py-3 text-gray-500">{item?.branchName}</td>

                          <td className="px-1 py-3 text-gray-500">{item?.paddingLeft}</td>

                          <td className="px-2 py-3 text-gray-500 ">{item?.paddingRight}</td>

                          <td className="px-2 py-3 text-gray-500">{item?.paddingTop}</td>

                          <td className="px-2 py-3 text-gray-500">{item?.paddingBottom}</td>

                          <td>
                            <LetterHeadImagePreview pathName={item?.letterHeadFilePath} />
                          </td>

                          <td className="px-2 py-3 text-blue-500" onClick={() => editHandler(item)}>
                            <i className="fa-edit fa-solid"></i>
                          </td>

                          <td
                            className="px-2 py-3 text-gray-500"
                            onClick={() => deleteHandler(item)}
                          >
                            <i className="fa fa-trash text-red-500" aria-hidden="true"></i>
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

        {loading ? <CustomLoader isLoading={loading} /> : <></>}
      </div>
    </>
  );
};

export default LetterHead;
