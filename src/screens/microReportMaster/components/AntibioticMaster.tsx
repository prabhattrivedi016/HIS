import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { AntibioticMasterTableHeader } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import {
  AntibioticMasterFormItem,
  antibioticMasterSchema,
  OrganismMasterFormItem,
} from "@/validation/microReportMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AntibioticGroupItem, AntibioticMasterItem } from "../types";
import AntibioticGroupPopup from "./AntibioticGroupPopup";

const AntibioticMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const [openAntibioticPopup, setOpenAntibioticPopup] = useState<boolean>(false);
  const [renderAntibioticPopup, setRenderAntibioticPopup] = useState<boolean>(false);

  const [selectedAntibioticItem, setSelectedAntibioticItem] = useState<AntibioticGroupItem | null>(
    null
  );

  const [searchFilters, setSearchFilters] = useState({
    antibioticName: "",
    antibioticGroup: "",
  });

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(antibioticMasterSchema),
    defaultValues: {
      antibioticNameId: 0,
      antibioticName: "",
      antibioticGroupId: 0,
      isActive: 1,
    },
  });

  const isEdit = Boolean(watch("antibioticNameId"));
  const buttonTitle = isEdit ? "Update" : "create";

  // get antibiotic group
  const getAntibioticGroupList = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ANTIBIOTIC_GROUP_LIST,
      {},
      {},
      { component: "AntibioticMaster" }
    );
    return resp?.data;
  }, []);

  const {
    isLoading,
    data: antibioticGroupList = [],
    refetch,
  } = useQuery({
    queryKey: ["antibioticGroupList"],
    queryFn: () => getAntibioticGroupList(),
  });

  //antibiotic group popup handler
  const antibioticGroupPopupHandler = () => {
    setOpenAntibioticPopup(true);
    setRenderAntibioticPopup(true);
  };

  const antibioticGroupSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setSelectedAntibioticItem(null);
      setValue("antibioticGroupId", 0);
      return;
    }

    const selectedItem = antibioticGroupList.find(
      (item: AntibioticGroupItem) => item.antibioticGroupId === Number(val)
    );
    setSelectedAntibioticItem(selectedItem || null);
    setValue("antibioticGroupId", Number(val));
  };

  // close handler
  const closePopupHandler = useCallback(() => {
    setOpenAntibioticPopup(false);
  }, []);

  // get antibiotic master'
  const getAntibioticMaster = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ANTIBIOTIC_NAME_LIST,
      {},
      {},
      { component: "AntibioticMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: antibioticMasterList = [], refetch: refetchAntibioticMaster } = useQuery({
    queryKey: ["antibioticMasterList"],
    queryFn: () => getAntibioticMaster(),
  });

  const createUpdateAntibiotic = async (data: OrganismMasterFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_ANTIBIOTIC_NAME,
      data,
      {},
      { component: "AntibioticMaster" }
    );
    return resp;
  };

  const mutation = useMutation({
    mutationKey: ["createUpdateAntibiotic"],
    mutationFn: createUpdateAntibiotic,
    onSuccess: resp => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "Failed to update Data");
        return;
      }
      showSuccess(resp?.message ?? "Data saved successfully");
      refetchAntibioticMaster();
      reset({
        antibioticNameId: 0,
        antibioticName: "",
        antibioticGroupId: 0,
        isActive: 1,
      });
      setSelectedAntibioticItem(null);
    },
    onError: errors => {
      showError(errors?.message ?? "Something went wrong");
    },
  });

  // submit handler
  const onsubmit = (data: AntibioticMasterFormItem) => {
    mutation.mutate(data);
  };

  const searchOrganismNameHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchFilters(prev => ({
      ...prev,
      antibioticName: e.target.value,
    }));
  };

  const searchOrganismGroupHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchFilters(prev => ({
      ...prev,
      antibioticGroup: e.target.value,
    }));
  };

  // filterred list
  const filteredOrganismMasterData = useMemo(() => {
    return antibioticMasterList.filter((item: AntibioticMasterItem) => {
      const organismNameMatch = item.antibioticName
        ?.toLowerCase()
        .includes(searchFilters.antibioticName.toLowerCase());

      const organismGroupMatch = item.antibioticGroup
        ?.toLowerCase()
        .includes(searchFilters.antibioticGroup.toLowerCase());

      return organismNameMatch && organismGroupMatch;
    });
  }, [antibioticMasterList, searchFilters]);

  // edit handler
  const cancelHandler = () => {
    reset({
      antibioticNameId: 0,
      antibioticName: "",
      antibioticGroupId: 0,
      isActive: 1,
    });
    setSelectedAntibioticItem(null);
  };

  // edit handler
  const editHandler = (item: AntibioticMasterItem) => {
    reset({
      antibioticNameId: item.antibioticNameId ?? 0,
      antibioticName: item.antibioticName ?? "",
      antibioticGroupId: item.antibioticGroupId ?? 0,
      isActive: item?.isActive ?? 1,
    });
    const selectedAntibiotic = antibioticGroupList?.find(
      (og: AntibioticGroupItem) => og.antibioticGroupId === item.antibioticGroupId
    );
    setSelectedAntibioticItem(selectedAntibiotic ?? null);
  };

  return (
    <div className="mt-1">
      <div className="card mb-1">
        {/* form data */}
        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            <InputField label="Antibiotic Name" required>
              <input
                className="input-field"
                placeholder="Enter organism name"
                {...register("antibioticName")}
              />
              {errors.antibioticName && (
                <p className="input-field-error">{errors.antibioticName.message}</p>
              )}
            </InputField>

            <InputField label="Antibiotic Group" required>
              <div className="flex gap-2 items-center">
                <select
                  className="input-field"
                  value={selectedAntibioticItem?.antibioticGroupId ?? ""}
                  onChange={antibioticGroupSelectHandler}
                >
                  <option value="">Select</option>
                  {antibioticGroupList?.map((item: AntibioticGroupItem) => (
                    <option key={item?.antibioticGroupId} value={item?.antibioticGroupId}>
                      {item?.antibioticGroupName}
                    </option>
                  ))}
                </select>
                <button type="button" className="-mt-2" onClick={antibioticGroupPopupHandler}>
                  <i className="fa-solid fa-circle-plus fa-xl active:scale-95"></i>
                </button>
              </div>

              {errors.antibioticGroupId && (
                <p className="input-field-error">{errors.antibioticGroupId.message}</p>
              )}
            </InputField>

            <InputField label="Status" required>
              <select className="input-field" {...register("isActive")}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
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

      {/* table data */}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Antibiotic Master List</h2>
        </div>
        <div className="table-container ">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-72 lg:max-h-72 ">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {AntibioticMasterTableHeader.map((h, index) => (
                      <th key={index} className="table-th align-top">
                        <div className="flex flex-col">
                          <h2>{h}</h2>

                          {h === "Antibiotic Name" && (
                            <input
                              type="text"
                              placeholder="Search name..."
                              className="input-field lg:max-w-35 lg:max-h-7 mt-1"
                              value={searchFilters.antibioticName}
                              onChange={searchOrganismNameHandler}
                            />
                          )}

                          {h === "Antibiotic Group" && (
                            <input
                              type="text"
                              placeholder="Search group..."
                              className="input-field lg:max-w-35 lg:max-h-7 mt-1"
                              value={searchFilters.antibioticGroup}
                              onChange={searchOrganismGroupHandler}
                            />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredOrganismMasterData.length === 0 && (
                    <tr>
                      <td colSpan={AntibioticMasterTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {filteredOrganismMasterData.map((item: AntibioticMasterItem, idx: number) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>

                      <td className="table-td">{item?.antibioticName || "-"}</td>

                      <td className="table-td">{item?.antibioticGroup || "-"}</td>

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
      {/* render og group */}
      {!!renderAntibioticPopup && (
        <AntibioticGroupPopup
          isOpen={openAntibioticPopup}
          onClose={closePopupHandler}
          data={selectedAntibioticItem}
          onRefresh={refetch}
          initialValue={setSelectedAntibioticItem}
        />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default AntibioticMaster;
