import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import CancelButton from "@/components/globalButtons/CancelButton";
import EditIconButton from "@/components/globalButtons/EditIconButton";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import {
  surgeryComponentFormData,
  surgeryComponentMasterSchema,
} from "@/validation/surgeryComponentMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { SurgeryItem } from "./types";

const SurgeryMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(surgeryComponentMasterSchema),
    defaultValues: {
      componentId: 0,
      componentName: "",
      hasDoctor: 1,
      isBaseComponent: 0,
      sharePercentage: 0,
      isActive: 1,
    },
  });

  const buttonTitle = Boolean(watch("componentId")) ? "Update" : "Create";

  //   submit handler
  const onSubmit = async (formData: surgeryComponentFormData) => {
    console.log("formData", formData);
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_SURGERY_COMPONENT_MASTER,
      formData,
      {},
      { component: "SurgeryMaster" }
    );
    console.log("resp", resp);
    if (!resp?.result) {
      showError(resp?.message ?? "Error while saving    data");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    reset({
      componentId: 0,
      componentName: "",
      hasDoctor: 1,
      isBaseComponent: 0,
      sharePercentage: 0,
      isActive: 1,
    });
    await refetch();
  };

  //   get table list
  const getSurgeryComponentsList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SURGERY_COMPONENTS_LIST,
      {},
      { params: { isActive: 1 } },
      { component: "SurgeryMaster" }
    );
    console.log("resp", resp?.data);
    return resp?.data ?? [];
  };

  const { data: surgeryComponentsList, refetch } = useQuery({
    queryKey: ["surgeryComponentsList"],
    queryFn: getSurgeryComponentsList,
    enabled: !!showDetails,
  });

  // edit handler
  const editHandler = (item: SurgeryItem) => {
    console.log("item", item);
    reset({
      componentId: Number(item?.ComponentId),
      componentName: String(item?.ComponentName),
      hasDoctor: Number(item?.HasDoctor),
      isBaseComponent: Number(item?.IsBaseComponent),
      sharePercentage: Number(item?.SharePercentage),
      isActive: Number(item?.IsActive),
    });
  };

  //   cancel handler

  const cancelHandler = () => {
    reset({
      componentId: 0,
      componentName: "",
      hasDoctor: 1,
      isBaseComponent: 0,
      sharePercentage: 0,
      isActive: 1,
    });
  };

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };
  return (
    <div className="page-container">
      <h1 className="page-heading">Surgery Component Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Surgery Component Master</span>
      </nav>

      <form className="card ">
        <div className="form-grid-4">
          <InputField label="Name" required>
            <input
              className="input-field"
              {...register("componentName")}
              placeholder="Enter surgery component name"
            />
            {errors.componentName?.message && (
              <p className="input-validation-error">{errors.componentName.message}</p>
            )}
          </InputField>
          <InputField label="Has Doctor" required>
            <select className="input-field" {...register("hasDoctor")}>
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
            {errors.hasDoctor?.message && (
              <p className="input-validation-error">{errors.hasDoctor.message}</p>
            )}
          </InputField>
          <InputField label="Is Base Component" required>
            <select className="input-field" {...register("isBaseComponent")}>
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </InputField>
          <InputField label="Share Precentage (%)">
            <input
              className="input-field"
              {...register("sharePercentage")}
              onInput={allowOnlyNumbers}
            />
            {errors.sharePercentage?.message && (
              <p className="input-validation-error">{errors.sharePercentage.message}</p>
            )}
          </InputField>
          <InputField label="Active">
            <select className="input-field" {...register("isActive")}>
              <option value={1}>Active</option>
              <option value={0}>In-Active</option>
            </select>
            {errors.isActive?.message && (
              <p className="input-validation-error">{errors.isActive.message}</p>
            )}
          </InputField>

          <div className="form-actions-responsive  lg:mt-0 -mt-6">
            <SubmitButton
              className="save-btn-color w-full sm:w-auto"
              label={buttonTitle}
              type="submit"
              onClick={handleSubmit(onSubmit)}
            />

            <CancelButton
              label="Cancel"
              className="cancel-btn-color w-full sm:w-auto"
              type="button"
              onClick={cancelHandler}
            />
          </div>
        </div>
      </form>

      {/* table */}
      <div className="card mt-1">
        <div className="card-header">
          <h2 className="card-title ">Surgery Component Master List</h2>

          <button onClick={tablePopupHandler}>
            {showDetails ? <Minus size={30} /> : <Plus size={30} />}
          </button>
        </div>
        <Animation isOpen={showDetails}>
          <div className="table-container  ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-80 lg:max-h-80">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      <th className="table-th m-1">#</th>
                      <th className="table-th">Component Name</th>
                      <th className="table-th">Has Doctor</th>
                      <th className="table-th">Base Component</th>
                      <th className="table-th">Share Precentage</th>
                      <th className="table-th">Active</th>
                      <th className="table-th">Created By</th>
                      <th className="table-th">Created On</th>
                      <th className="table-th">Last Modified By</th>
                      <th className="table-th">Last Modified On</th>
                      <th className="table-th">Edit</th>
                    </tr>
                  </thead>

                  <tbody>
                    {surgeryComponentsList?.length === 0 && (
                      <tr>
                        <td colSpan={11} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {surgeryComponentsList?.map((item: SurgeryItem, idx: number) => (
                      <tr key={item?.ComponentId} className="table-row">
                        <td className="table-td">{idx + 1}</td>
                        <td className="table-td">{item?.ComponentName || "-"}</td>
                        <td className="table-td">{Number(item?.HasDoctor) === 1 ? "Yes" : "No"}</td>
                        <td className="table-td">
                          {Number(item?.IsBaseComponent) === 1 ? "Yes" : "No"}
                        </td>
                        <td className="table-td">{item?.SharePercentage ?? 0}%</td>
                        <td
                          className={`table-td ${
                            Number(item?.IsActive) === 1 ? "active-text" : "inactive-text"
                          }`}
                        >
                          {Number(item?.IsActive) === 1 ? "Active" : "Inactive"}
                        </td>
                        <td className="table-td">{item?.CreatedBy || "-"}</td>
                        <td className="table-td">{item?.CreatedOn || "-"}</td>
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
          </div>
        </Animation>
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};
export default SurgeryMaster;
