import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { BankMasterTableHeader } from "@/constants/constants";
import { bankMasterSchema } from "@/validation/bankMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InferType } from "yup";
import { ENDPOINTS } from "../../../config/defaults";
import useGlobalApi from "../../../hooks/useGlobalApi";
import { BankItem } from "../types";
type BankMasterFormItem = InferType<typeof bankMasterSchema>;

const BankMasterPage = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [bankLists, setBankLists] = useState<BankItem[]>([]);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

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
  const bankId = watch("bankId");
  const isEditMode = Boolean(bankId);
  const buttonTitle = isEditMode ? "Update" : "Create";

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };

  /*-----------------bank master list----------------- */
  const getBankLists = async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_BANK_LIST);
    setBankLists(resp?.data ?? []);
  };

  useEffect(() => {
    if (showDetails) {
      getBankLists();
    }
  }, [showDetails]);

  /*--------------------submit handler------------ */
  const onSubmit = async (formData: BankMasterFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_BANK_MASTER,
      formData,
      {},
      { component: "BankMasterPage" }
    );
    if (!resp) return;
    if (resp?.result) {
      setSuccessMessage(resp?.message || "Saved successfully");
      reset({
        bankId: 0,
        bankName: "",
        isActive: 1,
      });
      await getBankLists();
    }
  };

  /*-------------------------edit handler------------------- */
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

  /*-----------------cancel handler-------------------- */
  const cancelHandler = () => {
    reset({
      bankId: 0,
      bankName: "",
      isActive: 1,
    });
  };

  return (
    <div className="-mt-2">
      <div className="card -mt-10">
        <h2 className="card-title ">Sample Master Details</h2>

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
              <div className="table-size">
                <table className="base-table">
                  <thead className="table-head">
                    <tr>
                      {BankMasterTableHeader.map((h, index) => (
                        <th key={index} className="table-th ">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {bankLists?.length === 0 && (
                      <tr>
                        <td colSpan={bankLists.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {bankLists.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>

                        <td className="table-td">{item?.bankName || "-"}</td>

                        <td className="table-td">
                          {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                        </td>

                        <td className="table-td">{item?.createdBy || "-"}</td>
                        <td className="table-td">{item?.createdOn || "-"}</td>
                        <td className="table-td">{item?.lastModifiedBy || "-"}</td>
                        <td className="table-td">{item?.lastModifiedOn || "-"}</td>

                        <td className="table-td" onClick={() => editHandler(item)}>
                          <i className="fa-solid fa-edit text-xl text-blue-500 active:scale-90" />
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
export default BankMasterPage;
