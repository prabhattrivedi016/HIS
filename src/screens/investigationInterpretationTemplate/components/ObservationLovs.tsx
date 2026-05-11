import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import { CATEGORY_ID, Status } from "@/constants/constants";
import { ObservationCommentLovsTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { showSuccess, showWarning } from "@/utils/alert";
import {
  ObservationLovsFormData,
  observationLovsSchema,
} from "@/validation/investigationInterpretationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import {
  CommentListItem,
  LovLists,
  ObservationCommentItem,
  ObservationItem,
  SelectItem,
} from "../types";
import LovsPopup from "./LovsPopup";

const ObservationLovs = () => {
  const { loading, fetchApi } = useGlobalApi();

  const getCommentsLists = usePickMaster("CommentsLOVs")?.pickMasterValue ?? [];
  const [observationList, setObservationList] = useState<ObservationItem[]>([]);
  const [selectedObservation, setSelectedObservation] = useState<SelectItem | null>(null);

  const [lovsLists, setLovsLists] = useState<LovLists[]>([]);
  const [commentLists, setCommentsLists] = useState<CommentListItem[]>([]);
  const [selectedLovs, setSelectedLovs] = useState<LovLists | null>(null);

  const [renderLovsPopup, setRenderLovsPopup] = useState<boolean>(false);
  const [openLovsPopup, setOpenLovsPopup] = useState<boolean>(false);

  const [observationCommentList, setObservationCommentList] = useState<ObservationCommentItem[]>(
    []
  );

  const [editableObservationCommentList, setEditableObservationCommentList] = useState<
    ObservationCommentItem[]
  >([]);

  const {
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(observationLovsSchema),
    defaultValues: {
      typeId: 1,
      type: "",
      observationId: 0,
      itemid: 0,
    },
  });
  const selectedTypeId = watch("typeId");
  const selectedItemId = Number(watch("itemid") || 0);
  const selectedObservationId = Number(watch("observationId") || 0);

  // observation master
  const getObservationMasterList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OBSERVATION_MASTER,
      {},
      { params: { isActive: Status?.ACTIVE } },
      { component: "ObservationLovs" }
    );
    setObservationList(resp?.data ?? []);
  };

  const observationOption = useMemo(() => {
    return observationList?.map(o => ({
      label: o?.observationName,
      value: o?.observationId,
    }));
  }, [observationList]);

  const getObservationNameById = useCallback(
    (observationId: number) => {
      const selectedFromList = observationList.find(o => o?.observationId === observationId);
      if (selectedFromList?.observationName) return selectedFromList.observationName;
      return selectedObservation?.value === observationId ? selectedObservation?.label : "";
    },
    [observationList, selectedObservation]
  );

  useEffect(() => {
    const defaultTemplate = getCommentsLists?.find(t => Number(t?.key) === Status?.ACTIVE);
    setValue("type", defaultTemplate?.value ?? "", { shouldDirty: false });
    setValue("typeId", Number(defaultTemplate?.key) || 1, { shouldDirty: false });
    getObservationMasterList();
  }, [getCommentsLists]);

  const observationSelectHandler = (option: SelectItem | null) => {
    setSelectedObservation(option);
    const selectedValue = option?.value ?? 0;

    setValue("observationId", selectedValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    if (!selectedValue) {
      setObservationCommentList([]);
      setEditableObservationCommentList([]);
      return;
    }

    if (selectedValue > 0) {
      clearErrors("observationId");
      clearErrors("itemid");
    }
    getObserVationComment(Number(option?.value));
  };

  // all comment values
  const getAllComments = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_INVESTIGATION_TEMPLATE_COMMENTS,
      {},
      { params: { isActive: Status?.ACTIVE, typeId: CATEGORY_ID?.categoryId } }
    );
    setCommentsLists(resp?.data ?? []);
  };

  // lovs lists
  const getLovsList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OBSERVATION_LIST_OF_VALUES_MASTER,
      {},
      {},
      { component: "ObservationLovs" }
    );
    setLovsLists(resp?.data ?? []);
  };
  useEffect(() => {
    if (selectedTypeId === 2) {
      getLovsList();
    }
    getAllComments();
  }, [selectedTypeId]);

  //   submit handler
  const onsubmit = async (formData: ObservationLovsFormData) => {
    if (!formData) return;
    const payload =
      selectedTypeId === 1
        ? [
            {
              ...formData,
            },
          ]
        : editableObservationCommentList.map(row => ({
            TypeId: row?.TypeId,
            Type: row?.Type,
            ObservationId: row?.ObservationId,
            ItemId: row?.ItemId,
          }));

    if (!payload) return;
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_OBSERVATION_COMMENTS_LOVS_MAPPINGS,
      payload,
      {},
      { component: "ObservationLovs" }
    );
    if (!resp?.result) {
      showWarning(resp?.message ?? "Something went wrong");
      return;
    }
    showSuccess(resp?.message ?? "Data saved successfully");
    const defaultTemplate = getCommentsLists?.find(t => Number(t?.key) === Status?.ACTIVE);
    reset({
      typeId: Number(defaultTemplate?.key) || 1,
      type: defaultTemplate?.value ?? "",
      observationId: 0,
      itemid: 0,
    });
    setSelectedObservation(null);
    setSelectedLovs(null);
    setObservationCommentList([]);
    setEditableObservationCommentList([]);

    clearErrors();
  };

  // cancel handler
  const cancelHandler = () => {
    const defaultTemplate = getCommentsLists?.find(t => Number(t?.key) === Status?.ACTIVE);
    reset({
      typeId: Number(defaultTemplate?.key) || 1,
      type: defaultTemplate?.value ?? "",
      observationId: 0,
      itemid: 0,
    });
    setSelectedObservation(null);
    clearErrors();
  };

  // mapping type  change handler
  const mappingTypeChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) return;
    const selected = getCommentsLists?.find(t => Number(t?.key) === value);
    setValue("type", selected?.value ?? "", { shouldDirty: true, shouldTouch: true });
    setValue("typeId", Number(selected?.key) || 1, { shouldDirty: true, shouldTouch: true });
    setValue("observationId", 0, { shouldDirty: true, shouldTouch: true });
    setValue("itemid", 0, { shouldDirty: true, shouldTouch: true });
    clearErrors(["type", "typeId"]);
    clearErrors("itemid");
    setSelectedObservation(null);
    setSelectedLovs(null);
    setObservationCommentList([]);
    setEditableObservationCommentList([]);
  };

  // lovs select handler
  const lovsSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) {
      setSelectedLovs(null);
      setValue("itemid", 0, { shouldDirty: true, shouldTouch: true });
      clearErrors("itemid");

      if (selectedObservationId > 0) {
        setEditableObservationCommentList(prev =>
          prev.filter(row => Number(row?.ObservationId) !== selectedObservationId)
        );
      }
      return;
    }
    const selected = lovsLists?.find(l => l?.LOVId === value);
    const isDuplicateForObservation = editableObservationCommentList.some(
      row => Number(row?.ObservationId) === selectedObservationId && Number(row?.ItemId) === value
    );

    if (isDuplicateForObservation) {
      setError("itemid", {
        type: "manual",
        message: "This LOV is already selected",
      });
      return;
    }

    setSelectedLovs(selected!);
    setValue("itemid", value, { shouldDirty: true, shouldTouch: true });
    clearErrors("itemid");

    if (selectedObservationId > 0 && selected) {
      const mappedRow: ObservationCommentItem = {
        TypeId: Number(selectedTypeId) || 0,
        Type: Number(selectedTypeId) === Status?.ACTIVE ? "Comments" : "LOVs",
        ObservationId: selectedObservationId,
        ItemId: selected.LOVId,
        Name: selected.LOVName,
        observationName: getObservationNameById(selectedObservationId) || "-",
      };

      setEditableObservationCommentList(prev => [...prev, mappedRow]);
    }
  };
  // lovs popup handler
  const lovsPopupHandler = () => {
    if (!selectedLovs) {
      setSelectedLovs(null);
      setRenderLovsPopup(true);
      setOpenLovsPopup(true);
    } else {
      setSelectedLovs(selectedLovs);
      setRenderLovsPopup(true);
      setOpenLovsPopup(true);
    }
  };

  // close lovs handler
  const closeLovsHandler = useCallback(() => {
    setOpenLovsPopup(false);
    setTimeout(() => {
      setRenderLovsPopup(false);
    }, 200);
  }, []);

  // delete mapping row from local editable/grid state
  const deleteHandler = (item: ObservationCommentItem) => {
    if (!item) return;

    setEditableObservationCommentList(prev =>
      prev.filter(
        row =>
          !(
            Number(row?.ObservationId) === Number(item?.ObservationId) &&
            Number(row?.ItemId) === Number(item?.ItemId)
          )
      )
    );

    setObservationCommentList(prev =>
      prev.filter(
        row =>
          !(
            Number(row?.ObservationId) === Number(item?.ObservationId) &&
            Number(row?.ItemId) === Number(item?.ItemId)
          )
      )
    );

    if (Number(selectedItemId) === Number(item?.ItemId)) {
      setSelectedLovs(null);
      setValue("itemid", 0, { shouldDirty: true, shouldTouch: true });
      clearErrors("itemid");
    }
  };

  // Keep selected LOV details synced with latest LOV list (after popup create/update).
  useEffect(() => {
    if (selectedTypeId !== 2) return;

    if (!selectedItemId) {
      setSelectedLovs(null);
      return;
    }

    const latest = lovsLists.find(l => l?.LOVId === selectedItemId) ?? null;
    if (!latest) {
      setSelectedLovs(null);
      setValue("itemid", 0, { shouldDirty: true, shouldTouch: true });
      return;
    }

    setSelectedLovs(latest);
  }, [lovsLists, selectedItemId, selectedTypeId, setValue]);

  // observation comment lov
  const getObserVationComment = async (observationId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OBSERVATION_COMMENT_LOVS_MAPPINGS,
      {},
      { params: { observationId } },
      { component: "ObservationLovs" }
    );

    const apiData = resp?.data ?? [];
    const observationName = getObservationNameById(observationId) || "-";
    const editedList = apiData?.map((C: ObservationCommentItem) => ({
      ...C,
      observationName: observationName,
    }));
    setObservationCommentList(apiData);
    setEditableObservationCommentList(editedList);
  };
  return (
    <div className="mt-1">
      <div className="card mb-1">
        <h2 className="card-title ">Observation Comment/Lovs</h2>
        {/* form */}
        <form onSubmit={handleSubmit(onsubmit)}>
          <div className="form-grid-4">
            <InputField label="Mapping Type" required>
              <select
                className="input-field"
                value={selectedTypeId ?? 1}
                onChange={mappingTypeChangeHandler}
              >
                {getCommentsLists.map(t => (
                  <option key={t?.key} value={t?.key}>
                    {t?.value}
                  </option>
                ))}
              </select>
              {errors.type && <p className="input-field-error">{errors.type.message}</p>}
            </InputField>

            <InputField label="Observation" required>
              <Select
                value={selectedObservation}
                options={observationOption}
                placeholder="Select observation"
                isSearchable
                isClearable
                onChange={(option: any) => observationSelectHandler(option)}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              {errors.observationId && (
                <p className="input-field-error">{errors.observationId.message}</p>
              )}
            </InputField>

            {!!selectedTypeId && selectedTypeId === Status?.ACTIVE ? (
              <InputField label="Comments">
                <select className="input-field" {...register("itemid")}>
                  <option value={0}>Select</option>
                  {commentLists.map(c => (
                    <option key={c?.Id} value={c?.Id}>
                      {c?.Name}
                    </option>
                  ))}
                </select>
              </InputField>
            ) : (
              <InputField label="List of Values">
                <div className="flex gap-2 items-center">
                  <select
                    className="input-field"
                    {...register("itemid")}
                    onChange={lovsSelectHandler}
                    value={selectedItemId}
                  >
                    <option value={0}>Select</option>
                    {lovsLists.map(t => (
                      <option key={t?.LOVId} value={t?.LOVId}>
                        {t?.LOVName}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={lovsPopupHandler} className="-mt-2">
                    <i className="fa-solid fa-circle-plus fa-xl active:scale-95 "></i>
                  </button>
                </div>
                {errors.itemid && <p className="input-field-error">{errors.itemid.message}</p>}
              </InputField>
            )}
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="submit" className="save-btn">
              {"Save"}
            </button>
            <button type="button" className="cancel-button " onClick={cancelHandler}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* table */}

      {!!selectedTypeId && selectedTypeId !== Status?.ACTIVE ? (
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
                  {editableObservationCommentList?.length === 0 && (
                    <tr>
                      <td
                        colSpan={ObservationCommentLovsTableHeader.length}
                        className="table-empty"
                      >
                        No records found
                      </td>
                    </tr>
                  )}

                  {editableObservationCommentList.map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>

                      <td className="table-td">{item?.observationName || "-"}</td>

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

      {!!renderLovsPopup && (
        <LovsPopup
          isOpen={openLovsPopup}
          onClose={closeLovsHandler}
          lovId={selectedLovs?.LOVId ?? 0}
          lovName={selectedLovs?.LOVName ?? ""}
          onSaved={getLovsList}
        />
      )}
    </div>
  );
};

export default ObservationLovs;
