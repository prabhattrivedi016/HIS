import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { OptionItem as SelectOptionItem, SelectStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import { CATEGORY_ID, Status } from "@/constants/constants";
import {
  FormulaMasterObservationTableHeader,
  InvestigationFormulaListTableHeader,
} from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showSuccess } from "@/utils/alert";
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Select, { SingleValue, StylesConfig } from "react-select";
import ScientificCalculator from "./components/Calculator";
import {
  CalculatorItem,
  FormulaComponent,
  FormulaTable,
  InvestigationItem,
  ObservationItem,
} from "./types";

const FormulaMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();
  const singleSelectStyles = SelectStyles as StylesConfig<SelectOptionItem, false>;

  const [investigationItemList, setInvestigationItemList] = useState<InvestigationItem[]>([]);
  const [selectedInvestigation, setSelectedInvestigation] =
    useState<SingleValue<SelectOptionItem> | null>(null);

  const [observationList, setObservationList] = useState<ObservationItem[]>([]);
  const [selectedObservation, setSelectedObservation] =
    useState<SingleValue<SelectOptionItem> | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingObservationId, setEditingObservationId] = useState<number | null>(null);

  const [formulaTableData, setFormulaTableData] = useState<FormulaTable[]>([]);

  const [observationError, setObservationError] = useState<string>("");
  const [addError, setAddError] = useState<string>("");

  const [formula, setFormula] = useState("");

  const [formulaExpressionRight, setFormulaExpressionRight] = useState("");
  const [formulaComponents, setFormulaComponents] = useState<FormulaComponent[]>([]);

  const [formulaExpression, setFormulaExpression] = useState("");

  // investigation name
  const getInvestigationList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_SERVICE_ITEM_LIST,
      {},
      {
        params: {
          categoryId: CATEGORY_ID?.categoryId,
          labTypeId: Status?.ACTIVE,
          reportTypeId: Status?.ACTIVE,
          isActive: Status?.ACTIVE,
        },
      },
      { component: "FormulaMaster" }
    );
    setInvestigationItemList(resp?.data ?? []);
  };

  // investigation select option
  const investigationSelectOption = useMemo(() => {
    return investigationItemList?.map(i => ({
      label: i?.name,
      value: i?.serviceItemId,
    }));
  }, [investigationItemList]);

  // investigation select handler
  const investigationSelectHandler = (option: SingleValue<SelectOptionItem>) => {
    if (!option) return;
    setIsEditMode(false);
    setEditingObservationId(null);
    setSelectedObservation(null);
    setSelectedInvestigation(option);
    getObservationFormula(Number(option?.value));
    getInvestigationObservationMapping(Number(option?.value));
  };

  useEffect(() => {
    getInvestigationList();
  }, []);

  //investigation observation mapping
  const getInvestigationObservationMapping = async (investigationId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_LAB_INVESTIGATION_OBSERVATION_MAPPING,
      {},
      { params: { investigationId } },
      { component: "FormulaMaster" }
    );

    setObservationList(resp?.data ?? []);
  };

  const ObservationSelectOption = useMemo(() => {
    return observationList?.map(o => ({
      label: o?.observationName,
      value: o?.observationId,
    }));
  }, [observationList]);

  // observation formula list
  const getObservationFormula = async (investigationId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_OBSERVATION_FORMULA_BY_INVESTIGATION_ID,
      {},
      { params: { investigationId: Number(investigationId) } },
      { component: "FormulaMaster" }
    );
    setFormulaTableData(resp?.data ?? []);
  };

  useEffect(() => {
    if (selectedInvestigation?.value) {
      getObservationFormula(Number(selectedInvestigation?.value));
    }
  }, [selectedInvestigation]);

  const observationSelectHandler = (option: SingleValue<SelectOptionItem>) => {
    if (!option) return;
    setSelectedObservation(option);
  };

  // add investigation handler
  const addObservationToFormula = (item: ObservationItem) => {
    // Validate observation is selected
    if (!selectedObservation) {
      setObservationError("Please select observation first");
      setAddError("");
      return;
    }

    // Validate duplicate observation
    if (item?.observationId === selectedObservation?.value) {
      setAddError(
        `${selectedObservation?.label || "Selected observation"} can't be added, please add another one`
      );
      setObservationError("");
      return;
    }

    // Validate observation component id exists
    const observationComponentId =
      item?.observationId ?? item?.investigationId ?? item?.investigationId ?? item?.mappingId;

    if (!observationComponentId) {
      setAddError("Unable to add this observation to formula");
      setObservationError("");
      return;
    }

    // Clear errors on successful validation
    setObservationError("");
    setAddError("");

    // Add to formula
    setFormulaComponents(prev => [
      ...prev,
      {
        typeId: "1",
        type: "observationId",
        component: String(observationComponentId),
        sequenceNo: String(
          (prev.length ? Math.max(...prev.map(v => Number(v.sequenceNo))) : 0) + 1
        ),
      },
    ]);

    setFormula(prev => prev + item.observationName);
  };

  const buildFormulaRhs = (arr: CalculatorItem[]): string => {
    if (!arr?.length) return "";

    return [...arr]
      .sort((a, b) => Number(a.sequenceNo) - Number(b.sequenceNo))
      .map(v => {
        if (v.type === "observationId") return `obs(${v.component})`;
        if (v.type === "operator") return v.component;
        if (v.type === "numbers") return v.component;
        return "";
      })
      .join("")
      .trim();
  };

  // generate formula expression right (rhs only)
  const generateFormulaExpressionRight = (arr: CalculatorItem[]) => {
    if (!arr?.length || !selectedObservation) return "";
    return buildFormulaRhs(arr);
  };

  useEffect(() => {
    const generatedFormula = generateFormulaExpressionRight(formulaComponents);
    setFormulaExpressionRight(generatedFormula);
  }, [formulaComponents, selectedObservation]);

  // generate formula expression (target=rhs)
  const generateFormulaExpression = (arr: CalculatorItem[]) => {
    if (!arr?.length || !selectedObservation) return "";

    const rhs = buildFormulaRhs(arr);
    if (!rhs) return "";
    return `${selectedObservation.value}=${rhs}`;
  };
  useEffect(() => {
    const generatedFormula = generateFormulaExpression(formulaComponents);
    setFormulaExpression(generatedFormula);
  }, [formulaComponents, selectedObservation]);

  // submit handler
  const submitHandler = async () => {
    const observationIdForPayload = selectedObservation?.value ?? editingObservationId;

    if (!isEditMode && !selectedObservation) {
      setObservationError("Please select observation first");
      return;
    }

    if (
      !observationIdForPayload ||
      !formula ||
      !formulaComponents?.length ||
      !formulaExpression ||
      !formulaExpressionRight
    )
      return;

    const payload = {
      observationId: observationIdForPayload,
      formulaText: formula,
      formulaExpression,
      formulaExpressionRight,
      formulaComponents: formulaComponents.map(component => ({
        ...component,
        component: String(component.component),
      })),
    };

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.CREATE_UPDATE_LAB_FORMULA_MASTER,
      payload,
      {},
      { component: "FormulaComponent" }
    );
    if (!resp?.result) {
      return;
    }
    setIsEditMode(false);
    setEditingObservationId(null);
    showSuccess(resp?.message ?? "Data saved successfully");
    await getObservationFormula(Number(selectedInvestigation?.value!));
    resetPayloadHandler();
  };

  // edit handler
  const editHandler = async (item: FormulaTable) => {
    setIsEditMode(true);
    setEditingObservationId(item?.observationId ?? null);
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_FORMULA_BY_OBSERVATION_ID,
      {},
      { params: { observationId: item?.observationId } },
      { component: "FormulaMaster" }
    );

    const obj = ObservationSelectOption.find(o => o?.value === item?.observationId);
    setFormula(resp?.data?.[0]?.formulaText);
    setSelectedObservation(obj!);
  };

  // delete handler
  const deleteHandler = async (item: FormulaTable) => {
    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.DELETE_LAB_FORMULA_BY_OBSERVATION_ID,
      {},
      { params: { Observationid: item?.observationId } },
      { component: "FormulaMaster" }
    );
    if (!resp?.result) {
      return;
    }
    showSuccess(resp?.message ?? "Formula deleted successfully");
    await getObservationFormula(Number(selectedInvestigation?.value!));
  };

  const cancelHandler = () => {
    setIsEditMode(false);
    setEditingObservationId(null);
    setSelectedInvestigation(null);
    setSelectedObservation(null);
    setObservationList([]);
    setFormulaTableData([]);
    setObservationError("");
    setAddError("");
    setFormula("");
    setFormulaExpressionRight("");
    setFormulaComponents([]);
    setFormulaExpression("");
  };

  const resetPayloadHandler = () => {
    setIsEditMode(false);
    setEditingObservationId(null);
    setSelectedObservation(null);
    setObservationError("");
    setAddError("");
    setFormula("");
    setFormulaExpressionRight("");
    setFormulaComponents([]);
    setFormulaExpression("");
  };

  return (
    <div className="page-container">
      <h1 className="page-heading">Formula Master</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Formula Master</span>
      </nav>

      <div className="card flex flex-col p-4">
        {/* TOP CONTENT */}
        <div className="flex flex-row gap-6">
          {/* LEFT */}
          <div className="w-1/3 min-h-40 flex flex-col gap-4">
            {/* investigation */}
            <div className="w-full">
              <InputField label="Investigation">
                <Select<SelectOptionItem, false>
                  value={selectedInvestigation}
                  options={investigationSelectOption}
                  placeholder="Select investigation"
                  isSearchable
                  isClearable
                  onChange={option => investigationSelectHandler(option)}
                  styles={singleSelectStyles}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </InputField>
            </div>

            {/* table */}
            <div className="w-full">
              <div className="table-container">
                <div className="table-scroll-wrapper w-full">
                  <div className="table-size lg:min-h-79 w-full">
                    <table className="base-table w-full">
                      <thead className="table-head">
                        <tr>
                          {FormulaMasterObservationTableHeader.map((h, index) => (
                            <th key={index} className="table-th">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {observationList?.length === 0 && (
                          <tr>
                            <td
                              colSpan={FormulaMasterObservationTableHeader.length}
                              className="table-empty"
                            >
                              No records found
                            </td>
                          </tr>
                        )}

                        {observationList.map((item, idx) => (
                          <tr
                            key={idx}
                            className="table-row cursor-pointer"
                            onDoubleClick={() => addObservationToFormula(item)}
                          >
                            <td className="table-td">{idx + 1}</td>
                            <td className="table-td">
                              {item?.investigationId ?? item?.mappingId ?? "-"}
                            </td>
                            <td className="table-td">{item?.observationName ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {!!addError && <p className="input-field-error">{addError}</p>}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="max-w-100">
              <InputField label="Observation">
                <Select<SelectOptionItem, false>
                  value={selectedObservation}
                  options={ObservationSelectOption}
                  placeholder="Select Observation"
                  isSearchable
                  isClearable
                  onChange={option => observationSelectHandler(option)}
                  styles={singleSelectStyles}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
                {!!observationError && <p className="input-field-error">{observationError}</p>}
              </InputField>
            </div>
            {/* calculator */}
            <ScientificCalculator
              setFormula={setFormula}
              formula={formula}
              setFormulaComponents={setFormulaComponents}
            />
          </div>
        </div>

        {/* card inside button */}
        <div className="flex justify-end gap-3 mt-2 pt-4">
          <button type="button" className="reset-btn" onClick={resetPayloadHandler}>
            Reset
          </button>

          <button type="submit" className="save-btn" onClick={submitHandler}>
            Save
          </button>

          <button type="button" className="cancel-button" onClick={cancelHandler}>
            Cancel
          </button>
        </div>

        {!!formulaTableData && formulaTableData?.length > 0 && (
          <div className="mt-3">
            <div className="card-header">
              <h2 className="card-title ">Formula Lists</h2>
            </div>

            <div className="table-container ">
              <div className="table-scroll-wrapper ">
                <div className="table-size lg:min-h-60 lg:max-h-60">
                  <table className="base-table ">
                    <thead className="table-head">
                      <tr>
                        {InvestigationFormulaListTableHeader.map((h, index) => (
                          <th key={index} className="table-th ">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {formulaTableData?.length === 0 && (
                        <tr>
                          <td
                            colSpan={InvestigationFormulaListTableHeader.length}
                            className="table-empty"
                          >
                            No records found
                          </td>
                        </tr>
                      )}

                      {formulaTableData.map((item, idx) => (
                        <tr key={idx} className="table-row">
                          <td className="table-td">{idx + 1}</td>
                          <td className="table-td">{item?.investigationName || "-"}</td>
                          <td className="table-td">{item?.observationName || "-"}</td>
                          <td className="table-td">{item?.formulaText || "-"}</td>
                          <td className="table-td" onClick={() => editHandler(item)}>
                            <i className="fa-solid fa-edit icon-color-button" />
                          </td>

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

            {loading && <CustomLoader isLoading={loading} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormulaMaster;
