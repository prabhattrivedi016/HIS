import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { SpecimenMasterTableHeader } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { SpecimenMasterFormItem, specimenMasterSchema } from "@/validation/histoReportMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../../../components/customInputField";
import { SpecimenMasterItem } from "../types";

const SpecimenMaster = () => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState<string>("");
  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(specimenMasterSchema),
    defaultValues: {
      id: 0,
      specimenName: "",
      isActive: 1,
    },
  });

  const isEdit = Boolean(watch("id"));
  const buttonTitle = isEdit ? "Update" : "Create";

  // get all specimen master list
  const getSpecimenMasterList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SPECIMEN_MASTER,
      {},
      {},
      { component: "SpecimenMaster" }
    );
    return resp?.data ?? [];
  };

  const { data: specimenMasterList = [] } = useQuery<SpecimenMasterItem[]>({
    queryKey: ["specimenMaster"],
    queryFn: () => getSpecimenMasterList(),
    staleTime: 10000,
  });

  // filter handler
  const filteredSpecimenMaster = useMemo(() => {
    if (!searchValue.trim()) return specimenMasterList;

    return specimenMasterList.filter(item =>
      item.specimenName.toLowerCase().includes(searchValue.trim().toLowerCase())
    );
  }, [searchValue, specimenMasterList]);

  const createUpadateSpecimenMaster = async (data: SpecimenMasterFormItem) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_SPECIMEN_MASTER,
      data,
      {},
      { component: "SpecimenMaster" }
    );
    return resp;
  };

  // create mutation
  const submitHandler = useMutation({
    mutationKey: ["createUpdateSpecimenMaster"],
    mutationFn: createUpadateSpecimenMaster,

    onSuccess: resp => {
      showSuccess(resp?.message ?? "Data saved successfully");

      queryClient.invalidateQueries({
        queryKey: ["specimenMaster"],
      });

      // reset form
      reset({
        id: 0,
        specimenName: "",
        isActive: 1,
      });
    },

    onError: (resp: any) => {
      showWarning(resp?.message ?? "Something went wrong");
    },
  });

  // submit handler
  const onSubmit = (data: SpecimenMasterFormItem) => {
    submitHandler.mutate(data);
  };

  // edit handler
  const editHandler = (item: SpecimenMasterItem) => {
    reset({
      id: item.id ?? 0,
      specimenName: item.specimenName ?? "",
      isActive: item.isActive ?? 1,
    });
  };

  // cancel handler
  const cancelHandler = () => {
    reset({
      id: 0,
      specimenName: "",
      isActive: 1,
    });
    setSearchValue("");
  };

  return (
    <div className="mt-1">
      {/* form data */}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card mb-1">
          <div className="form-grid-4">
            <InputField label="Specimen Name" required>
              <input
                className="input-field"
                placeholder="Enter specimen name"
                {...register("specimenName")}
              />
              {errors.specimenName && (
                <p className="input-field-error">{errors.specimenName.message}</p>
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
            <button type="button" className="cancel-button" onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* table data */}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Specimen Master List</h2>
        </div>

        <div className="table-container ">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-72 lg:max-h-72 ">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {SpecimenMasterTableHeader.map((h, index) => (
                      <th key={index} className="table-th align-top ">
                        {h === "Specimen Name" ? (
                          <div className="flex flex-col  ">
                            <h2>{h}</h2>
                            <input
                              type="text"
                              className="input-field lg:max-w-35 lg:max-h-7 mt-1 "
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
                  {filteredSpecimenMaster.length === 0 && (
                    <tr>
                      <td colSpan={SpecimenMasterTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {filteredSpecimenMaster.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>

                      <td className="table-td">{item?.specimenName || "-"}</td>

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

export default SpecimenMaster;
