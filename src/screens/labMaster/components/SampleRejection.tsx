import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { FieldBoyMasterTableHeader, SampleRejectionTableHeader } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import { sampleRejectionSchema } from "@/validation/labMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InferType } from "yup";
import { SampleRejectionItem } from "../types";

type SampleRejectionFormItem = InferType<typeof sampleRejectionSchema>;

const SampleRejection = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const [sampleRejectionList, setSampleRejectionList] = useState<SampleRejectionItem[]>([]);
  const [filteredList, setFilteredList] = useState<SampleRejectionItem[]>([]);

  const {
    handleSubmit,
    reset,
    watch,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(sampleRejectionSchema),
    defaultValues: {
      sampleRejectionRemarksID: 0,
      sampleRejectionRemarks: "",
      isActive: 1,
    },
  });

  const isEdit = Boolean(watch("sampleRejectionRemarksID"));
  const buttonTitle = isEdit ? "Update" : "Create";

  // get sample rejection
  const getSampleRejection = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SAMPLE_REJECTION_REMARKS_MASTER,
      {},
      {},
      { component: "SampleRejection", silent: true }
    );
    setSampleRejectionList(resp?.data ?? []);
    setFilteredList(resp?.data ?? []);
  };

  useEffect(() => {
    if (showDetails) {
      getSampleRejection();
    }
  }, [showDetails]);

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };

  // submit handler
  const onSubmit = async (formData: SampleRejectionFormItem) => {
    if (!formData?.sampleRejectionRemarks) return;

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_SAMPLE_REJECTION_REMARKS_MASTER,
      formData,
      {},
      { component: "SampleRejection" }
    );

    if (!resp?.result) {
      showError(error?.message ?? "Something went wrong!");
      return;
    }
    showSuccess(resp?.message);
    reset({
      sampleRejectionRemarksID: 0,
      sampleRejectionRemarks: "",
      isActive: 1,
    });

    await getSampleRejection();
  };

  // edit handler
  const editHandler = (item: SampleRejectionItem) => {
    if (!item) {
      reset({
        sampleRejectionRemarksID: 0,
        sampleRejectionRemarks: "",
        isActive: 1,
      });
      return;
    }
    reset({
      sampleRejectionRemarksID: item?.sampleRejectionRemarksID || 0,
      sampleRejectionRemarks: item?.sampleRejectionRemarks || "",
      isActive: item?.isActive || 1,
    });
  };

  // search handler
  const searchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();

    if (!value) {
      setFilteredList(sampleRejectionList);
      return;
    }

    const filteredData =
      sampleRejectionList.filter(s => s?.sampleRejectionRemarks.toLowerCase().includes(value)) ??
      [];
    setFilteredList(filteredData);
  };

  // cancel handler
  const cancelHandler = () => {
    reset({
      sampleRejectionRemarksID: 0,
      sampleRejectionRemarks: "",
      isActive: 1,
    });
  };
  return (
    <div className="-mt-3">
      <div className="card mb-1">
        <h2 className="card-title ">Sample Rejection Details</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-4">
            <InputField label="Sample Rejection Remarks Name" required>
              <input
                className="input-field"
                placeholder="Enter vendor name"
                {...register("sampleRejectionRemarks")}
              />
              {errors.sampleRejectionRemarks && (
                <p className="input-field-error">{errors.sampleRejectionRemarks.message}</p>
              )}
            </InputField>

            <InputField label="Status" required>
              <select className="input-field" required {...register("isActive")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>
          </div>
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button " onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Sample Rejection List</h2>

          <button onClick={tablePopupHandler}>
            {showDetails ? <Minus size={30} /> : <Plus size={30} />}
          </button>
        </div>

        <Animation isOpen={showDetails}>
          <div className="table-container ">
            <div className="table-scroll-wrapper">
              <div className="table-size lg:min-h-72 lg:max-h-72 ">
                <table className="base-table">
                  <thead className="table-head">
                    <tr>
                      {SampleRejectionTableHeader.map((h, index) => (
                        <th key={index} className="table-th align-top ">
                          {h === "Sample Rejection Remarks" ? (
                            <div className="flex flex-col  ">
                              <h2>{h}</h2>
                              <input
                                type="text"
                                className="input-field lg:max-w-35 lg:max-h-7 mt-1 "
                                onChange={searchHandler}
                              />
                            </div>
                          ) : (
                            h
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredList?.length === 0 && (
                      <tr>
                        <td colSpan={FieldBoyMasterTableHeader.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {filteredList.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>

                        <td className="table-td">{item?.sampleRejectionRemarks || "-"}</td>
                        <td
                          className={`table-td ${
                            Number(item?.isActive) === 1 ? "active-text" : "inactive-text"
                          }`}
                        >
                          {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                        </td>

                        <td className="table-td">{item?.createdBy || "-"}</td>
                        <td className="table-td">{item?.createdOn || "-"}</td>
                        <td className="table-td">{item?.lastModifiedBy || "-"}</td>
                        <td className="table-td">{item?.lastModifiedOn || "-"}</td>

                        <td className="table-td" onClick={() => editHandler(item)}>
                          <i className="fa-solid fa-edit text-xl icon-color-button" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Animation>

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </div>
  );
};

export default SampleRejection;
