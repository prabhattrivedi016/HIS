import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { FieldBoyMasterTableHeader } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import { fieldBoySchema } from "@/validation/labMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InferType } from "yup";
import { FieldBoyItem } from "../types";

type FieldBoyFormItem = InferType<typeof fieldBoySchema>;

const FieldBoy = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [fieldBoyMasterList, setFieldBoyMasterList] = useState<FieldBoyItem[]>([]);
  const [filteredList, setFilteredList] = useState<FieldBoyItem[]>([]);

  const {
    handleSubmit,
    reset,
    register,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(fieldBoySchema),
    defaultValues: {
      fieldBoyId: 0,
      fieldBoyName: "",
      isActive: 1,
    },
  });
  const isEditMode = Boolean(watch("fieldBoyId"));
  const buttonTitle = isEditMode ? "Update" : "Create";

  // field data
  const getFieldBoy = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_FIELD_BOY_MASTER,
      {},
      {},
      { component: "FieldBoy", silent: true }
    );
    setFieldBoyMasterList(resp?.data ?? []);
    setFilteredList(resp?.data ?? []);
  };
  useEffect(() => {
    if (showDetails) {
      getFieldBoy();
    }
  }, [showDetails]);

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };

  // search handler
  const searchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toLowerCase();
    if (!value) {
      setFilteredList(fieldBoyMasterList);
      return;
    }
    const filteredData =
      fieldBoyMasterList?.filter(f => f?.fieldBoyName.toLowerCase().includes(value)) ?? [];
    setFilteredList(filteredData);
  };

  // edit handler
  const editHandler = (item: FieldBoyItem) => {
    if (!item) {
      reset({
        fieldBoyId: 0,
        fieldBoyName: "",
        isActive: 1,
      });
      return;
    }
    reset({
      fieldBoyId: item?.fieldBoyId || 0,
      fieldBoyName: item?.fieldBoyName || "",
      isActive: Number(item?.isActive ?? 1),
    });
  };
  // cancel handler
  const cancelHandler = () => {
    reset({
      fieldBoyId: 0,
      fieldBoyName: "",
      isActive: 1,
    });
  };

  // submit handler
  const onSubmit = async (formData: FieldBoyFormItem) => {
    if (!formData?.fieldBoyName) return;
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_FIELD_BOY_MASTER,
      formData,
      {},
      { component: "FieldBoy" }
    );

    if (!resp?.result) {
      showError(error?.message ?? "Something went wrong!");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    reset({
      fieldBoyId: 0,
      fieldBoyName: "",
      isActive: 1,
    });

    await getFieldBoy();
  };

  return (
    <div className="-mt-3">
      <div className="card mb-1">
        <h2 className="card-title ">Field Boy Details</h2>
        {/* form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-4">
            <InputField label="Field Boy Name" required>
              <input
                className="input-field"
                placeholder="Enter field boy name"
                {...register("fieldBoyName")}
              />
              {errors.fieldBoyName && (
                <p className="input-field-error">{errors.fieldBoyName.message}</p>
              )}
            </InputField>

            <InputField label="Status" required>
              <select
                className="input-field"
                required
                {...register("isActive", { valueAsNumber: true })}
              >
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
          <h2 className="card-title ">Field Boy List</h2>

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
                      {FieldBoyMasterTableHeader.map((h, index) => (
                        <th key={index} className="table-th align-top ">
                          {h === "Field Boy" ? (
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

                        <td className="table-td">{item?.fieldBoyName || "-"}</td>
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
                          <i className="fa-solid fa-edit icon-color-button" />
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

export default FieldBoy;
