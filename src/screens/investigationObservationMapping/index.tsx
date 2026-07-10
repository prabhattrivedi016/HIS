import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import { CATEGORY_ID, Status } from "@/constants/constants";
import { ObservationMappingTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess } from "@/utils/alert";
import { debounce } from "lodash";
import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Select, { SingleValue } from "react-select";
import EditRangePopup from "./components/EditRangePopup";
import ObservationPopup from "./components/ObservationPopup";
import {
  InvestigationObservationMappingItem,
  InvestigationTableItem,
  ObservationMappingItem,
  observationTableDataItem,
  SelectItem,
} from "./types";

const InvestigationObservationMapping = () => {
  const { error, loading, fetchApi } = useGlobalApi();

  const location = useLocation();
  const navigate = useNavigate();

  const investigationDetails = location?.state?.investigationData;

  useEffect(() => {
    getInvestigationName(investigationDetails?.name);
  }, [investigationDetails]);

  const [investigationName, setInvestigationName] = useState("");
  const [investigationList, setInvestigationList] = useState<InvestigationObservationMappingItem[]>(
    []
  );

  const [selectedInvestigationId, setSelectedInvestigationId] = useState<number | null>(null);

  const [selectedObservation, setSelectedObservation] = useState<SelectItem | null>(null);

  const [observationMappingList, setObservationMappingList] = useState<ObservationMappingItem[]>(
    []
  );

  const [observationTableData, setObservationTableData] = useState<observationTableDataItem[]>([]);

  const [openObservationMapping, setOpenObservationMapping] = useState(false);
  const [renderObservationMapping, setRenderObservationMapping] = useState<boolean>(false);

  const [observationError, setObservationError] = useState("");

  const [openSetRange, setOpenSetRange] = useState<boolean>(false);
  const [renderSetRange, setRenderSetRange] = useState<boolean>(false);

  const [ObservationToEdit, setObservationToEdit] = useState<observationTableDataItem | null>(null);

  const [mappingToEdit, setMappingToEdit] = useState<ObservationMappingItem | null>(null);
  const [draggedObservationId, setDraggedObservationId] = useState<number | null>(null);

  // investigation name
  const getInvestigationName = async (iName: string) => {
    if (iName === undefined) return;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_SERVICE_ITEM_LIST,
      {},
      { params: { categoryId: CATEGORY_ID.categoryId, serviceName: iName } },
      { component: "InvestigationObservationMapping", silent: true }
    );

    if (investigationDetails) {
      const filteredData = resp?.data?.filter(
        (i: InvestigationTableItem) =>
          Number(i?.serviceItemId) === Number(investigationDetails?.serviceItemId)
      );
      selectHandler(filteredData?.[0]);
      return;
    }

    setInvestigationList(resp?.data ?? []);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      getInvestigationName(investigationName);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        getInvestigationName(investigationName);
      }, 500),
    [investigationName]
  );

  // investigation search handler
  const investigationChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setInvestigationName(value);

    if (value.trim().length < 3) return;

    debouncedSearch(value);
  };

  // selecting investigation name
  const selectHandler = async (item: InvestigationObservationMappingItem) => {
    const value = Number(item?.serviceItemId);
    if (!value) return;

    setSelectedInvestigationId(value);
    setInvestigationName(item?.name ?? "");
    setInvestigationList([]);

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_LAB_INVESTIGATION_OBSERVATION_MAPPING,
      {},
      { params: { investigationId: value } }
    );

    setObservationTableData(resp?.data ?? []);
  };

  // observation mapping
  const getObservationMapping = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OBSERVATION_MASTER,
      {},
      { params: { isActive: Status.ACTIVE } },
      { component: "InvestigationObservationMapping", silent: true }
    );

    setObservationMappingList(resp?.data ?? []);
  };

  useEffect(() => {
    getObservationMapping();
  }, []);

  const observationTypeOptions = useMemo<SelectItem[]>(
    () =>
      observationMappingList.map(item => ({
        value: item.observationId,
        label: item.observationName,
      })),
    [observationMappingList]
  );

  const observationTypeSelectHandler = (option: SingleValue<SelectItem>) => {
    setObservationError("");
    setSelectedObservation(option);
  };

  // observation Mapping for edit
  const observationMappingEditHandler = () => {
    const editableData = observationMappingList?.find(
      o => o?.observationId === selectedObservation?.value
    );
    setMappingToEdit(editableData!);
    setRenderObservationMapping(true);
    setTimeout(() => setOpenObservationMapping(true), 0);
  };

  // add observation to table
  const addObservationHandler = () => {
    if (!selectedObservation) return;

    const exists = observationTableData.some(
      item => item.observationId === selectedObservation.value
    );

    if (exists) {
      setObservationError("Observation already added");
      return;
    }

    const foundObservation = observationMappingList.find(
      o => o.observationId === selectedObservation.value
    );

    if (!foundObservation) return;

    const newRow: observationTableDataItem = {
      invastigationId: selectedInvestigationId!,
      observationId: foundObservation.observationId,
      observationName: foundObservation.observationName,
      isHeader: false,
      isBold: false,
      isUnderLine: false,
      isMandatory: 0,
      roundUp: foundObservation.roundUp ?? 0,
      method: foundObservation.method ?? "",
    };

    setObservationTableData(prev => [...prev, newRow]);
    setSelectedObservation(null);
    setObservationError("");
  };

  // update table data
  const updateRow = (id: number, key: keyof observationTableDataItem, value: boolean) => {
    setObservationTableData(prev =>
      prev.map(row => (row.observationId === id ? { ...row, [key]: value } : row))
    );
  };

  // submit handler
  const saveObservationMapping = async () => {
    if (!selectedInvestigationId) return;

    const payload = {
      invastigationId: selectedInvestigationId,
      observations: observationTableData.map(item => ({
        invastigationId: selectedInvestigationId,
        observationId: item.observationId,
        isHeader: Boolean(item.isHeader),
        isBold: Boolean(item.isBold),
        isUnderLine: Boolean(item.isUnderLine),
        isMandatory: Boolean(item.isMandatory),
      })),
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SUBMIT_INVESTIGATION_OBSERVATION_MAPPING,
      payload,
      {},
      { component: "InvestigationObservationMapping" }
    );
    if (!resp.result) {
      showError(error?.message ?? "something went wrong");
      return;
    }
    showSuccess(resp?.message ?? "Data  saved  successfully");
    setInvestigationList([]);
  };

  const closeHandler = useCallback(() => {
    setOpenObservationMapping(false);
    setTimeout(() => {
      setRenderObservationMapping(false);
      setMappingToEdit(null);
    }, 300);
  }, []);

  // range handler
  const editRangesHandler = (item: observationTableDataItem) => {
    if (!item) return;
    setObservationToEdit(item);
    setRenderSetRange(true);
    setTimeout(() => setOpenSetRange(true), 0);
  };
  const closeRangeHandler = useCallback(() => {
    setOpenSetRange(false);
    setTimeout(() => {
      setRenderSetRange(false);
      setObservationToEdit(null);
    }, 300);
  }, []);

  // delete investigation
  const deleteInvestigationHandler = (item: observationTableDataItem) => {
    if (!item) return;
    setObservationTableData(prev => prev.filter(row => row?.observationId !== item?.observationId));
  };

  // drag and drop handlers for observation row reordering
  const handleDragStart = (id: number) => {
    setDraggedObservationId(id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: number) => {
    if (!draggedObservationId || draggedObservationId === targetId) return;

    setObservationTableData(prev => {
      const fromIndex = prev.findIndex(row => row.observationId === draggedObservationId);
      const toIndex = prev.findIndex(row => row.observationId === targetId);

      if (fromIndex === -1 || toIndex === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);

      return updated;
    });

    setDraggedObservationId(null);
  };

  // back page handler
  const backPageHandler = () => {
    navigate("/lab-investigation-master", {
      state: {
        investigationDetails: investigationDetails,
      },
    });
  };

  return (
    <div className="page-container">
      <div className="flex flex-col lg:flex-row md:flex-row   gap-4 items-center justify-between w-full">
        <div>
          <h1 className="page-heading">Investigation Observation Mapping</h1>

          <nav className="helper-text">
            <NavLink to="/dashboard">Home</NavLink>
            <span>››</span>
            <span>Investigation Observation Mapping</span>
          </nav>
        </div>

        {!!investigationDetails && (
          <div className="flex flex-col gap-3 lg:flex-row md:flex-row">
            <button className="save-btn" onClick={backPageHandler}>
              Back Page
            </button>
          </div>
        )}
      </div>

      <div className="card mb-1">
        <div className="form-grid-4 flex flex-col lg:flex-row">
          {/* search investigation */}
          <InputField label="Search Investigation" required>
            <div className="relative">
              <input
                className="input-field"
                value={investigationName}
                placeholder="Enter investigation name"
                onChange={investigationChangeHandler}
                // onKeyDown={handleKeyDown
                // autoComplete="off"
              />

              {/*modal*/}
              {!investigationDetails && investigationList.length > 0 && (
                <div className="input-modal-bg">
                  {investigationList.map(item => (
                    <div
                      key={item.serviceItemId}
                      className="row-border"
                      onClick={() => selectHandler(item)}
                    >
                      <div className="row-text">{item.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </InputField>

          <InputField label="Observation Mapping" required>
            <div className="flex gap-2 items-center">
              <Select
                value={selectedObservation}
                options={observationTypeOptions}
                placeholder="Select observation type"
                isSearchable
                isClearable
                onChange={(option: any) => observationTypeSelectHandler(option)}
                styles={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />

              <button type="button" className="-mt-1" onClick={observationMappingEditHandler}>
                <i className="fa-solid fa-circle-plus fa-xl cursor-pointer" />
              </button>
            </div>

            {!!observationError && <p className="input-field-error">{observationError}</p>}
          </InputField>

          <div className="mt-6">
            <button
              type="button"
              className={` w-full lg:w-1/2 ${!selectedObservation ? "disabled-btn" : "save-btn"}`}
              onClick={addObservationHandler}
              disabled={!selectedObservation}
            >
              Add To Test
            </button>
          </div>
        </div>
      </div>

      {!!observationTableData && selectedInvestigationId && (
        <div className="card">
          <h2 className="card-title">Mapped Observation</h2>

          <div className="table-container">
            <div className="table-scroll-wrapper">
              <div className="table-size lg:min-h-90 lg:max-h-90">
                <table className="base-table">
                  <thead className="table-head">
                    <tr>
                      {ObservationMappingTableHeader.map((header, i) => (
                        <th key={i} className="table-th">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {!!observationTableData && observationTableData.length === 0 ? (
                      <tr>
                        <td colSpan={ObservationMappingTableHeader.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    ) : (
                      observationTableData.map(item => (
                        <tr
                          key={item.observationId}
                          className="table-row cursor-move"
                          draggable
                          onDragStart={() => handleDragStart(item.observationId)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(item.observationId)}
                        >
                          <td className="table-td">{item.observationName}</td>

                          <td className="table-td">
                            <input
                              type="checkbox"
                              checked={item.isHeader}
                              className="input-checkbox"
                              onChange={e =>
                                updateRow(item.observationId, "isHeader", e.target.checked)
                              }
                            />
                          </td>

                          <td className="table-td">
                            <input
                              type="checkbox"
                              checked={item.isBold}
                              className="input-checkbox"
                              onChange={e =>
                                updateRow(item.observationId, "isBold", e.target.checked)
                              }
                            />
                          </td>

                          <td className="table-td">
                            <input
                              type="checkbox"
                              checked={item.isUnderLine}
                              className="input-checkbox"
                              onChange={e =>
                                updateRow(item.observationId, "isUnderLine", e.target.checked)
                              }
                            />
                          </td>

                          <td className="table-td">
                            <input
                              type="checkbox"
                              checked={!!item.isMandatory}
                              className="input-checkbox"
                              onChange={e =>
                                updateRow(item.observationId, "isMandatory", e.target.checked)
                              }
                            />
                          </td>

                          <td className="table-td">{item.roundUp || "-"}</td>
                          <td className="table-td">{item.method || "-"}</td>

                          <td className="table-td" onClick={() => editRangesHandler(item)}>
                            <i className="fa-solid fa-edit  icon-color-button"></i>
                          </td>

                          <td className="table-td" onClick={() => deleteInvestigationHandler(item)}>
                            <i className="fa-solid fa-trash icon-color-delete"></i>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="form-actions-responsive mt-5">
            <button type="button" className="save-btn" onClick={saveObservationMapping}>
              Save
            </button>

            {/* <button type="button" className="cancel-button">
              Cancel
            </button> */}
          </div>
        </div>
      )}

      {!!renderObservationMapping && (
        <ObservationPopup
          isOpen={openObservationMapping}
          onClose={closeHandler}
          data={mappingToEdit!}
          onSuccess={getObservationMapping}
        />
      )}

      {/* edit range popup */}
      {!!renderSetRange && (
        <EditRangePopup
          isOpen={openSetRange}
          onClose={closeRangeHandler}
          data={ObservationToEdit!}
        />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}
    </div>
  );
};

export default InvestigationObservationMapping;
