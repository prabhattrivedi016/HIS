import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { HeaderMasterTableHeader } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem } from "@/types";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import {
  HeaderMasterFormData,
  headerMasterSchema,
} from "@/validation/consultationHeaderMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { HeaderMasterItem, ListOfLovsItem } from "../types";

type HeaderMasterPayload = HeaderMasterFormData & { ListOfValues: ListOfLovsItem[] };

const HeaderMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();
  const controlTypeList = usePickMaster("DoctorHeaderControlType")?.pickMasterValue ?? [];

  const usedForList = usePickMaster("DoctorHeaderUsedForPatientType")?.pickMasterValue ?? [];

  const lovsList = usePickMaster("DoctorHeaderControlTableLOVs")?.pickMasterValue ?? [];

  const [lovItems, setLovsItems] = useState<ListOfLovsItem[]>([
    {
      dataTypeId: 0,
      value: "",
    },
  ]);

  const [selectedControlId, setSelectedControlId] = useState<number | null>(null);

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(headerMasterSchema),
    defaultValues: {
      headerId: 0,
      headerName: "",
      displayName: "",
      controlType: "Text Box",
      controlTypeId: 1,
      isPrint: 1,
      isShowInTempRoom: 0,
      usedForPatientType: 1,
      isActive: 1,
    },
  });

  const isEdit = Boolean(watch("headerId"));
  const buttonTitle = isEdit ? "Update" : "Create";

  const watchControlTypeId = watch("controlTypeId");

  // Sync selectedControlId with watchControlTypeId
  useEffect(() => {
    if (watchControlTypeId) {
      setSelectedControlId(Number(watchControlTypeId));
    }
  }, [watchControlTypeId]);

  // control type select handler
  const controlTypeSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);

    if (!value) {
      setSelectedControlId(null);
      setValue("controlType", "");
      setValue("controlTypeId", 0);
      return;
    }

    const selectedType = controlTypeList.find((c: PickMasterItem) => Number(c.key) === value);
    setSelectedControlId(value);
    setValue("controlType", selectedType?.value ?? "");
    setValue("controlTypeId", value);
  };

  // Reset lovItems when selectedControlId changes (only for new records)
  useEffect(() => {
    // Only reset if creating new record (headerId === 0), not when editing
    if (selectedControlId && !watch("headerId")) {
      setLovsItems([{ dataTypeId: 0, value: "" }]);
    }
  }, [selectedControlId, watch("headerId")]);

  // Check row limit for control type 9
  useEffect(() => {
    if (selectedControlId === 9 && lovItems.length > 5) {
      showWarning("You cannot add more than five rows");

      return;
    }
  }, [selectedControlId, lovItems?.length]);

  const lovValueChangeHandler = (index: number, value: string) => {
    setLovsItems(prev => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        value,
      };

      return updated;
    });
  };

  const lovKeyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    const currentValue = lovItems[index]?.value?.trim();

    if (!currentValue) return;

    const isLastRow = index === lovItems.length - 1;

    if (isLastRow) {
      // Check if adding a new row exceeds the limit for control type 9
      if (selectedControlId === 9 && lovItems.length >= 5) {
        showWarning("You cannot add more than five rows");
        return;
      }

      setLovsItems(prev => [
        ...prev,
        {
          dataTypeId: 0,
          value: "",
        },
      ]);
    }
  };

  // delete row
  const deleteLovHandler = (dataTypeId: number) => {
    setLovsItems(prev => {
      const filtered = prev.filter(item => item.dataTypeId !== dataTypeId);

      return filtered.length ? filtered : [{ dataTypeId: Date.now(), value: "" }];
    });
  };

  // lov  change handler
  const lovsChangeHandler = (e: ChangeEvent<HTMLSelectElement>, idx: number) => {
    const num = Number(e.target.value);

    setLovsItems(prev => {
      const updated = [...prev];

      updated[idx] = {
        ...updated[idx],
        dataTypeId: num,
      };

      return updated;
    });
  };

  const createUpdateHeaderMaster = async (data: HeaderMasterPayload) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_DOCTOR_HEADER,
      data,
      {},
      { component: "HeaderMaster" }
    );
    return resp;
  };

  const mutation = useMutation<any, Error, HeaderMasterPayload>({
    mutationKey: ["createUpdateHeaderMaster"],
    mutationFn: (data: HeaderMasterPayload) => createUpdateHeaderMaster(data),

    onSuccess: resp => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "Something went wrong");
        return;
      }
      showSuccess(resp?.message ?? "Data saved successfully");
      queryClient.invalidateQueries({
        queryKey: ["getHeaderMasterList"],
      });

      reset({
        headerId: 0,
        headerName: "",
        displayName: "",
        controlType: "Text Box",
        controlTypeId: 1,
        isPrint: 1,
        isShowInTempRoom: 0,
        usedForPatientType: 1,
        isActive: 1,
      });
    },

    onError: error => {
      showError(error?.message);
    },
  });

  // submit handler
  const onsubmit = (data: HeaderMasterFormData) => {
    if (selectedControlId === 9) {
      const hasInvalidLov = lovItems.some(l => l.dataTypeId === 0 || !l.value.trim());

      if (hasInvalidLov) {
        showWarning("Please select one LOV and enter value in LOVs");
        return;
      }
    } else if (selectedControlId === 3 || selectedControlId === 4) {
      const hasInvalidLov = lovItems.some(l => !l.value.trim());

      if (hasInvalidLov) {
        showWarning("Please enter value in LOVs");
        return;
      }
    }

    const payload: HeaderMasterPayload = {
      ...data,
      ListOfValues:
        selectedControlId === 3 || selectedControlId === 4 || selectedControlId === 9
          ? lovItems.filter(item => item.value.trim())
          : [],
    };

    mutation.mutate(payload);
  };

  // get header master lists
  const getHeaderMasterList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_DOCTOR_HEADER_MASTER,
      {},
      {},
      { component: "HeaderMaster" }
    );
    return resp?.data;
  };

  const { data = [] } = useQuery({
    queryKey: ["getHeaderMasterList"],
    queryFn: getHeaderMasterList,
  });

  const getLovsListByHeader = async (headerId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_HEARDER_LOVS,
      {},
      { params: { headerId } },
      { component: "HeaderMaster" }
    );

    // Handle multiple LOVs from API
    if (Array.isArray(resp?.data) && resp?.data?.length > 0) {
      const mappedItems: ListOfLovsItem[] = resp?.data?.map((item: any) => ({
        dataTypeId: item?.dataTypeId || 0,
        value: item?.value || "",
      }));
      setLovsItems(mappedItems);
    } else if (resp?.data && resp?.value) {
      // Single item case
      setLovsItems([{ dataTypeId: resp?.data, value: resp?.value }]);
    }
  };

  // edit handler
  const editHandler = async (item: HeaderMasterItem) => {
    reset({
      headerId: item?.headerId ?? 0,
      headerName: item?.headerName ?? "",
      displayName: item?.displayName ?? "",
      controlType: item?.controlType ?? "",
      controlTypeId: item?.controlTypeId ?? 1,
      isPrint: item?.isPrint ?? 1,
      isShowInTempRoom: item?.isShowInTempRoom ?? 0,
      usedForPatientType: item?.usedForPatientType ?? 0,
      isActive: item?.isActive ?? 1,
    });

    setSelectedControlId(item?.controlTypeId ?? null);

    const selectedCont = controlTypeList?.find(
      (c: PickMasterItem) => Number(c?.key) === item?.controlTypeId
    );

    setValue("controlType", selectedCont?.value ?? "");
    setValue("controlTypeId", Number(selectedCont?.key ?? 0));

    await getLovsListByHeader(Number(item?.headerId));
  };

  // cancel handler
  const cancelHandler = () => {
    reset({
      headerId: 0,
      headerName: "",
      displayName: "",
      controlType: "Text Box",
      controlTypeId: 1,
      isPrint: 1,
      isShowInTempRoom: 0,
      usedForPatientType: 1,
      isActive: 1,
    });
  };

  return (
    <>
      <div className="card mt-1">
        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            <InputField label="Header" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter header"
                {...register("headerName")}
              />
              {errors.headerName && (
                <p className="input-field-error">{errors.headerName.message}</p>
              )}
            </InputField>

            <InputField label="Display Name" required>
              <input
                type="text"
                className="input-field"
                placeholder="Enter display name"
                {...register("displayName")}
              />
              {errors.displayName && (
                <p className="input-field-error">{errors.displayName.message}</p>
              )}
            </InputField>

            <InputField label="Control Type" required>
              <select
                className="input-field"
                onChange={controlTypeSelectHandler}
                value={watchControlTypeId}
              >
                <option value="">Select</option>
                {controlTypeList?.map((i: PickMasterItem) => (
                  <option key={i?.key} value={i?.key}>
                    {i?.value}
                  </option>
                ))}
              </select>
              {errors.controlType && (
                <p className="input-field-error">{errors.controlType.message}</p>
              )}
            </InputField>

            <InputField label="Show on Print" required>
              <select className="input-field" {...register("isPrint")}>
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
              {errors.isPrint && <p className="input-field-error">{errors.isPrint.message}</p>}
            </InputField>

            <InputField label="Show in Temperature Room">
              <select className="input-field" {...register("isShowInTempRoom")}>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </InputField>

            <InputField label="Used for">
              <select className="input-field" {...register("usedForPatientType")}>
                {usedForList?.map((i: PickMasterItem) => (
                  <option key={i?.key} value={i?.key}>
                    {i?.value}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Status" required>
              <select className="input-field" {...register("isActive")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </InputField>

            {selectedControlId === 3 || selectedControlId === 4 || selectedControlId === 9 ? (
              <InputField label="List Of Values" required>
                <div className="border border-gray-200 rounded-xl bg-gray-50 p-1">
                  <table className="w-full">
                    <tbody>
                      {lovItems.map((item, index) => (
                        <tr key={item.dataTypeId} className=" ">
                          <td className=" ">
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="text"
                                className="input-field "
                                placeholder="Enter value and click Enter to add more rows"
                                value={item.value}
                                onChange={e => lovValueChangeHandler(index, e.target.value)}
                                onKeyDown={e => lovKeyDownHandler(e, index)}
                              />

                              {selectedControlId === 9 ? (
                                <select
                                  className="input-field"
                                  value={item.dataTypeId}
                                  onChange={e => lovsChangeHandler(e, index)}
                                >
                                  <option value={0}>Select</option>
                                  {lovsList?.map((l: PickMasterItem) => (
                                    <option key={l?.key} value={l?.key}>
                                      {l?.value}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <></>
                              )}
                            </div>
                          </td>

                          <td className="w-12 text-center">
                            {lovItems.length > 1 && (
                              <button
                                type="button"
                                className="delete-icon"
                                onClick={() => deleteLovHandler(item.dataTypeId)}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </InputField>
            ) : (
              <></>
            )}
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
        {!!loading && <CustomLoader isLoading={loading} />}
      </div>

      {/* table */}

      <div className="card mt-1">
        <div className="card-header">
          <h2 className="card-title ">Header Master List</h2>
        </div>

        <div className="table-container ">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-72 lg:max-h-72 ">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {HeaderMasterTableHeader.map((h, index) => (
                      <th key={index} className="table-th align-top ">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={HeaderMasterTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {data.map((item: HeaderMasterItem, idx: number) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td">{item?.headerName || "-"}</td>
                      <td className="table-td">{item?.displayName || "-"}</td>
                      <td className="table-td">{item?.controlType || "-"}</td>
                      <td
                        className={`table-td ${
                          Number(item?.isPrint) === 1 ? "active-text" : "inactive-text"
                        }`}
                      >
                        {Number(item?.isActive) === 1 ? "Yes" : "No"}
                      </td>
                      <td
                        className={`table-td ${
                          Number(item?.isShowInTempRoom) === 1 ? "active-text" : "inactive-text"
                        }`}
                      >
                        {Number(item?.isShowInTempRoom) === 1 ? "Yes" : "No"}
                      </td>
                      <td className="table-td">{item?.usedForPatientTypeName || "-"}</td>
                      <td
                        className={`table-td ${
                          Number(item?.isActive) === 1 ? "active-text" : "inactive-text"
                        }`}
                      >
                        {Number(item?.isActive) === 1 ? "Active" : "Inactive"}
                      </td>
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
      </div>
    </>
  );
};

export default HeaderMaster;
