import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { OrganismMasterTableHeader } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { OrganismMasterFormItem, organismMasterSchema } from "@/validation/microReportMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { OrganismGroupItem, OrganismMasterItem } from "../types";
import OrganismGroupPopup from "./OrganismGroupPopup";

const OrganismMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const [openOGPopup, setOGPopup] = useState<boolean>(false);
  const [renderOGPopup, setRenderOGPopup] = useState<boolean>(false);
  const [selectedOGItem, setSelectedOGItem] = useState<OrganismGroupItem | null>(null);

  const [searchFilters, setSearchFilters] = useState({
    organismName: "",
    organismGroup: "",
  });

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(organismMasterSchema),
    defaultValues: {
      organismNameId: 0,
      organismName: "",
      organismGroupId: 0,
      isActive: 1,
    },
  });

  const isEdit = Boolean(watch("organismNameId"));
  const buttonTitle = isEdit ? "Update" : "create";

  // get organism group
  const getOrganismGroupList = useCallback(async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ORGANISM_GROUP_LIST,
      {},
      {},
      { component: "OrganismMaster" }
    );
    return resp?.data;
  }, []);

  const {
    isLoading,
    data: organismGroupList = [],
    refetch,
  } = useQuery({
    queryKey: ["organismGroupList"],
    queryFn: () => getOrganismGroupList(),
  });

  // organism group popup handler
  const organismGroupPopupHandler = () => {
    setOGPopup(true);
    setRenderOGPopup(true);
  };

  const organismGroupSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setSelectedOGItem(null);
      setValue("organismGroupId", 0);
      return;
    }

    const selectedItem = organismGroupList.find(
      (item: OrganismGroupItem) => item.organismGroupId === Number(val)
    );
    setSelectedOGItem(selectedItem);
    setValue("organismGroupId", Number(val));
  };

  // close handler
  const closePopupHandler = useCallback(() => {
    setOGPopup(false);
  }, []);

  // get organism master'
  const getOrganismMaster = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ORGANISM_NAME_LIST,
      {},
      {},
      { component: "OrganismMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: organismList = [] } = useQuery({
    queryKey: ["organismMasterList"],
    queryFn: () => getOrganismMaster(),
  });

  const createUpdateOrganism = async (data: OrganismMasterFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_ORGANISM_NAME,
      data,
      {},
      { component: "OrganismMaster" }
    );
    return resp;
  };

  const mutation = useMutation({
    mutationKey: ["createUpdateOrganism"],
    mutationFn: createUpdateOrganism,
    onSuccess: resp => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "Failed to update Data");
        return;
      }
      showSuccess(resp?.message ?? "Data saved successfully");
      refetch();
      reset({
        organismNameId: 0,
        organismName: "",
        organismGroupId: 0,
        isActive: 1,
      });
    },
    onError: errors => {
      showError(errors?.message ?? "Something went wrong");
    },
  });

  // submit handler
  const onsubmit = (data: OrganismMasterFormItem) => {
    mutation.mutate(data);
  };

  const searchOrganismNameHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchFilters(prev => ({
      ...prev,
      organismName: e.target.value,
    }));
  };

  const searchOrganismGroupHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchFilters(prev => ({
      ...prev,
      organismGroup: e.target.value,
    }));
  };

  // filterred list
  const filteredOrganismMasterData = useMemo(() => {
    return organismList.filter((item: OrganismMasterItem) => {
      const organismNameMatch = item.organismName
        ?.toLowerCase()
        .includes(searchFilters.organismName.toLowerCase());

      const organismGroupMatch = item.organismGroup
        ?.toLowerCase()
        .includes(searchFilters.organismGroup.toLowerCase());

      return organismNameMatch && organismGroupMatch;
    });
  }, [organismList, searchFilters]);

  // edit handler
  const cancelHandler = () => {
    reset({
      organismNameId: 0,
      organismName: "",
      organismGroupId: 0,
      isActive: 1,
    });
    setSelectedOGItem(null);
  };

  // edit handler
  const editHandler = (item: OrganismMasterItem) => {
    reset({
      organismNameId: item.organismNameId ?? 0,
      organismName: item.organismName ?? "",
      organismGroupId: item.organismGroupId ?? 0,
      isActive: item?.isActive ?? 1,
    });
    const selectedOGItem = organismGroupList?.find(
      (og: OrganismGroupItem) => og.organismGroupId === item.organismGroupId
    );
    setSelectedOGItem(selectedOGItem ?? null);
  };

  return (
    <div className="mt-1">
      <div className="card mb-1">
        {/* form data */}
        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            <InputField label="Organism Name" required>
              <input
                className="input-field"
                placeholder="Enter organism name"
                {...register("organismName")}
              />
              {errors.organismName && (
                <p className="input-field-error">{errors.organismName.message}</p>
              )}
            </InputField>

            <InputField label="Organism Group" required>
              <div className="flex gap-2 items-center">
                <select
                  className="input-field"
                  value={selectedOGItem?.organismGroupId ?? ""}
                  onChange={organismGroupSelectHandler}
                >
                  <option value="">Select</option>
                  {organismGroupList?.map((item: OrganismGroupItem) => (
                    <option key={item.organismGroupId} value={item.organismGroupId}>
                      {item.organismGroupName}
                    </option>
                  ))}
                </select>
                <button type="button" className="-mt-2" onClick={organismGroupPopupHandler}>
                  <i className="fa-solid fa-circle-plus fa-xl active:scale-95"></i>
                </button>
              </div>

              {errors.organismGroupId && (
                <p className="input-field-error">{errors.organismGroupId.message}</p>
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
          <h2 className="card-title ">Organism Master List</h2>
        </div>
        <div className="table-container ">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-72 lg:max-h-72 ">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {OrganismMasterTableHeader.map((h, index) => (
                      <th key={index} className="table-th align-top">
                        <div className="flex flex-col">
                          <h2>{h}</h2>

                          {h === "Organism Name" && (
                            <input
                              type="text"
                              placeholder="Search name..."
                              className="input-field lg:max-w-35 lg:max-h-7 mt-1"
                              value={searchFilters.organismName}
                              onChange={searchOrganismNameHandler}
                            />
                          )}

                          {h === "Organism Group" && (
                            <input
                              type="text"
                              placeholder="Search group..."
                              className="input-field lg:max-w-35 lg:max-h-7 mt-1"
                              value={searchFilters.organismGroup}
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
                      <td colSpan={OrganismMasterTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {filteredOrganismMasterData.map((item: OrganismMasterItem, idx: number) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>

                      <td className="table-td">{item?.organismName || "-"}</td>

                      <td className="table-td">{item?.organismGroup || "-"}</td>

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
      {!!renderOGPopup && (
        <OrganismGroupPopup
          isOpen={openOGPopup}
          onClose={closePopupHandler}
          data={selectedOGItem}
          onRefresh={refetch}
          initialValue={setSelectedOGItem}
        />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default OrganismMaster;
