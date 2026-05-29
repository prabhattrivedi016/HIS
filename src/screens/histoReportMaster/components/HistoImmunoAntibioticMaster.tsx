import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { HistoImmunoAntibioticMasterTableHeader } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../../../components/customInputField";
import {
  HistoImmunoAntibioticMasterFormItem,
  histoImmunoAntibioticMasterSchema,
} from "../../../validation/histoReportMasterSchema";
import { HistoImmunoAntibioticMasterItem } from "../types";

const HistoImmunoAntibioticMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();

  const [searchValue, setSearchValue] = useState<string>("");
  const {
    handleSubmit,
    reset,
    formState: { errors },
    register,
    watch,
  } = useForm({
    resolver: yupResolver(histoImmunoAntibioticMasterSchema),
    defaultValues: {
      id: 0,
      antibioticName: "",
      isActive: 1,
    },
  });

  const isEdit = Boolean(watch("id"));
  const buttonTitle = isEdit ? "Update" : "Save";

  // get antibioticlist
  const getAntibioticList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_HISTO_IMMUNO_ANTIBIOTIC_MASTER,
      {},
      {},
      { component: "HistoImmunoAntibioticMaster" }
    );
    return resp?.data ?? [];
  };
  const { isLoading, data: antiBioticList = [] } = useQuery<HistoImmunoAntibioticMasterItem[]>({
    queryKey: ["histo-immuno-antibiotic"],
    queryFn: getAntibioticList,
  });

  // filter
  const filteredAntiBioticMaster = useMemo(() => {
    if (!searchValue) return antiBioticList;
    return antiBioticList.filter(item =>
      item.antibioticName.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, antiBioticList]);

  const createUpdateHistoImmunoMaster = async (data: HistoImmunoAntibioticMasterFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_HISTO_IMMUNO_ANTIBIOTIC_MASTER,
      data,
      {},
      { component: "HistoImmunoAntibioticMaster" }
    );
    return resp;
  };

  const submitHandler = useMutation({
    mutationFn: createUpdateHistoImmunoMaster,
    mutationKey: ["createUpdateHistoImmunoMaster"],
    onSuccess: resp => {
      showSuccess(resp?.message ?? "Data saved successfully");

      queryClient.invalidateQueries({
        queryKey: ["histo-immuno-antibiotic"],
      });
      reset({
        id: 0,
        antibioticName: "",
        isActive: 1,
      });
    },
    onError: resp => {
      showWarning(resp?.message ?? "Something went wrong");
    },
  });

  // submit handler
  const onSubmit = (data: HistoImmunoAntibioticMasterFormItem) => {
    submitHandler.mutate(data);
  };

  const cancelHandler = () => {
    reset({
      id: 0,
      antibioticName: "",
      isActive: 1,
    });
  };

  // edit handler
  const editHandler = (item: HistoImmunoAntibioticMasterItem) => {
    reset({
      id: item?.id ?? 0,
      antibioticName: item?.antibioticName || "",
      isActive: item?.isActive ?? 1,
    });
  };

  return (
    <div className="mt-1">
      {/* form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card mb-1">
          <div className="form-grid-4">
            <InputField label="Antibiotic Name " required>
              <input
                className="input-field"
                placeholder="Enter antibiotic name"
                {...register("antibioticName")}
              />
              {errors.antibioticName && (
                <p className="input-field-error">{errors.antibioticName.message}</p>
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
            <button type="submit" className="save-btn" disabled={isLoading}>
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button " onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* table data */}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Histo Immuno Antibiotic Master List</h2>
        </div>

        <div className="table-container ">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-72 lg:max-h-72 ">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {HistoImmunoAntibioticMasterTableHeader.map((h, index) => (
                      <th key={index} className="table-th align-top ">
                        {h === "Antibiotic Name" ? (
                          <div className="flex flex-row gap-2 ">
                            <h2>{h}</h2>
                            <input
                              type="text"
                              className="input-field lg:max-w-35 lg:max-h-7 "
                              placeholder="search name..."
                              onChange={e => setSearchValue(e.target.value)}
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
                  {filteredAntiBioticMaster.length === 0 && (
                    <tr>
                      <td
                        colSpan={HistoImmunoAntibioticMasterTableHeader.length}
                        className="table-empty"
                      >
                        No records found
                      </td>
                    </tr>
                  )}

                  {filteredAntiBioticMaster.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>

                      <td className="table-td">{item?.antibioticName || "-"}</td>

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
      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default HistoImmunoAntibioticMaster;
