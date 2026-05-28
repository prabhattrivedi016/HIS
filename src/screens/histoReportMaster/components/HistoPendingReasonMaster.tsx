import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { HistoPendingReasonMasterTableHeader } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess, showWarning } from "@/utils/alert";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "../../../components/customInputField";
import { HistoPendingReasonMasterFormItem, histoPendingReasonMasterSchema } from "../../../validation/histoReportMasterSchema";
import { HistoPendingReasonMasterItem } from "../types";

const HistoPendingReasonMaster = () => {
  const{loading,fetchApi}=useGlobalApi();
  const queryClient=useQueryClient();
  

  const [searchValue,setSearchValue] = useState<string>("")
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(histoPendingReasonMasterSchema),
    defaultValues: {
      id: 0,
      pendingReason: "",
      isActive: 1,
    },
  });

  const isEdit=Boolean(watch("id"));
  const buttonTitle=isEdit ? "Update" : "Save";

  // get pending reason list 
  const getPendingReasonList=async()=>{
    const resp=await fetchApi("GET",ENDPOINTS.GET_HISTO_PENDING_REASON_MASTER,{},{},{component:"HistoPendingReasonMaster"})
    return resp?.data ?? [];
  }

  const {isLoading,data:pendingReasonList =[]}=useQuery<HistoPendingReasonMasterItem []>({
    queryKey:["pendingReasonList"],
    queryFn:getPendingReasonList,
    staleTime:10000,

  });


  // filter handler
  const filteredPendingReason = useMemo(() => {
    if (!searchValue.trim()) return pendingReasonList;
  
    return pendingReasonList.filter((item) =>
      item.pendingReason
        .toLowerCase()
        .includes(searchValue.trim().toLowerCase())
    );
  }, [searchValue, pendingReasonList]); 

  const createUpdateHistoPendingReasons=async(data:HistoPendingReasonMasterFormItem)=>{
    const resp=await fetchApi("POST",ENDPOINTS.CREATE_UPDATE_HISTO_PENDING_REASON_MASTER,data,{},{component:"HistoPendingReasonMaster"})
    return resp;
  }

  const submitHandler=useMutation({
    mutationKey:["createUpdateHistoPendingReasons"],
    mutationFn:createUpdateHistoPendingReasons,
    onSuccess:(resp)=>{
      showSuccess(resp?.message ?? "Data saved successfully");

      queryClient?.invalidateQueries({
        queryKey:["pendingReasonList"]
      });
      
      reset({
        id:0,
        pendingReason:"",
        isActive:1
      })
    },
    onError:(resp:any)=>{
      showWarning(resp?.message ?? "Something went wrong");
    }
  })

  // submit  handler
  const onSubmit=(data:HistoPendingReasonMasterFormItem)=>{
    submitHandler.mutate(data);
  }


  // edit handler
  const editHandler=(item:HistoPendingReasonMasterItem)=>{
    reset({
      id:item.id??0,
      pendingReason:item.pendingReason??"",
      isActive:item.isActive??1
    })
  }

  // cancel handler
  const cancelHandler=()=>{
    reset({
      id:0,
      pendingReason:"",
      isActive:1
    })
    setSearchValue("");
  }

  return (
    <div className="mt-1">
      <div className="card mb-1">

        {/* form data */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-4">
            <InputField label="Pending Reason" required>
              < input
                className="input-field"
                placeholder="Enter pending reason"
                {...register("pendingReason")}
              />
              {errors.pendingReason && <p className="input-field-error">{errors.pendingReason.message}</p>}
            </InputField>

            <InputField label="Status" required>
              <select className="input-field">
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </InputField>
          </div>
          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn" disabled={isLoading}>
              {buttonTitle}
            </button>
            <button type="button" className="cancel-button" onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
       
      </div>
       {/* table */}

         <div className="card">
                <div className="card-header">
                  <h2 className="card-title ">Histo Pending Reason Master List</h2>
                </div>
        
                <div className="table-container ">
                  <div className="table-scroll-wrapper">
                    <div className="table-size lg:min-h-72 lg:max-h-72 ">
                      <table className="base-table">
                        <thead className="table-head">
                          <tr>
                            {HistoPendingReasonMasterTableHeader.map((h, index) => (
                              <th key={index} className="table-th align-top ">
                                {h === "Pending Reason" ? (
                                  <div className="flex flex-col  ">
                                    <h2>{h}</h2>
                                    <input
                                      type="text"
                                      className="input-field lg:max-w-35 lg:max-h-7 mt-1 "
                                    onChange={(e) => setSearchValue(e.target.value)}
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
                          {filteredPendingReason.length === 0 && (
                            <tr>
                              <td colSpan={HistoPendingReasonMasterTableHeader.length} className="table-empty">
                                No records found
                              </td>
                            </tr>
                          )}
        
                          {filteredPendingReason.map((item, idx) => (
                            <tr key={idx} className="table-row">
                              <td className="table-td">{idx + 1}</td>
        
                              <td className="table-td">{item?.pendingReason || "-"}</td>
        
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
              {!!loading && <CustomLoader isLoading={loading}/>}
    </div>
  );
};

export default HistoPendingReasonMaster;
