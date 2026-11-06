import Animation from "@/components/animation";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import InputFieldModal from "@/components/inputFieldModal";
import { ENDPOINTS } from "@/config/defaults";
import { InvestigationCommentTableHeaderOfLabMaster } from "@/constants/constants";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { allowOnlyText } from "@/utils/inputValidationHandler";
import {
  InvestigationCommentFormData,
  investigationCommentSchema,
} from "@/validation/labMasterSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { InvestigationCommentItem, InvestigationItem } from "../types";

type ServiceItem = {
  serviceItemId: number;
  name: string;
};

type ServiceItemResponse = {
  result?: boolean;
  message?: string;
  data?: ServiceItem[];
};

const InvestigationComment = () => {
  const { loading, fetchApi } = useGlobalApi();
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestId = useRef(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [investigationValue, setInvestigationValue] = useState<InvestigationItem | null>(null);
  const [serviceNameList, setServiceNameList] = useState<ServiceItem[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);

  const [showDetails, setShowDetails] = useState<boolean>(false);

  const [investigationCommentList, setInvestigationCommentList] = useState<
    InvestigationCommentItem[]
  >([]);

  const [filteredList, setFilteredList] = useState<InvestigationCommentItem[]>([]);

  const {
    reset,
    handleSubmit,
    formState: { errors },
    register,
    watch,
  } = useForm({
    resolver: yupResolver(investigationCommentSchema),
    defaultValues: {
      id: 0,
      investigationId: 0,
      commentName: "",
      commentValue: "",
      isActive: 1,
    },
  });

  const isEdit = Boolean(watch("id"));
  const buttonTitle = isEdit ? "Update" : "Create";

  useEffect(() => {
    reset({
      id: 0,
      investigationId: investigationValue?.serviceItemId ?? 0,
      investigationName: investigationValue?.name,
      commentName: "",
      commentValue: "",
      isActive: 1,
    });
  }, [investigationValue?.serviceItemId, reset]);

  useEffect(
    () => () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchRequestId.current += 1;
    },
    []
  );

  const serviceItemHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setInvestigationValue(null);
    setActiveServiceIndex(0);

    if (searchTimer.current) clearTimeout(searchTimer.current);
    const requestId = ++searchRequestId.current;
    if (value.trim().length < 2) {
      setServiceNameList([]);
      setShowPopup(false);
      return;
    }

    searchTimer.current = setTimeout(async () => {
      try {
        const response = await fetchApi<ServiceItemResponse>(
          "GET",
          ENDPOINTS.GET_SERVICE_ITEM_LIST,
          {},
          { params: { categoryTypeId: 3, isActive: 1, serviceName: value.trim() } },
          { component: "InvestigationComment", throwOnError: true }
        );
        if (requestId !== searchRequestId.current) return;
        if (response?.result === false) {
          showWarning(response.message ?? "Unable to search investigations");
          setServiceNameList([]);
          setShowPopup(false);
          return;
        }

        const items = response?.data ?? [];
        setServiceNameList(items);
        setShowPopup(items.length > 0);
      } catch (error) {
        if (requestId !== searchRequestId.current) return;
        showError(error instanceof Error ? error.message : "Unable to search investigations");
        setServiceNameList([]);
        setShowPopup(false);
      }
    }, 300);
  };

  const selectedServiceHandler = (item: ServiceItem) => {
    console.log("item", item);
    setSearchTerm("");
    setInvestigationValue(item);
    setServiceNameList([]);
    setShowPopup(false);
  };

  const serviceInputKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showPopup || serviceNameList.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveServiceIndex(index => (index + 1) % serviceNameList.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveServiceIndex(index => (index - 1 + serviceNameList.length) % serviceNameList.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selectedService = serviceNameList[activeServiceIndex];
      if (selectedService) selectedServiceHandler(selectedService);
    } else if (event.key === "Escape") {
      setShowPopup(false);
    }
  };

  //   submit handler
  const onSubmit = async (formData: InvestigationCommentFormData) => {
    console.log("formData", formData);
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_INVESTIGATION_RESULT_ENTRY_COMMENT,
      formData,
      {},
      { component: "InvestigationComment" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Error while saving investigation comment");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    await getAllInvestigationComment();
  };

  const tablePopupHandler = () => {
    setShowDetails(p => !p);
  };

  //   get all investigation comment
  const getAllInvestigationComment = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_RESULT_ENTRY_COMMENT_MASTER,
      {},
      {},
      { component: "InvestigationComment" }
    );
    setInvestigationCommentList(resp?.data ?? []);
    setFilteredList(resp?.data ?? []);
  };

  useEffect(() => {
    getAllInvestigationComment();
  }, []);

  //   search handler
  const searchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toLowerCase();
    if (!value) {
      setFilteredList(investigationCommentList);
      return;
    }
    const filteredData =
      investigationCommentList?.filter(f => f?.InvestigationName.toLowerCase().includes(value)) ??
      [];
    setFilteredList(filteredData);
  };

  //   edit handler
  const editHandler = (row: InvestigationCommentItem) => {
    if (!row) return;
    reset({
      id: row?.Id,
      investigationId: row?.InvestigationId,
      investigationName: row?.InvestigationName,
      commentName: row?.CommentName,
      commentValue: row?.CommentValue,
      isActive: row?.IsActive,
    });
  };

  //   cancel handler
  const cancelHandler = () => {
    reset({
      id: 0,
      investigationId: 0,
      commentName: "",
      commentValue: "",
      isActive: 1,
    });
  };

  return (
    <div className="-mt-3">
      <div className="card mb-1">
        <form className="form-grid-4" onSubmit={handleSubmit(onSubmit)}>
          <InputField label="Search Services" className="relative w-full">
            <input
              type="text"
              className="input-field input-field-search-right"
              placeholder="Type to search services"
              value={searchTerm}
              onChange={serviceItemHandler}
              onKeyDown={serviceInputKeyDownHandler}
            />

            <InputFieldModal
              showPopup={showPopup}
              data={serviceNameList}
              activeIndex={activeServiceIndex}
              setActiveIndex={setActiveServiceIndex}
              onSelect={selectedServiceHandler}
              getLabel={item => item.name}
              className="-mt-5"
            />
          </InputField>
          <InputField label="Investigation">
            <input
              className="input-field"
              value={investigationValue?.name}
              readOnly
              {...register("investigationName")}
            />

            {errors.investigationName && (
              <p className="input-field-error">{errors.investigationName.message}</p>
            )}
          </InputField>
          <InputField label="Comment Name">
            <input
              className="input-field"
              type="text"
              onInput={allowOnlyText}
              {...register("commentName")}
            />
            {errors.commentName && (
              <p className="input-field-error">{errors.commentName.message}</p>
            )}
          </InputField>
          <InputField label="Comment Value">
            <input
              className="input-field"
              type="text"
              onInput={allowOnlyText}
              {...register("commentValue")}
            />
            {errors.commentValue && (
              <p className="input-field-error">{errors.commentValue.message}</p>
            )}
          </InputField>

          <InputField label="Status">
            <select className="input-field" {...register("isActive", { valueAsNumber: true })}>
              <option value="">Select</option>
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>

            {errors.isActive && <p className="input-field-error">{errors.isActive.message}</p>}
          </InputField>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full lg:col-start-4 mt-4">
            <button type="submit" className="save-btn">
              {buttonTitle}
            </button>
            <button className="cancel-button" type="button" onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Investigation Comment List</h2>

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
                      {InvestigationCommentTableHeaderOfLabMaster.map((h, index) => (
                        <th key={index} className="table-th align-top ">
                          {h === "Investigation Name" ? (
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
                        <td
                          colSpan={InvestigationCommentTableHeaderOfLabMaster.length}
                          className="table-empty"
                        >
                          No records found
                        </td>
                      </tr>
                    )}

                    {filteredList.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="table-td">{idx + 1}</td>

                        <td className="table-td">{item?.InvestigationName || "-"}</td>
                        <td className="table-td">{item?.CommentName || "-"}</td>
                        <td className="table-td">{item?.CommentValue || "-"}</td>
                        <td
                          className={`table-td ${
                            Number(item?.IsActive) === 1 ? "active-text" : "inactive-text"
                          }`}
                        >
                          {Number(item?.IsActive) === 1 ? "Active" : "Inactive"}
                        </td>

                        <td className="table-td">{item?.CreatedBy || "-"}</td>
                        <td className="table-td">{item?.CreatedOn || "-"}</td>
                        <td className="table-td">{item?.LastModifiedBy || "-"}</td>
                        <td className="table-td">{item?.LastModifiedOn || "-"}</td>

                        <td className="table-td" onClick={() => editHandler(item)}>
                          <i className="fa-solid fa-edit icon-color-button" />
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

export default InvestigationComment;
