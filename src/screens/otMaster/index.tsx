import CustomLoader from "@/components/customLoader";
import EditIconButton from "@/components/globalButtons/EditIconButton";
import CustomTimePicker from "@/components/timePicker";
import { ENDPOINTS } from "@/config/defaults";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { BranchItem } from "@/types";
import { showError, showSuccess } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import { OtMasterFormData, otMasterSchema } from "@/validation/otMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import InputField from "../../components/customInputField";
import { OtMasterItem } from "./types";

const currentTime = (() => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
})();

const convertTo24Hour = (time12h?: string) => {
  if (!time12h) return "";
  const match = time12h.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time12h;

  let hours = Number(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === "AM" && hours === 12) {
    hours = 0;
  } else if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

const convertTo12Hour = (time24h?: string) => {
  if (!time24h) return "";
  const match = time24h.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return time24h;

  let hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";

  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }

  return `${hours}:${minutes} ${period}`;
};

const OtMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const branchList = useGetBranchList()?.branchList?.data ?? [];
  const [otMasterData, setOtMasterData] = useState<OtMasterItem[]>([]);
  const {
    handleSubmit,
    register,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(otMasterSchema),
    defaultValues: {
      otId: 0,
      branchId: 1,
      otName: "",
      otStartTime: currentTime,
      otEndTime: currentTime,
      otSlotMins: "",
      isActive: 1,
    },
  });

  const otStartTime = watch("otStartTime");
  const otEndTime = watch("otEndTime");

  //   auto select branch
  useEffect(() => {
    const first = branchList?.filter((b: BranchItem) => Number(b?.branchId) === 1);
    setValue("branchId", Number(first?.[0]?.branchId));
  }, [branchList]);

  //   ot master table list
  const getOtMaterData = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OT_MASTER_LIST,
      {},
      {},
      { component: "OtMaster" }
    );
    setOtMasterData(resp?.data ?? []);
  };

  useEffect(() => {
    getOtMaterData();
  }, []);

  //   edit handler
  const editHandler = (item: OtMasterItem) => {
    reset({
      otId: item?.OTId,
      branchId: item?.BranchId,
      otName: item?.OTName,
      otStartTime: convertTo12Hour(item?.OTStartTime),
      otEndTime: convertTo12Hour(item?.OTEndTime),
      otSlotMins: String(item?.OTSlotMins),
      isActive: Number(item?.IsActive),
    });
  };

  //   cancel handler
  const cancelHandler = () => {
    reset({
      otId: 0,
      branchId: 1,
      otName: "",
      otStartTime: currentTime,
      otEndTime: currentTime,
      otSlotMins: "",
      isActive: 1,
    });
  };

  //   submit handler
  const onSubmit = async (data: OtMasterFormData) => {
    const payload = {
      ...data,
      otStartTime: convertTo24Hour(data.otStartTime),
      otEndTime: convertTo24Hour(data.otEndTime),
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_OT_MASTER,
      payload,
      {},
      { component: "OtMaster" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Failed to update data");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    reset({
      otId: 0,
      branchId: 1,
      otName: "",
      otStartTime: currentTime,
      otEndTime: currentTime,
      otSlotMins: "",
      isActive: 1,
    });
    await getOtMaterData?.();
  };
  return (
    <div className="page-container">
      <h1 className="page-heading">OT Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>OT Master</span>
      </nav>

      <div className="card">
        <form className="form-grid-4" onSubmit={handleSubmit(onSubmit)}>
          <InputField label="Branch Name" required>
            <select className="input-field" {...register("branchId")}>
              <option value="">Select Branch Name</option>
              {branchList?.map((b: BranchItem) => (
                <option key={b?.branchId} value={b?.branchId}>
                  {b?.branchName}
                </option>
              ))}
            </select>
            {errors.branchId && <p className="input-field-error">{errors.branchId.message}</p>}
          </InputField>

          <InputField label="OT Name" required>
            <input
              type="text"
              className="input-field"
              placeholder="Enter OT Name"
              {...register("otName")}
            />
            {errors.otName && <p className="input-field-error">{errors.otName.message}</p>}
          </InputField>

          <InputField label="OT Start Time" required>
            <CustomTimePicker
              value={otStartTime}
              onChange={value => {
                setValue("otStartTime", value, { shouldValidate: true });
                // Re-validate otEndTime so its error clears if the new start time makes it valid
                setTimeout(
                  () => setValue("otEndTime", watch("otEndTime"), { shouldValidate: true }),
                  0
                );
              }}
            />
            {errors.otStartTime && (
              <p className="input-field-error">{errors.otStartTime.message}</p>
            )}
          </InputField>

          <InputField label="OT End Time" required>
            <CustomTimePicker
              value={otEndTime}
              onChange={value => setValue("otEndTime", value, { shouldValidate: true })}
            />
            {errors.otEndTime && <p className="input-field-error">{errors.otEndTime.message}</p>}
          </InputField>

          <InputField label="OT Slot In Mins" required>
            <input
              type="text"
              className="input-field"
              placeholder="Enter slot time in min"
              {...register("otSlotMins")}
              onInput={allowOnlyNumbers}
              maxLength={3}
            />
            {errors.otSlotMins && <p className="input-field-error">{errors.otSlotMins.message}</p>}
          </InputField>

          <InputField label="Status" required>
            <select className="input-field" {...register("isActive")}>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
            {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
          </InputField>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full lg:col-start-4 mt-6">
            <button type="submit" className="save-btn">
              Save
            </button>

            <button type="button" className="cancel-button" onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* table */}

      <div className="table-container mt-1">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-90 ">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  <th className="table-th">#</th>
                  <th className="table-th p-2">Branch</th>
                  <th className="table-th">OT Name</th>
                  <th className="table-th">OT Start Time</th>
                  <th className="table-th">OT End Time</th>
                  <th className="table-th">OT Slot In Mins</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Created By</th>
                  <th className="table-th">Created On</th>
                  <th className="table-th">Last Modified By</th>
                  <th className="table-th">Last Modified On</th>
                  <th className="table-th">Edit</th>
                </tr>
              </thead>

              <tbody>
                {otMasterData?.length === 0 && (
                  <tr>
                    <td colSpan={15} className="table-empty">
                      No records found
                    </td>
                  </tr>
                )}

                {otMasterData.map((item: OtMasterItem, idx: number) => (
                  <tr key={idx} className="table-row">
                    <td className="table-td">{idx + 1}</td>
                    <td className="table-td">{item?.BranchName || "-"}</td>

                    <td className="table-td">{item?.OTName || "-"}</td>
                    <td className="table-td">{item?.OTStartTime || "-"}</td>
                    <td className="table-td">{item?.OTEndTime || "-"}</td>
                    <td className="table-td">{item?.OTSlotMins || "-"}</td>
                    <td
                      className={`table-td ${
                        Number(item?.IsActive) === 1 ? "active-text" : "inactive-text"
                      }`}
                    >
                      {Number(item?.IsActive) === 1 ? "Active" : "Inactive"}
                    </td>
                    <td className="table-td">{item?.CreateBy || "-"}</td>
                    <td className="table-td">{item?.CreateOn || "-"}</td>
                    <td className="table-td">{item?.LastModifiedBy || "-"}</td>
                    <td className="table-td">{item?.LastModifiedOn || "-"}</td>

                    <td className="table-td">
                      <EditIconButton onClick={() => editHandler(item)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {loading && <CustomLoader isLoading={loading} />}
      </div>
    </div>
  );
};

export default OtMaster;
