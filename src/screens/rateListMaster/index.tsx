import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { RateListMasterTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { formatDisplayDate, formatToDDMMYYYY, formatToYYYYMMDD } from "@/utils/dateConvertHandler";
import { RateListMasterFormData, rateListMasterSchema } from "@/validation/rateListMaster";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { RateListTableItem } from "./types";

// Reset function
const resetFormData = (today: string) => ({
  rateListId: 0,
  rateListName: "",
  applicableDate: today,
  expiryDate: today,
  isActive: 1,
  importFromRateListId: 0,
});

const RateListMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const today = new Date().toISOString().split("T")[0];

  const [rateListData, setRateListData] = useState<RateListTableItem[]>([]);

  const {
    handleSubmit,
    reset,
    register,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(rateListMasterSchema),
    defaultValues: resetFormData(today),
  });

  //   get rate master list
  const getRateList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_RATE_LIST_MASTER,
      {},
      {},
      { component: "RateListMaster" }
    );

    setRateListData(resp?.data ?? []);
  };

  useEffect(() => {
    getRateList();
  }, []);

  const isEdit = Boolean(watch("rateListId"));
  const buttonTitle = isEdit ? "Update" : "Create";

  // Submit handler
  const onSubmit = async (data: RateListMasterFormData) => {
    const payload = {
      ...data,
      expiryDate: formatToDDMMYYYY(data.expiryDate!),
      applicableDate: formatToDDMMYYYY(data?.applicableDate!),
    };
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_RATE_LIST_MASTER,
      payload,
      {},
      { component: "RateListMaster" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Failed to save rate list");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    await getRateList();

    reset(resetFormData(today));
  };

  //   edit handler
  const editHandler = (item: RateListTableItem) => {
    reset({
      rateListId: item?.rateListId ?? 0,
      rateListName: item?.rateListName ?? "",
      applicableDate: formatToYYYYMMDD(item?.applicableDate!),
      expiryDate: formatToYYYYMMDD(item?.expiryDate),
      isActive: item?.isActive ?? 1,
    });
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Rate List Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Rate List Master</span>
      </nav>

      {/* form */}
      <div className="card mb-1">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-4">
            <InputField label="Rate List Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter rate list name"
                {...register("rateListName")}
              />
              {errors.rateListName && (
                <p className="input-field-error">{errors.rateListName.message}</p>
              )}
            </InputField>

            <InputField label="Applicable Date">
              <input
                type="date"
                className="input-field"
                placeholder="DD-MM-YYYY"
                value={today}
                {...register("applicableDate")}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                  e.currentTarget.showPicker?.();
                }}
              />
            </InputField>

            <InputField label="Expiry Date" required>
              <input
                type="date"
                className="input-field"
                placeholder="DD-MM-YYYY"
                value={today}
                {...register("expiryDate")}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                  e.currentTarget.showPicker?.();
                }}
              />
            </InputField>

            <InputField label="Status" required>
              <select className="input-field" {...register("isActive")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
              {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
            </InputField>

            {!isEdit && (
              <InputField label="Import From Rate List">
                <select
                  className="input-field"
                  {...register("importFromRateListId", {
                    valueAsNumber: true,
                  })}
                >
                  <option value={0}>--Select--</option>
                  {rateListData.map(r => (
                    <option key={r.rateListId} value={r.rateListId}>
                      {r.rateListName}
                    </option>
                  ))}
                </select>
              </InputField>
            )}
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={() => reset(resetFormData(today))}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      {/* table */}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Rate List Master List</h2>
        </div>

        <div className="overflow-hidden">
          <div className="table-container">
            <div className="table-scroll-wrapper">
              <div className="table-size lg:min-h-80 lg:max-h-80">
                <table className="base-table">
                  <thead className="table-head">
                    <tr>
                      {RateListMasterTableHeader.map((h, i) => (
                        <th key={i} className="table-th">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {rateListData.length === 0 && (
                      <tr>
                        <td colSpan={RateListMasterTableHeader.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {rateListData.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td  wrap-break-word max-w-1 ">
                          {item?.rateListName || "-"}
                        </td>
                        <td className="table-td">
                          {formatDisplayDate(item?.applicableDate) || "-"}
                        </td>
                        <td className="table-td">{formatDisplayDate(item?.expiryDate) || "-"}</td>
                        <td
                          className={`table-td ${Number(item.isActive) === 1 ? "active-text" : "inactive-text"}`}
                        >
                          {Number(item.isActive) === 1 ? "Active" : "Inactive"}
                        </td>

                        <td className="table-td" onClick={() => editHandler(item)}>
                          <i className="fa-solid fa-edit icon-color-button " />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {!!loading && <CustomLoader isLoading />}
      </div>
    </div>
  );
};

export default RateListMaster;
