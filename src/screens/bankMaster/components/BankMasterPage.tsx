import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import CancelButton from "@/components/globalButtons/CancelButton";
import EditIconButton from "@/components/globalButtons/EditIconButton";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { showError, showSuccess } from "@/utils/alert";
import { bankMasterSchema } from "@/validation/bankMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { InferType } from "yup";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { BankItem } from "../types";
type BankMasterFormItem = InferType<typeof bankMasterSchema>;

const BankMasterPage = () => {
  const { loading, fetchApi } = useGlobalApi();
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bankMasterSchema),
    defaultValues: {
      bankId: 0,
      bankName: "",
      isActive: 1,
    },
  });
  const isEditMode = Boolean(watch("bankId"));
  const buttonTitle = isEditMode ? "Update" : "Create";

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };

  // bank master list
  const getBankLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BANK_LIST,
      {},
      {},
      { component: "BankMasterPage" }
    );
    return resp?.data ?? [];
  };

  const { data: bankLists = [], refetch } = useQuery({
    queryKey: ["bankLists"],
    queryFn: getBankLists,
    enabled: !!showDetails,
  });

  // submit handler
  const onSubmit = async (formData: BankMasterFormItem) => {
    if (!formData?.bankName) return;
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_BANK_MASTER,
      formData,
      {},
      { component: "BankMasterPage" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Failed to save data");
      return;
    }

    showSuccess(resp?.message ?? "Bank master details saved successfully");

    reset({
      bankId: 0,
      bankName: "",
      isActive: 1,
    });
    await refetch?.();
  };

  // edit handler
  const editHandler = (item: BankItem) => {
    if (!item) {
      reset({
        bankId: 0,
        bankName: "",
        isActive: 1,
      });
      return;
    }

    reset({
      bankId: item?.bankId || 0,
      bankName: item?.bankName || "",
      isActive: Number(item?.isActive ?? 1),
    });
  };

  // cancel handler
  const cancelHandler = () => {
    reset({
      bankId: 0,
      bankName: "",
      isActive: 1,
    });
  };

  return (
    <div className="mt-1">
      <div className="card mb-1">
        <h2 className="card-title ">Bank Master Details</h2>
        {/* form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-4">
            <InputField label="Bank Name" required>
              <input
                className="input-field"
                placeholder="Enter Bank name"
                {...register("bankName")}
              />
              {errors.bankName && <p className="input-field-error">{errors.bankName.message}</p>}
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
          <div className="form-actions-responsive">
            <SubmitButton
              label={buttonTitle}
              className="save-btn-color"
              type="submit"
              onClick={handleSubmit(onSubmit)}
            />
            <CancelButton
              label="Cancel"
              className="cancel-btn-color"
              type="button"
              onClick={cancelHandler}
            />
          </div>
        </form>
      </div>

      {/* table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Bank Master List</h2>

          <button onClick={tablePopupHandler}>
            {showDetails ? <Minus size={30} /> : <Plus size={30} />}
          </button>
        </div>

        <Animation isOpen={showDetails}>
          <div className="table-container ">
            <div className="table-scroll-wrapper">
              <div className="table-size lg:min-h-80 lg:max-h-80 ">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      <th className="table-th">#</th>
                      <th className="table-th">Bank Name</th>
                      <th className="table-th">Status</th>
                      <th className="table-th">Created By</th>
                      <th className="table-th">Created On</th>
                      <th className="table-th">Last Modified By</th>
                      <th className="table-th">Last Modified On</th>
                      <th className="table-th">Edit</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bankLists?.length === 0 && (
                      <tr>
                        <td colSpan={8} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {bankLists.map((item: BankItem, idx: number) => (
                      <tr key={item?.bankId} className="table-row">
                        <td className="table-td">{idx + 1}</td>

                        <td className="table-td">{item?.bankName || "-"}</td>

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

        {!!loading && <CustomLoader isLoading={loading} />}
      </div>
    </div>
  );
};
export default BankMasterPage;
