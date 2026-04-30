import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import { SampleRemarksTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { SampleRemarkFormData, sampleRemarksSchema } from "@/validation/labMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SampleRemarksItem } from "../types";

const SampleRemarks = () => {
  const { fetchApi, loading, error } = useGlobalApi();

  const [sampleRemarksList, setSampleRemarksList] = useState<SampleRemarksItem[]>([]);
  const [filteredList, setFilteredList] = useState<SampleRemarksItem[]>([]);

  const [showDetails, setShowDetails] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(sampleRemarksSchema),
    defaultValues: {
      sampleRemarksID: 0,
      sampleRemarks: "",
      isActive: 1,
    },
  });

  const isEdit = Boolean(watch("sampleRemarksID"));
  const buttonTitle = isEdit ? "Update" : "Create";

  // get sample remarks
  const getSampleRemarks = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SAMPLE_REMARKS_MASTER,
      {},
      { params: { isActive: Status?.ACTIVE } },
      { component: "SampleRemarks" }
    );
    setSampleRemarksList(resp?.data ?? []);
    setFilteredList(resp?.data ?? []);
  };

  useEffect(() => {
    if (showDetails) {
      getSampleRemarks();
    }
  }, [showDetails]);

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };
  // submit handler
  const onsubmit = async (formData: SampleRemarkFormData) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_SAMPLE_REMARKS_MASTER,
      formData,
      {},
      { component: "sampleRemarks" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Something went wrong");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    reset({
      sampleRemarksID: 0,
      sampleRemarks: "",
      isActive: 1,
    });
    await getSampleRemarks();
  };

  // search handler
  const searchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();

    if (!value) {
      setFilteredList(sampleRemarksList);
      return;
    }

    const filteredData =
      sampleRemarksList.filter(s => s?.sampleRemarks.toLowerCase().includes(value)) ?? [];
    setFilteredList(filteredData);
  };

  // edit handler
  // edit handler
  const editHandler = (item: SampleRemarksItem) => {
    if (!item) {
      reset({
        sampleRemarksID: 0,
        sampleRemarks: "",
        isActive: 1,
      });
      return;
    }
    reset({
      sampleRemarksID: item?.sampleRemarksID ?? 0,
      sampleRemarks: item?.sampleRemarks ?? "",
      isActive: item?.isActive ?? 1,
    });
  };

  return (
    <div className="-mt-3 ">
      <div className="card mb-1">
        <h2 className="card-title ">Sample Remarks Details</h2>

        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            <InputField label="Sample Remarks Name" required>
              <input
                className="input-field"
                placeholder="Enter vendor name"
                {...register("sampleRemarks")}
              />
              {errors.sampleRemarks && (
                <p className="input-field-error">{errors.sampleRemarks.message}</p>
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
            <button type="button" className="cancel-button ">
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Sample Remarks List</h2>

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
                      {SampleRemarksTableHeader.map((h, index) => (
                        <th key={index} className="table-th align-top ">
                          {h === "Sample Remarks" ? (
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
                        <td colSpan={SampleRemarksTableHeader.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {filteredList.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>

                        <td className="table-td">{item?.sampleRemarks ?? "-"}</td>
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
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default SampleRemarks;
