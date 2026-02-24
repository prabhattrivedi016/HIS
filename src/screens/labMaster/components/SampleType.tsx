import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { SampleTypeMasterTableHeader } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { sampleTypeSchema } from "@/validation/labMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InferType } from "yup";
import { ColorItem, SampleTypeItem } from "../types";

type SampleTypeFormItem = InferType<typeof sampleTypeSchema>;

const SampleType = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const [colorLists, setColorLists] = useState<ColorItem[]>([]);
  const [sampleTypeMasterList, setSampleTypeMasterList] = useState<SampleTypeItem[]>([]);
  const [filteredList, setFilteredList] = useState<SampleTypeItem[]>([]);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const {
    handleSubmit,
    reset,
    register,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(sampleTypeSchema),
    defaultValues: {
      sampleTypeId: 0,
      sampleType: "",
      containerColorId: 0,
      isActive: 1,
    },
  });

  const sampleId = watch("sampleTypeId");
  const isEditMode = Boolean(sampleId);
  const buttonTitle = isEditMode ? "Update" : "Create";

  const getContainerColor = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SAMPLE_CONTAINER_COLOR_MASTER,
      {},
      {},
      { component: "SampleType", silent: true }
    );

    setColorLists(resp?.data ?? []);
  };

  const getAllSampleType = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_SAMPLE_TYPE_MASTER,
      {},
      {},
      { component: "SampleType", silent: true }
    );

    setSampleTypeMasterList(resp?.data ?? []);
    setFilteredList(resp?.data ?? []);
  };

  useEffect(() => {
    getContainerColor();
    if (showDetails) {
      getAllSampleType();
    }
  }, [showDetails]);

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };

  /*-----------------edit handler----------------- */
  const editHandler = (item: SampleTypeItem) => {
    if (!item) return;
    reset({
      sampleTypeId: item?.sampleTypeId || 0,
      sampleType: item?.sampleType || "",
      containerColorId: item?.containerColorId || 0,
      isActive: Number(item?.isActive ?? 1),
    });
  };

  const onSubmit = async (formData: SampleTypeFormItem) => {
    if (!formData?.containerColorId) return;

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_SAMPLE_TYPE_MASTER,
      formData,
      {},
      { component: "SampleType" }
    );
    if (!resp) return;

    if (resp?.result) {
      setSuccessMessage(resp?.message || "saved successfully");
      reset({
        sampleTypeId: 0,
        sampleType: "",
        containerColorId: 0,
        isActive: 1,
      });
      await getAllSampleType();
    }
  };

  /*--------------------search handler-------------- */
  const searchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();

    const filtered = sampleTypeMasterList.filter(item =>
      item?.sampleType?.toLowerCase().includes(value)
    );

    setFilteredList(filtered);
  };

  const cancelHandler = () => {
    reset({
      sampleTypeId: 0,
      sampleType: "",
      containerColorId: 0,
      isActive: 1,
    });
  };
  return (
    <div className="-mt-2">
      <div className="card -mt-10">
        <h2 className="card-title ">Sample Master Details</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-4">
            <InputField label="Sample Type Name" required>
              <input
                className="input-field"
                placeholder="Enter sample type name"
                {...register("sampleType")}
              />
              {errors.sampleType && (
                <p className="input-field-error">{errors.sampleType.message}</p>
              )}
            </InputField>

            <InputField label="Sample Container Color" required>
              <select className="input-field" {...register("containerColorId")}>
                <option value={0}>Select</option>
                {colorLists?.map(c => (
                  <option key={c?.colorId} value={c?.colorId}>
                    {c?.colorName}
                  </option>
                ))}
              </select>
              {errors.containerColorId && (
                <p className="input-field-error">{errors.containerColorId.message}</p>
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

      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Sample Type List</h2>

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
                      {SampleTypeMasterTableHeader.map((h, index) => (
                        <th key={index} className="table-th align-top ">
                          {h === "Sample Type" ? (
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
                        <td colSpan={SampleTypeMasterTableHeader.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {filteredList.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>

                        <td className="table-td">{item?.sampleType || "-"}</td>
                        <td className="table-td">
                          {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                        </td>
                        <td className="table-td">{item?.colorName || "-"}</td>
                        <td className="table-td">
                          {item?.colorCode ? (
                            <span
                              className="inline-block w-5 h-5 rounded-full border"
                              style={{ backgroundColor: item.colorCode }}
                              title={item.colorCode}
                            />
                          ) : (
                            <i className="fa-solid fa-flask"></i>
                          )}
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

export default SampleType;
