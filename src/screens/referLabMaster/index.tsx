import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { BranchId } from "@/constants/constants";
import { ReferLabListTableHeader } from "@/constants/tableHeaders";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import { ReferLabMasterFormItem, referLabMasterSchema } from "@/validation/referLabMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { OutSourceLabItem } from "./types";

const resetFormData = () => ({
  outSourceLabId: 0,
  outSourceLab: "",
  contactPerson: "",
  contactNumber: "",
  address: "",
  isActive: 1,
  branchId: 1,
});

const ReferLabMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const { branchList } = useGetBranchList();
  const branchValue = branchList?.data ?? [];

  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [referLabTableData, setReferLabTableData] = useState<OutSourceLabItem[]>([]);

  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(referLabMasterSchema),
    defaultValues: resetFormData(),
  });

  const isEdit = Boolean(watch("outSourceLabId"));
  const buttonTitle = isEdit ? "Update" : "Create";

  const getBranch = branchValue?.find(b => b?.branchId === BranchId?.DEFAULT);

  useEffect(() => {
    if (getBranch?.branchId) {
      reset({
        ...resetFormData(),
        branchId: getBranch.branchId,
      });
    }
  }, [getBranch, reset]);

  //   refer lab table data
  const getOutSourceData = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OUT_SOURCE_LAB_MASTER_LIST,
      {},
      {},
      { component: "ReferLabMaster", silent: true }
    );

    setReferLabTableData(resp?.data ?? []);
  };

  useEffect(() => {
    if (showDetails) {
      getOutSourceData();
    }
  }, [showDetails]);

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };

  // Submit handler
  const onsubmit = async (formData: ReferLabMasterFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_OUT_SOURCE_LAB_MASTER,
      formData,
      {},
      { component: "ReferLabMaster" }
    );

    if (!resp?.result) {
      showError(error?.message ?? "Something went wrong");
      return;
    }

    showSuccess(resp?.message ?? "Data saved successfully");

    await getOutSourceData();

    reset({
      ...resetFormData(),
      branchId: getBranch?.branchId ?? 1,
    });
  };

  //   edit handler
  const editHandler = (item: OutSourceLabItem) => {
    reset({
      outSourceLabId: item.outSourceLabId ?? 0,
      outSourceLab: item.outSourceLab ?? "",
      contactPerson: item.contactPerson ?? "",
      contactNumber: item.contactNumber ?? "",
      address: item.address ?? "",
      isActive: Number(item.isActive) ?? 1,
      branchId: item.branchId ?? getBranch?.branchId ?? 1,
    });
  };

  const cancelHandler = () => {
    reset(resetFormData());
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Refer Lab Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Refer Lab Master</span>
      </nav>

      {/* FORM */}
      <div className="card mb-1">
        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            <InputField label="Refer Lab Name" required>
              <input className="input-field" {...register("outSourceLab")} />
              {errors.outSourceLab && (
                <p className="input-field-error">{errors.outSourceLab.message}</p>
              )}
            </InputField>

            <InputField label="Contact Person">
              <input className="input-field" {...register("contactPerson")} />
            </InputField>

            <InputField label="Contact No" required>
              <input className="input-field" {...register("contactNumber")} />
            </InputField>

            <InputField label="Address">
              <input className="input-field" {...register("address")} />
              {errors.address && <p className="input-field-error">{errors.address.message}</p>}
            </InputField>

            <InputField label="Status" required>
              <select className="input-field" {...register("isActive")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </InputField>

            <InputField label="Branch" required>
              <select className="input-field" {...register("branchId")}>
                <option value="">Select</option>
                {branchValue?.map(b => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchName}
                  </option>
                ))}
              </select>
              {errors.branchId && <p className="input-field-error">{errors.branchId.message}</p>}
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

      {/* TABLE */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Refer Lab List</h2>
          <button onClick={tablePopupHandler}>
            {showDetails ? <Minus size={30} /> : <Plus size={30} />}
          </button>
        </div>

        <Animation isOpen={showDetails}>
          <div className="overflow-hidden">
            <div className="table-container">
              <div className="table-scroll-wrapper">
                <div className="table-size lg:min-h-80 lg:max-h-80">
                  <table className="base-table">
                    <thead className="table-head">
                      <tr>
                        {ReferLabListTableHeader.map((h, i) => (
                          <th key={i} className="table-th">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {referLabTableData.length === 0 && (
                        <tr>
                          <td colSpan={ReferLabListTableHeader.length} className="table-empty">
                            No records found
                          </td>
                        </tr>
                      )}

                      {referLabTableData.map((item, idx) => (
                        <tr key={idx} className="table-row">
                          <td className="table-td">{idx + 1}</td>
                          <td className="table-td  wrap-break-word max-w-1 ">
                            {item.outSourceLab || "-"}
                          </td>
                          <td className="table-td">{item.branchName || "-"}</td>
                          <td className="table-td">{item.contactPerson || "-"}</td>
                          <td className="table-td">{item.contactNumber || "-"}</td>
                          <td className="table-td">{item.address || "-"}</td>
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
        </Animation>

        {!!loading && <CustomLoader isLoading />}
      </div>
    </div>
  );
};

export default ReferLabMaster;
