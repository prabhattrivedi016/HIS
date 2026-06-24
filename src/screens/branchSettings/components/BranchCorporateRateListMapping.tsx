import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import MultiCheckboxOption from "@/components/multiSelectCheckBox";
import { ENDPOINTS } from "@/config/defaults";
import { Status } from "@/constants/constants";
import {
  BranchCorporateRateListMappingTableHeader,
  IpdRateListTableHeader,
  OpdRateListTableHeader,
} from "@/constants/tableHeaders";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { BranchItem, SelectItem } from "@/types";
import { showSuccess, showWarning } from "@/utils/alert";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import Select, { GroupBase, MultiValue, StylesConfig } from "react-select";
import { BranchCorporateRateListMappingItem, RateListItem } from "../types";

type SortableRowProps = {
  item: RateListItem;
  onDelete: (id: number) => void;
};

const SortableRow = ({ item, onDelete }: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.rateListId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <td className="table-td">
        <i
          className="fa-solid fa-trash icon-color-delete cursor-pointer"
          onPointerDown={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            onDelete(item.rateListId);
          }}
        />
      </td>
      <td className="table-td">{item?.rateListName || "-"}</td>
    </tr>
  );
};

const parseRateListIds = (value?: string) =>
  (value ?? "")
    .split(",")
    .map(v => Number(v.trim()))
    .filter(v => Number.isFinite(v) && v > 0);

const getMappingBranchId = (item: BranchCorporateRateListMappingItem) =>
  Number(item.BranchId ?? item.branchId ?? 0);

const getMappingCorporateId = (item: BranchCorporateRateListMappingItem) =>
  Number(item.CorporateId ?? item.corporateId ?? 0);

const BranchCorporateRateListMapping = () => {
  const { loading, fetchApi } = useGlobalApi();
  const branches = useGetBranchList()?.branchList?.data ?? [];

  const [corporateList, setCorporateList] = useState<
    Array<{ corporateId: number; corporateName: string }>
  >([]);
  const [selectedBranches, setSelectedBranches] = useState<SelectItem[]>([]);
  const [selectedCorporates, setSelectedCorporates] = useState<SelectItem[]>([]);
  const [mappingList, setMappingList] = useState<BranchCorporateRateListMappingItem[]>([]);

  const [rateMasterList, setRateMasterList] = useState<RateListItem[]>([]);
  const [selectedRate, setSelectedRate] = useState<RateListItem | null>(null);
  const [ipdRateList, setIpdRateList] = useState<RateListItem[]>([]);
  const [opdRateList, setOpdRateList] = useState<RateListItem[]>([]);

  const [isError, setIsError] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [localOpdTableError, setLocalOpdTableError] = useState("");
  const [localIpdTableError, setLocalIpdTableError] = useState("");
  const [rateSelectKey, setRateSelectKey] = useState(0);
  const skipNextAutoLoadRef = useRef(false);

  const branchSelectOptions = useMemo(
    () =>
      branches.map((branch: BranchItem) => ({
        value: branch.branchId,
        label: branch.branchName,
      })),
    [branches]
  );

  const corporateSelectOptions = useMemo(
    () =>
      corporateList.map(corporate => ({
        value: corporate.corporateId,
        label: corporate.corporateName,
      })),
    [corporateList]
  );

  const filteredMappingList = useMemo(() => {
    const branchIds = selectedBranches.map(item => Number(item.value));
    const corporateIds = selectedCorporates.map(item => Number(item.value));

    return mappingList.filter(item => {
      const branchMatch = branchIds.length === 0 || branchIds.includes(getMappingBranchId(item));
      const corporateMatch =
        corporateIds.length === 0 || corporateIds.includes(getMappingCorporateId(item));
      return branchMatch && corporateMatch;
    });
  }, [mappingList, selectedBranches, selectedCorporates]);

  const toRateList = (value?: string) => {
    const idToRate = new Map(rateMasterList.map(item => [item.rateListId, item]));
    return parseRateListIds(value)
      .map(id => idToRate.get(id))
      .filter(Boolean) as RateListItem[];
  };
  // rate list

  const getRateList = async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_RATE_LIST_MASTER);
    setRateMasterList(resp?.data ?? []);
  };

  // corporate list
  const getCorporateList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_MASTER_LIST,
      {},
      { params: { isActive: Status.ACTIVE } },
      { component: "BranchCorporateRateListMapping", silent: true }
    );

    setCorporateList(
      (resp?.data ?? []).map(
        (item: {
          corporateId?: number;
          CorporateId?: number;
          corporateName?: string;
          CorporateName?: string;
        }) => ({
          corporateId: Number(item.corporateId ?? item.CorporateId ?? 0),
          corporateName: String(item.corporateName ?? item.CorporateName ?? ""),
        })
      )
    );
  };

  // branch corporate rate list mapping
  const getBranchCorporateRateListMapping = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BRANCH_CORPORATE_RATE_LIST_MAPPING,
      {},
      {},
      { component: "BranchCorporateRateListMapping" }
    );

    setMappingList(resp?.data ?? []);
  };

  useEffect(() => {
    void getRateList();
    void getCorporateList();
    void getBranchCorporateRateListMapping();
  }, []);

  useEffect(() => {
    if (skipNextAutoLoadRef.current) {
      skipNextAutoLoadRef.current = false;
      return;
    }

    if (
      selectedBranches.length !== 1 ||
      selectedCorporates.length !== 1 ||
      !rateMasterList.length
    ) {
      return;
    }

    const branchId = Number(selectedBranches[0].value);
    const corporateId = Number(selectedCorporates[0].value);
    const match = mappingList.find(
      item => getMappingBranchId(item) === branchId && getMappingCorporateId(item) === corporateId
    );

    if (!match) {
      setOpdRateList([]);
      setIpdRateList([]);
      return;
    }

    setOpdRateList(toRateList(match.RateListIdOPD ?? match.rateListIdOPD));
    setIpdRateList(toRateList(match.RateListIdIPD ?? match.rateListIdIPD));
    setSelectedRate(null);
    setIsDisabled(true);
    setLocalOpdTableError("");
    setLocalIpdTableError("");
  }, [selectedBranches, selectedCorporates, mappingList, rateMasterList]);

  const resetRateListEditor = () => {
    setOpdRateList([]);
    setIpdRateList([]);
    setSelectedRate(null);
    setIsDisabled(true);
    setIsError("");
    setLocalOpdTableError("");
    setLocalIpdTableError("");
    setSelectedCorporates([]);
    setRateSelectKey(prev => prev + 1);
  };

  const rateSelectedHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const rateId = Number(e.target.value);
    if (!rateId) {
      setIsDisabled(true);
      setSelectedRate(null);
      return;
    }

    const rate = rateMasterList.find(r => r.rateListId === rateId);
    if (!rate) return;

    setSelectedRate(rate);
    setIsDisabled(false);
    setIsError("");
  };

  const addToList = (
    list: RateListItem[],
    setList: Dispatch<SetStateAction<RateListItem[]>>,
    isOpd: boolean
  ) => {
    if (!selectedRate) return;

    const exists = list.find(i => i.rateListId === selectedRate.rateListId);
    if (exists) {
      setIsError(`${exists.rateListName} already added`);
      return;
    }

    setList([...list, selectedRate]);
    setIsError("");

    if (isOpd) {
      setLocalOpdTableError("");
    } else {
      setLocalIpdTableError("");
    }
  };

  const handleDrag =
    (list: RateListItem[], setList: Dispatch<SetStateAction<RateListItem[]>>) =>
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = list.findIndex(i => i.rateListId === active.id);
      const newIndex = list.findIndex(i => i.rateListId === over.id);

      setList(arrayMove(list, oldIndex, newIndex));
    };

  const removeItem =
    (setList: Dispatch<SetStateAction<RateListItem[]>>, isOpd: boolean) => (id: number) => {
      setList(prev => prev.filter(i => i.rateListId !== id));

      if (isOpd) {
        setLocalOpdTableError("");
      } else {
        setLocalIpdTableError("");
      }
    };

  const mappingRowClickHandler = (item: BranchCorporateRateListMappingItem) => {
    const branchId = getMappingBranchId(item);
    const corporateId = getMappingCorporateId(item);

    const branchOption = branchSelectOptions.find(option => Number(option.value) === branchId);
    const corporateOption = corporateSelectOptions.find(
      option => Number(option.value) === corporateId
    );

    if (branchOption) {
      setSelectedBranches([branchOption]);
    }
    if (corporateOption) {
      setSelectedCorporates([corporateOption]);
    }

    setOpdRateList(toRateList(item.RateListIdOPD ?? item.rateListIdOPD));
    setIpdRateList(toRateList(item.RateListIdIPD ?? item.rateListIdIPD));
    setSelectedRate(null);
    setIsDisabled(true);
    setLocalOpdTableError("");
    setLocalIpdTableError("");
  };

  const handleSave = async () => {
    if (selectedBranches.length === 0) {
      showWarning("Please select at least one branch");
      return;
    }

    if (selectedCorporates.length === 0) {
      showWarning("Please select at least one corporate");
      return;
    }

    let hasError = false;

    if (opdRateList.length === 0) {
      setLocalOpdTableError("At least one OPD rate list row is required");
      hasError = true;
    } else {
      setLocalOpdTableError("");
    }

    if (ipdRateList.length === 0) {
      setLocalIpdTableError("At least one IPD rate list row is required");
      hasError = true;
    } else {
      setLocalIpdTableError("");
    }

    if (hasError) {
      return;
    }

    const mappingEntry = {
      rateListIdOPD: opdRateList.map(item => item.rateListId).join(","),
      rateListIdIPD: ipdRateList.map(item => item.rateListId).join(","),
    };

    for (const branch of selectedBranches) {
      for (const corporate of selectedCorporates) {
        const payload = {
          branchId: Number(branch.value),
          corporateId: Number(corporate.value),
          mappings: [mappingEntry],
        };
        const resp = await fetchApi(
          "POST",
          ENDPOINTS.SAVE_BRANCH_CORPORATE_RATE_LIST_MAPPING,
          payload,
          {},
          { component: "BranchCorporateRateListMapping" }
        );
        if (!resp?.result) {
          showWarning(resp?.message ?? "Failed to save branch corporate rate list mapping");
          return;
        }
      }
    }

    skipNextAutoLoadRef.current = true;
    resetRateListEditor();
    showSuccess("Data saved successfully");
    await getBranchCorporateRateListMapping();
  };

  return (
    <div className="mt-1">
      <div className="card form-grid-4">
        <InputField label="Branch" required>
          <Select<SelectItem, true, GroupBase<SelectItem>>
            value={selectedBranches}
            isMulti
            options={branchSelectOptions}
            placeholder="Select branch(s)"
            isSearchable
            isClearable
            onChange={(options: MultiValue<SelectItem>) =>
              setSelectedBranches([...(options ?? [])])
            }
            styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
            menuPortalTarget={document.body}
            components={{ Option: MultiCheckboxOption }}
            menuPosition="fixed"
          />
        </InputField>

        <InputField label="Corporate" required>
          <Select<SelectItem, true, GroupBase<SelectItem>>
            value={selectedCorporates}
            isMulti
            options={corporateSelectOptions}
            placeholder="Select corporate(s)"
            isSearchable
            isClearable
            onChange={(options: MultiValue<SelectItem>) =>
              setSelectedCorporates([...(options ?? [])])
            }
            styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
            menuPortalTarget={document.body}
            components={{ Option: MultiCheckboxOption }}
            menuPosition="fixed"
          />
        </InputField>
      </div>
      {/*ipd and opd rate list mapping */}

      <div className="card -mt-3">
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          <div className="w-full lg:w-auto">
            <InputField label="Follow Rate List (IPD & OPD)" required>
              <select
                key={rateSelectKey}
                className="input-field lg:min-w-70 h-[42px]"
                onChange={rateSelectedHandler}
                defaultValue=""
              >
                <option value="">Select</option>
                {rateMasterList.map(rate => (
                  <option key={rate.rateListId} value={rate.rateListId}>
                    {rate.rateListName}
                  </option>
                ))}
              </select>
              <div className="min-h-5">
                <p className="input-field-error text-sm">{isError}</p>
              </div>
            </InputField>
          </div>

          <div className="flex gap-3 w-full lg:w-auto lg:items-end items-center justify-center">
            <button
              type="button"
              className={` h-[42px] flex items-center justify-center mb-8 ${
                isDisabled ? "disabled-btn cursor-not-allowed" : "save-btn"
              }`}
              disabled={isDisabled}
              onClick={() => addToList(opdRateList, setOpdRateList, true)}
            >
              Add to OPD
            </button>
            <button
              type="button"
              className={` h-[42px] flex items-center justify-center mb-8 ${
                isDisabled ? "disabled-btn cursor-not-allowed" : "save-btn"
              }`}
              disabled={isDisabled}
              onClick={() => addToList(ipdRateList, setIpdRateList, false)}
            >
              Add to IPD
            </button>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDrag(opdRateList, setOpdRateList)}
          >
            <SortableContext
              items={opdRateList.map(item => item.rateListId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="table-container">
                <div className="table-scroll-wrapper">
                  <div className="table-size lg:min-h-60 lg:max-h-60 w-full">
                    <table className="base-table">
                      <thead className="table-head">
                        <tr>
                          {OpdRateListTableHeader.map((header, index) => (
                            <th key={index} className="table-th">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {opdRateList.length === 0 && (
                          <tr>
                            <td colSpan={OpdRateListTableHeader.length} className="table-empty">
                              No records found
                            </td>
                          </tr>
                        )}

                        {opdRateList.map(item => (
                          <SortableRow
                            key={item.rateListId}
                            item={item}
                            onDelete={removeItem(setOpdRateList, true)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {!!localOpdTableError && (
                  <p className="input-field-error mt-1">{localOpdTableError}</p>
                )}
              </div>
            </SortableContext>
          </DndContext>

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDrag(ipdRateList, setIpdRateList)}
          >
            <SortableContext
              items={ipdRateList.map(item => item.rateListId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="table-container">
                <div className="table-scroll-wrapper">
                  <div className="table-size lg:min-h-60 lg:max-h-60 w-full">
                    <table className="base-table">
                      <thead className="table-head">
                        <tr>
                          {IpdRateListTableHeader.map((header, index) => (
                            <th key={index} className="table-th">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {ipdRateList.length === 0 && (
                          <tr>
                            <td colSpan={IpdRateListTableHeader.length} className="table-empty">
                              No records found
                            </td>
                          </tr>
                        )}

                        {ipdRateList.map(item => (
                          <SortableRow
                            key={item.rateListId}
                            item={item}
                            onDelete={removeItem(setIpdRateList, false)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {!!localIpdTableError && (
                  <p className="input-field-error mt-1">{localIpdTableError}</p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="form-actions-responsive mt-5">
          <button type="button" className="save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
      {/* table of branch corporate list mapping */}
      <div className="table-container mt-1">
        <div className="table-scroll-wrapper">
          <div className="table-size lg:min-h-60 lg:max-h-60">
            <table className="base-table">
              <thead className="table-head">
                <tr>
                  {BranchCorporateRateListMappingTableHeader.map((header, index) => (
                    <th key={index} className="table-th">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredMappingList.length === 0 && (
                  <tr>
                    <td
                      colSpan={BranchCorporateRateListMappingTableHeader.length}
                      className="table-empty"
                    >
                      No records found
                    </td>
                  </tr>
                )}

                {filteredMappingList.map((item, index) => (
                  <tr
                    key={`${getMappingBranchId(item)}-${getMappingCorporateId(item)}-${index}`}
                    className="table-row cursor-pointer hover:bg-gray-50"
                    onClick={() => mappingRowClickHandler(item)}
                  >
                    <td className="table-td">{index + 1}</td>
                    <td className="table-td">{item.BranchName ?? item.branchName ?? "-"}</td>
                    <td className="table-td">{item.CorporateName ?? item.corporateName ?? "-"}</td>
                    <td className="table-td">{item.OPDRateList ?? item.opdRateList ?? "-"}</td>
                    <td className="table-td">{item.IPDRateList ?? item.ipdRateList ?? "-"}</td>
                    <td className="table-td">{item.CreatedBy ?? item.createdBy ?? "-"}</td>
                    <td className="table-td">{item.CreatedOn ?? item.createdOn ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default BranchCorporateRateListMapping;
