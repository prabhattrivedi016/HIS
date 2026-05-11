import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import { CATEGORY_ID, Status } from "@/constants/constants";
import { ObservationCommentLovsTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { showSuccess, showWarning } from "@/utils/alert";
import {
  investigationInterpretationFormData,
  investigationInterpretationSchema,
} from "@/validation/investigationInterpretationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  InvestigationInterpretationMappingItem,
  InvestigationNameItem,
  TemplateItem,
} from "../types";

const InvestigationInterpretation = () => {
  const { loading, fetchApi } = useGlobalApi();
  const mappingValues = usePickMaster("TemplateInterpretationComment")?.pickMasterValue ?? [];
  const [investigationNameList, setInvestigationNameList] = useState<InvestigationNameItem[]>([]);
  const [allTemplateList, setAllTemplateList] = useState<TemplateItem[]>([]);
  const [editableInvestigationMappingList, setEditableInvestigationMappingList] = useState<
    InvestigationInterpretationMappingItem[]
  >([]);
  const [selectedInvestigationName, setSelectedInvestigationName] = useState<string>("");
  const [searchInvestigationText, setSearchInvestigationText] = useState<string>("");

  const [templateInterpretationList, setTemplateInterpretationList] = useState<
    InvestigationInterpretationMappingItem[]
  >([]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // memoized list to prevent infinite rerenders
  const mappingLists = useMemo(() => {
    return mappingValues.filter(l => Number(l?.key) !== 3);
  }, [mappingValues]);

  const { setValue, clearErrors, watch, register, reset, handleSubmit, setError } = useForm({
    resolver: yupResolver(investigationInterpretationSchema),
    defaultValues: {
      typeId: 1,
      type: "",
      investigationId: 0,
      itemid: 0,
    },
  });

  const selectedTypeId = watch("typeId");
  const selectedInvestigationId = Number(watch("investigationId") || 0);
  const selectedItemId = Number(watch("itemid") || 0);

  // set default dropdown value
  useEffect(() => {
    if (!mappingLists.length) return;

    const defaultTemplate = mappingLists.find(t => Number(t?.key) === Status?.ACTIVE);

    if (!defaultTemplate) return;

    setValue("type", defaultTemplate?.value ?? "", {
      shouldDirty: false,
    });

    setValue("typeId", Number(defaultTemplate?.key) || 1, {
      shouldDirty: false,
    });
    setEditableInvestigationMappingList([]);
    setSelectedInvestigationName("");
    setSearchInvestigationText("");
  }, [mappingLists, setValue]);

  // dropdown change handler
  const templateNameChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);

    if (!value) return;

    const selected = mappingLists.find(t => Number(t?.key) === value);

    setValue("type", selected?.value ?? "", {
      shouldDirty: true,
      shouldTouch: true,
    });

    setValue("typeId", Number(selected?.key) || 1, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("investigationId", 0, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("itemid", 0, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setSelectedInvestigationName("");
    setSearchInvestigationText("");
    setEditableInvestigationMappingList([]);

    clearErrors(["type", "typeId"]);
  };

  // get all template name
  const getAllTemplate = async (value: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_INVESTIGATION_TEMPLATE_COMMENTS,
      {},
      {
        params: { isActive: Status?.ACTIVE, typeId: value === "template" ? Status?.ACTIVE : 2 },
      },
      { component: "InvestigationInterpretation" }
    );
    console.log("resp", resp?.data);
    setAllTemplateList(resp?.data ?? []);
  };

  useEffect(() => {
    if (selectedTypeId === Status?.ACTIVE) {
      getAllTemplate("template");
    } else {
      getAllTemplate("interpretation");
    }
  }, [selectedTypeId]);

  // get all investigation name
  const getAllInvestigation = async (serviceName: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_SERVICE_ITEM_LIST,
      {},
      {
        params: {
          categoryId: CATEGORY_ID?.categoryId,
          reportTypeId: selectedTypeId === 1 ? 2 : 1,
          isActive: Status?.ACTIVE,
          serviceName,
        },
      },
      { component: "InvestigationInterpretation" }
    );
    setInvestigationNameList(resp?.data ?? []);
  };
  // investigation search handler
  const searchInvestigationHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInvestigationText(value);
    const searchValue = value.trim();

    // clear previous timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      getAllInvestigation(searchValue);
    }, 1000);
  };

  // submit handler
  const onSubmit = async (formData: investigationInterpretationFormData) => {
    const payload =
      selectedTypeId === Status?.ACTIVE
        ? editableInvestigationMappingList.map(row => ({
            TypeId: row?.TypeId,
            Type: row?.Type,
            InvestigationId: row?.InvestigationId,
            ItemId: row?.ItemId,
          }))
        : [{ ...formData }];

    if (!payload?.length) return;

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_INVESTIGATION_TEMPLATE_INTERPRETATION_MAPPING,
      payload,
      {},
      { component: "InvestigationInterpretation" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "Something went wrong");
      return;
    }

    showSuccess(resp?.message ?? "Data saved successfully");
    const defaultTemplate = mappingLists.find(t => Number(t?.key) === Status?.ACTIVE);
    reset({
      typeId: Number(defaultTemplate?.key) || 1,
      type: defaultTemplate?.value ?? "",
      investigationId: 0,
      itemid: 0,
    });
    setSelectedInvestigationName("");
    setSearchInvestigationText("");
    setEditableInvestigationMappingList([]);
    clearErrors();
  };

  const templateInterpretationChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);

    setValue("itemid", value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    if (!value) {
      clearErrors("itemid");
      return;
    }

    if (!selectedInvestigationId) {
      setError("investigationId", {
        type: "manual",
        message: "Investigation name is required",
      });
      return;
    }

    const selectedItem = allTemplateList.find(t => Number(t?.Id) === value);
    if (!selectedItem) return;

    const isDuplicate = editableInvestigationMappingList.some(
      row =>
        Number(row?.InvestigationId) === selectedInvestigationId && Number(row?.ItemId) === value
    );

    if (isDuplicate) {
      setError("itemid", {
        type: "manual",
        message: "This template name is already added for the same investigation",
      });
      return;
    }

    const mappedRow: InvestigationInterpretationMappingItem = {
      TypeId: Number(selectedTypeId) || 0,
      Type: Number(selectedTypeId) === Status?.ACTIVE ? "Template" : "Interpretation",
      InvestigationId: selectedInvestigationId,
      ItemId: selectedItem?.Id,
      Name: selectedItem?.Name,
      investigationName: selectedInvestigationName || "-",
    };

    setEditableInvestigationMappingList(prev => [...prev, mappedRow]);
    clearErrors("itemid");
  };

  // delete handler
  const deleteHandler = (item: InvestigationInterpretationMappingItem) => {
    if (!item) return;

    setEditableInvestigationMappingList(prev =>
      prev.filter(
        row =>
          !(
            Number(row?.InvestigationId) === Number(item?.InvestigationId) &&
            Number(row?.ItemId) === Number(item?.ItemId)
          )
      )
    );

    if (Number(selectedItemId) === Number(item?.ItemId)) {
      setValue("itemid", 0, { shouldDirty: true, shouldTouch: true });
      clearErrors("itemid");
    }
  };

  // cancel handler
  const cancelHandler = () => {
    const defaultTemplate = mappingLists.find(t => Number(t?.key) === Status?.ACTIVE);
    reset({
      typeId: Number(defaultTemplate?.key) || 1,
      type: defaultTemplate?.value ?? "",
      investigationId: 0,
      itemid: 0,
    });
    setSelectedInvestigationName("");
    setSearchInvestigationText("");
    setEditableInvestigationMappingList([]);
    clearErrors();
  };

  // investigation select handler
  const investigationSelectHandler = async (item: InvestigationNameItem) => {
    if (!item) return;
    setValue("investigationId", item?.serviceItemId);
    setSelectedInvestigationName(item?.name ?? "");
    setSearchInvestigationText(item?.name ?? "");
    setInvestigationNameList([]);

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_TEMPLATE_INTERPRETATION_MAPPINGS,
      {},
      { params: { investigationId: item?.serviceItemId } },
      { component: "InvestigationInterpretation" }
    );
    const responseData = resp?.data ?? [];
    const normalizedList: InvestigationInterpretationMappingItem[] = responseData.map(
      (row: InvestigationInterpretationMappingItem) => ({
        ...row,
        investigationName: item?.name ?? row?.investigationName ?? "-",
      })
    );
    setTemplateInterpretationList(normalizedList);
    setEditableInvestigationMappingList(normalizedList);
  };

  return (
    <div className="mt-1">
      <div className="card mb-1">
        <h2 className="card-title">Investigation Template/ Interpretation</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-4">
            {/* Mapping Type */}
            <InputField label="Mapping Type" required>
              <select
                className="input-field"
                value={selectedTypeId ?? ""}
                onChange={templateNameChangeHandler}
              >
                {mappingLists.map(t => (
                  <option key={t?.key} value={t?.key}>
                    {t?.value}
                  </option>
                ))}
              </select>
            </InputField>

            {/* Search Investigation */}
            <InputField label="Search investigation">
              <div className="relative w-full">
                <input
                  className="input-field w-full"
                  placeholder="search investigation name"
                  value={searchInvestigationText}
                  onChange={searchInvestigationHandler}
                />
                {/* popup list - renders immediately when list has items */}
                {investigationNameList.length > 0 && (
                  <div className="input-popup-bg">
                    {investigationNameList.map(item => (
                      <div
                        key={item?.serviceItemId}
                        className="input-popup-row"
                        // onClick={() => {
                        //   setValue("investigationId", item?.serviceItemId);
                        //   setSelectedInvestigationName(item?.name ?? "");
                        //   setSearchInvestigationText(item?.name ?? "");
                        //   setInvestigationNameList([]);
                        // }}
                        onClick={() => investigationSelectHandler(item)}
                      >
                        {item?.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </InputField>

            {/* Investigation Name */}
            <InputField label="Investigation Name">
              <input
                className="input-field"
                placeholder="Enter investigation name"
                value={selectedInvestigationName}
                readOnly
              />
            </InputField>

            {/* Template Name */}

            {!!selectedTypeId && selectedTypeId === Status?.ACTIVE ? (
              <InputField label="Template Name">
                <select
                  className="input-field"
                  {...register("itemid")}
                  value={selectedItemId}
                  onChange={templateInterpretationChangeHandler}
                >
                  <option value={0}>Select</option>
                  {allTemplateList?.map(t => (
                    <option key={t?.Id} value={t?.Id}>
                      {t?.Name}
                    </option>
                  ))}
                </select>
              </InputField>
            ) : (
              <InputField label="Interpretation Name">
                <select className="input-field" {...register("itemid")}>
                  <option value={0}>Select</option>
                  {allTemplateList?.map(t => (
                    <option key={t?.Id} value={t?.Id}>
                      {t?.Name}
                    </option>
                  ))}
                </select>
              </InputField>
            )}
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              Save
            </button>

            <button type="button" className="cancel-button" onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* table */}
      {!!selectedTypeId && selectedTypeId === Status?.ACTIVE ? (
        <div className="table-container ">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-58 lg:max-h-58 ">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {ObservationCommentLovsTableHeader.map((h, index) => (
                      <th key={index} className="table-th ">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {editableInvestigationMappingList?.length === 0 && (
                    <tr>
                      <td
                        colSpan={ObservationCommentLovsTableHeader.length}
                        className="table-empty"
                      >
                        No records found
                      </td>
                    </tr>
                  )}

                  {editableInvestigationMappingList.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>

                      <td className="table-td">{item?.investigationName || "-"}</td>

                      <td className="table-td">{item?.Name || "-"}</td>

                      <td className="table-td" onClick={() => deleteHandler(item)}>
                        <i className="fa-solid fa-trash icon-color-delete" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default InvestigationInterpretation;
