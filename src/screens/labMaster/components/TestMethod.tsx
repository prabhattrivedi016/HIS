import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { LabMethodTableHeader } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { testMethodSchema } from "@/validation/labMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InferType } from "yup";
import { LabMethodItem } from "../types";
type LabMethodFormItem = InferType<typeof testMethodSchema>;

const TestMethod = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [labMethodsList, setLabMethodList] = useState<LabMethodItem[]>([]);
  const [filteredList, setFilteredList] = useState<LabMethodItem[]>([]);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(testMethodSchema),
    defaultValues: {
      methodId: 0,
      method: "",
      isActive: 1,
    },
  });
  const methodId = watch("methodId");
  const isEdit = Boolean(methodId);
  const buttonTitle = isEdit ? "Update" : "Create";

  /*------------------get lab method master------------- */
  const getLabMethod = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_LAB_METHOD_MASTER,
      {},
      {},
      { component: "TestMethod" }
    );
    setLabMethodList(resp?.data ?? []);
    setFilteredList(resp?.data ?? []);
  };

  useEffect(() => {
    if (showDetails) {
      getLabMethod();
    }
  }, [showDetails]);

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };

  /*----------------submit handler-------------- */
  const onsubmit = async (formData: LabMethodFormItem) => {
    console.log("formData", formData);
    if (!formData?.methodId) return;

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_LAB_METHOD_MASTER,
      formData,
      {},
      { component: "TestMethod" }
    );

    if (!resp) return;

    if (resp?.result) {
      setSuccessMessage(resp?.message || "saved successfully");
      reset({
        methodId: 0,
        method: "",
        isActive: 1,
      });
      await getLabMethod();
    }
  };

  /*-----------------edit handler----------------- */
  const editHandler = (item: LabMethodItem) => {
    if (!item) return;
    reset({
      methodId: item?.methodId || 0,
      method: item?.method || "",
      isActive: Number(item?.isActive ?? 1),
    });
  };

  /*--------------------search handler-------------- */
  const searchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();

    const filtered = labMethodsList.filter(item => item?.method?.toLowerCase().includes(value));

    setFilteredList(filtered);
  };

  const cancelHandler = () => {
    reset({
      methodId: 0,
      method: "",
      isActive: 1,
    });
  };
  return (
    <div className="-mt-2">
      <div className="card -mt-10">
        <h2 className="card-title ">Test Method Details</h2>

        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            <InputField label="Test Method Name" required>
              <input
                className="input-field"
                placeholder="Enter text method name"
                {...register("method")}
              />
              {errors.method && <p className="input-field-error">{errors.method.message}</p>}
            </InputField>

            <InputField label="Status">
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
          <h2 className="card-title ">Lab Method List</h2>

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
                      {LabMethodTableHeader.map((h, index) => (
                        <th key={index} className="table-th align-top ">
                          {h === "Method" ? (
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
                        <td colSpan={filteredList?.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {filteredList.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>

                        <td className="table-td">{item?.method || "-"}</td>
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

export default TestMethod;
