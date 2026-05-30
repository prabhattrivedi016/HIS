import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import MultiCheckboxOption from "@/components/multiSelectCheckBox";
import { ENDPOINTS } from "@/config/defaults";
import { MicroOrganismMappingTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { usePickMaster } from "@/hooks/usePickMaster";
import { PickMasterItem, SelectItem } from "@/types";
import { showSuccess, showWarning } from "@/utils/alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Select, { GroupBase, StylesConfig } from "react-select";
import {
  AntibioticMasterItem,
  MicroMappingAddTableItem,
  MicroMappingApiItem,
  MicroMappingUpdatePayload,
  OrganismMasterItem,
} from "../types";

const getTableAntibioticIds = (tableRows: MicroMappingAddTableItem[]) =>
  new Set(tableRows.map(row => Number(row.antibioticNameId)));

const getDuplicateAntibiotics = (
  antibiotics: SelectItem[],
  tableRows: MicroMappingAddTableItem[]
) => {
  const existingIds = getTableAntibioticIds(tableRows);
  return antibiotics.filter(item => existingIds.has(Number(item.value)));
};

const formatDuplicateAntibioticMessage = (duplicates: SelectItem[]) => {
  const names = duplicates.map(item => item.label).join(", ");
  if (duplicates.length === 1) {
    return `Antibiotic "${names}" is already present in the table`;
  }
  return `Antibiotic(s) already present in the table: ${names}`;
};

const normalizeResistantValue = (value?: string | number | boolean | null) => {
  if (value === true || value === 1 || value === "1") {
    return "1";
  }
  return "0";
};

const isResistantChecked = (value: string) => value === "1";

const MICRO_MAPPING_QUERY_KEY = "getMicroMappingList";

const mapApiItemToRow = (item: MicroMappingApiItem): MicroMappingAddTableItem => ({
  organismId: item.organismId,
  organismName: item.organismName,
  sdd: item.sdd ?? "",
  refRangeI: item.refRangeI ?? "",
  refRangeS: item.refRangeS ?? "",
  refRangeR: item.refRangeR ?? "",
  resistant: normalizeResistantValue(item.resistant),
  antibioticName: item.antibioticName ?? "",
  antibioticNameId: item.antibioticNameId ?? "",
  antibioticClassName: item.antibioticClassName,
  antibioticClassId: item.antibioticClassId,
  breakPoint: item.breakPoint ?? "",
});

const OrganismAntibioticMapping = () => {
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();
  const antibioticClassList = usePickMaster("AntibioticClass")?.pickMasterValue ?? [];

  const [selectedOrganism, setSelectedOrganism] = useState<SelectItem | null>(null);
  const [selectedAntibiotic, setSelectedAntibiotic] = useState<SelectItem[]>([]);
  const [selectedAntibioticClass, setSelectedAntibioticClass] = useState<PickMasterItem | null>(
    null
  );
  const [classErrorMessage, setClassErrorMessage] = useState<string>("");
  const [antibioticErrorMessage, setAntibioticErrorMessage] = useState<string>("");
  const [rows, setRows] = useState<MicroMappingAddTableItem[]>([]);
  const lastAppliedMappingAtRef = useRef(0);

  const selectedOrganismId = selectedOrganism?.value ? Number(selectedOrganism.value) : null;

  const getOrganismList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ORGANISM_NAME_LIST,
      {},
      {},
      { component: "OrganismAntibioticMapping" }
    );

    return resp?.data;
  };

  const { data: organismLists = [] } = useQuery({
    queryKey: ["getOrganismList"],
    queryFn: () => getOrganismList(),
  });

  const organismSelectOption = useMemo(() => {
    return organismLists?.map((item: OrganismMasterItem) => ({
      label: item?.organismName,
      value: item?.organismNameId,
    }));
  }, [organismLists]);

  const getAntibioticList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ANTIBIOTIC_NAME_LIST,
      {},
      {},
      { component: "OrganismAntibioticMapping" }
    );
    return resp?.data;
  };

  const { data: antibioticLists = [] } = useQuery({
    queryKey: ["getAntibioticList"],
    queryFn: () => getAntibioticList(),
  });

  const antibioticSelectOption = useMemo(() => {
    return antibioticLists?.map((item: AntibioticMasterItem) => ({
      label: item?.antibioticName,
      value: item?.antibioticNameId,
    }));
  }, [antibioticLists]);

  const resetMappingFormState = useCallback(() => {
    setRows([]);
    setSelectedAntibiotic([]);
    setSelectedAntibioticClass(null);
    setClassErrorMessage("");
    setAntibioticErrorMessage("");
    lastAppliedMappingAtRef.current = 0;
  }, []);

  const applyMappingListToForm = useCallback(
    (list: MicroMappingApiItem[]) => {
      const mappedRows = list.map(mapApiItemToRow);
      setRows(mappedRows);

      const selectedOptions = antibioticSelectOption.filter((option: SelectItem) =>
        mappedRows.some(row => Number(row.antibioticNameId) === Number(option.value))
      );
      setSelectedAntibiotic(selectedOptions);

      const firstClassId = list[0]?.antibioticClassId;
      if (firstClassId != null && firstClassId !== "") {
        const selectedClass = antibioticClassList.find(
          (item: PickMasterItem) => Number(item?.key) === Number(firstClassId)
        );
        setSelectedAntibioticClass(selectedClass ?? null);
      } else {
        setSelectedAntibioticClass(null);
      }
    },
    [antibioticClassList, antibioticSelectOption]
  );

  const organismSelectHandler = (option: SelectItem | null) => {
    queryClient.cancelQueries({ queryKey: [MICRO_MAPPING_QUERY_KEY] });
    lastAppliedMappingAtRef.current = 0;
    setSelectedOrganism(option);
    resetMappingFormState();
  };

  const getMicroMappingList = async (organismId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_MICRO_MAPPING_BY_ORGANISM_ID,
      {},
      { params: { organismId } },
      { component: "OrganismAntibioticMapping" }
    );
    if (!resp?.result) {
      showWarning(resp?.result ?? "No data found");
      return [];
    }
    return (resp?.data ?? []) as MicroMappingApiItem[];
  };

  const {
    data: microMappingList,
    dataUpdatedAt: mappingDataUpdatedAt,
    isFetching: isMappingFetching,
    isSuccess: isMappingSuccess,
  } = useQuery({
    queryKey: [MICRO_MAPPING_QUERY_KEY, selectedOrganismId],
    queryFn: () => getMicroMappingList(selectedOrganismId!),
    enabled: selectedOrganismId != null,
    staleTime: 0,
    refetchOnMount: "always",
    placeholderData: undefined,
  });

  const selectAntibioticHandler = (option: readonly SelectItem[] | null) => {
    setSelectedAntibiotic(option ? [...option] : []);
    setAntibioticErrorMessage("");
  };

  useEffect(() => {
    if (selectedOrganismId == null) {
      resetMappingFormState();
      return;
    }

    if (isMappingFetching && lastAppliedMappingAtRef.current === 0) {
      resetMappingFormState();
      return;
    }

    if (isMappingFetching) {
      return;
    }

    if (!isMappingSuccess || microMappingList === undefined) {
      return;
    }

    if (lastAppliedMappingAtRef.current === mappingDataUpdatedAt) {
      return;
    }

    applyMappingListToForm(microMappingList);
    lastAppliedMappingAtRef.current = mappingDataUpdatedAt;
  }, [
    selectedOrganismId,
    microMappingList,
    mappingDataUpdatedAt,
    isMappingFetching,
    isMappingSuccess,
    applyMappingListToForm,
    resetMappingFormState,
  ]);

  const antibioticClassSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    if (!value) {
      setSelectedAntibioticClass(null);
      return;
    }
    const selectedClass = antibioticClassList.find(
      (item: PickMasterItem) => Number(item?.key) === value
    );
    setSelectedAntibioticClass(selectedClass ?? null);
    setClassErrorMessage("");
  };

  const updateRowField = (
    index: number,
    field: keyof Pick<
      MicroMappingAddTableItem,
      "breakPoint" | "sdd" | "refRangeI" | "refRangeS" | "refRangeR"
    >,
    value: string
  ) => {
    setRows(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const updateResistantHandler = (index: number, checked: boolean) => {
    const resistantValue = checked ? "1" : "0";
    setRows(prev =>
      prev.map((row, i) => (i === index ? { ...row, resistant: resistantValue } : row))
    );
  };

  const removeRowHandler = (index: number) => {
    const removed = rows[index];
    if (!removed) return;

    setRows(prev => prev.filter((_, i) => i !== index));
    setSelectedAntibiotic(prev =>
      prev.filter(opt => Number(opt.value) !== Number(removed.antibioticNameId))
    );
  };

  const addMappingHandler = () => {
    if (!selectedOrganism?.value) {
      showWarning("Please select organism");
      return;
    }
    if (!selectedAntibiotic?.length) {
      showWarning("Please select antibiotic");
      return;
    }
    if (!selectedAntibioticClass) {
      setClassErrorMessage("Please select antibiotic class");
      return;
    }
    setClassErrorMessage("");

    const duplicateAntibiotics = getDuplicateAntibiotics(selectedAntibiotic, rows);
    const existingIds = getTableAntibioticIds(rows);
    const antibioticsToAdd = selectedAntibiotic.filter(
      item => !existingIds.has(Number(item.value))
    );

    if (duplicateAntibiotics.length > 0) {
      const duplicateMessage = formatDuplicateAntibioticMessage(duplicateAntibiotics);
      setAntibioticErrorMessage(duplicateMessage);
      showWarning(duplicateMessage);
    }

    if (!antibioticsToAdd.length) {
      return;
    }

    if (!duplicateAntibiotics.length) {
      setAntibioticErrorMessage("");
    }

    const newRows: MicroMappingAddTableItem[] = antibioticsToAdd.map(item => ({
      organismId: selectedOrganism.value,
      organismName: selectedOrganism.label,
      sdd: "",
      refRangeI: "",
      refRangeS: "",
      refRangeR: "",
      resistant: "0",
      antibioticName: item.label,
      antibioticNameId: item.value,
      antibioticClassName: selectedAntibioticClass.value,
      antibioticClassId: selectedAntibioticClass.key,
      breakPoint: "",
    }));

    setRows(prev => [...prev, ...newRows]);
  };

  const createUpdateMicroMapping = async (payload: MicroMappingUpdatePayload) => {
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_MICRO_MAPPING,
      payload,
      {},
      { component: "OrganismAntibioticMapping" }
    );
    return resp;
  };

  const updateMutation = useMutation({
    mutationFn: createUpdateMicroMapping,
    onSuccess: resp => {
      if (!resp?.result) {
        showWarning(resp?.message ?? "Failed to update mapping");
        return;
      }
      showSuccess(resp?.message ?? "Data saved successfully");
      queryClient.invalidateQueries({
        queryKey: [MICRO_MAPPING_QUERY_KEY, selectedOrganismId],
      });
    },
  });

  const updateMappingHandler = () => {
    if (!selectedOrganism?.value) {
      showWarning("Please select organism");
      return;
    }
    if (!rows.length) {
      showWarning("No mapping records to update");
      return;
    }

    const antibioticClassId = Number(selectedAntibioticClass?.key);
    if (!antibioticClassId) {
      setClassErrorMessage("Please select antibiotic class");
      return;
    }
    setClassErrorMessage("");

    const payload: MicroMappingUpdatePayload = {
      organismId: Number(selectedOrganism.value),
      antibioticIdList: rows.map(row => String(row.antibioticNameId)).join(","),
      antibioticClassId,
      microMappings: rows.map(row => ({
        organismName: row.organismName ?? "",
        antibioticName: row.antibioticName,
        antibioticNameId: Number(row.antibioticNameId),
        antibioticClassName: row.antibioticClassName ?? "",
        breakPoint: row.breakPoint,
        sdd: row.sdd,
        refRangeI: row.refRangeI,
        refRangeS: row.refRangeS,
        refRangeR: row.refRangeR,
        resistant: normalizeResistantValue(row.resistant),
      })),
    };

    updateMutation.mutate(payload);
  };

  return (
    <div className="mt-1">
      <div className="card mb-1">
        <form>
          <div className="form-grid-4">
            <InputField label="Organism" required>
              <Select
                value={selectedOrganism}
                options={organismSelectOption}
                placeholder="Select organism name"
                isSearchable
                isClearable
                onChange={option => organismSelectHandler(option as unknown as SelectItem | null)}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </InputField>

            <InputField label="Antibiotic " required>
              <Select
                value={selectedAntibiotic}
                isMulti
                options={antibioticSelectOption}
                placeholder="Select antibiotic"
                isSearchable
                isClearable
                onChange={option => selectAntibioticHandler(option)}
                styles={SelectStyles as StylesConfig<SelectItem, true, GroupBase<SelectItem>>}
                menuPortalTarget={document.body}
                components={{ Option: MultiCheckboxOption }}
                menuPosition="fixed"
              />
              {!!antibioticErrorMessage && (
                <p className="input-field-error">{antibioticErrorMessage}</p>
              )}
            </InputField>

            <InputField label="Antibiotic Class" required>
              <select
                className="input-field"
                value={selectedAntibioticClass?.key ?? ""}
                onChange={antibioticClassSelectHandler}
              >
                <option value="">Select Class</option>
                {antibioticClassList.map((item: PickMasterItem) => (
                  <option key={item?.key} value={item?.key}>
                    {item?.value}
                  </option>
                ))}
              </select>
              {!!classErrorMessage && <p className="input-field-error">{classErrorMessage}</p>}
            </InputField>
          </div>
          <div className="form-actions-responsive mt-5">
            <button type="button" className="save-btn" onClick={addMappingHandler}>
              Map
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title ">Organism Mapping Antibiotic list</h2>
        </div>
        <div className="table-container ">
          <div className="table-scroll-wrapper">
            <div className="table-size lg:min-h-72 lg:max-h-72 ">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    {MicroOrganismMappingTableHeader.map((h, index) => (
                      <th key={index} className="table-th align-top">
                        <div className="flex flex-row gap-2">
                          <h2>{h}</h2>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={MicroOrganismMappingTableHeader.length} className="table-empty">
                        No records found
                      </td>
                    </tr>
                  )}

                  {rows.map((item: MicroMappingAddTableItem, idx: number) => (
                    <tr key={`${item.antibioticNameId}-${idx}`} className="table-row">
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td">{item?.organismName || "-"}</td>
                      <td className="table-td">{item?.antibioticName || "-"}</td>
                      <td className="table-td">{item?.antibioticClassName || "-"}</td>

                      <td className="table-td">
                        <input
                          className="input-field max-w-20"
                          placeholder="BreakPoint"
                          value={item.breakPoint}
                          onChange={e => updateRowField(idx, "breakPoint", e.target.value)}
                        />
                      </td>
                      <td className="table-td">
                        <input
                          className="input-field max-w-20"
                          placeholder="SDD"
                          value={item.sdd}
                          onChange={e => updateRowField(idx, "sdd", e.target.value)}
                        />
                      </td>
                      <td className="table-td">
                        <input
                          className="input-field max-w-20"
                          placeholder="Ref Range I"
                          value={item.refRangeI}
                          onChange={e => updateRowField(idx, "refRangeI", e.target.value)}
                        />
                      </td>
                      <td className="table-td">
                        <input
                          className="input-field max-w-20"
                          placeholder="Ref Range S"
                          value={item.refRangeS}
                          onChange={e => updateRowField(idx, "refRangeS", e.target.value)}
                        />
                      </td>
                      <td className="table-td">
                        <input
                          className="input-field max-w-20"
                          placeholder="Ref Range R"
                          value={item.refRangeR}
                          onChange={e => updateRowField(idx, "refRangeR", e.target.value)}
                        />
                      </td>
                      <td className="table-td">
                        <input
                          type="checkbox"
                          className="input-checkbox"
                          checked={isResistantChecked(item.resistant)}
                          onChange={e => updateResistantHandler(idx, e.target.checked)}
                        />
                      </td>
                      <td className="table-td">
                        <i
                          className="fa-solid fa-trash icon-color-delete cursor-pointer"
                          onClick={() => removeRowHandler(idx)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => {
                            if (e.key === "Enter" || e.key === " ") removeRowHandler(idx);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="form-actions-responsive mt-5">
        <button
          type="button"
          className="save-btn"
          onClick={updateMappingHandler}
          disabled={updateMutation.isPending}
        >
          Update
        </button>
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default OrganismAntibioticMapping;
