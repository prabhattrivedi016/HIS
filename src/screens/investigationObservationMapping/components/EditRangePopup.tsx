import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage, SuccessMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { EditRangesTableHeader } from "@/constants/tableHeaders";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EditRangePopupProps, RangeTableItem } from "../types";

const createEmptyRow = (gender: string): RangeTableItem => ({
  gender,
  fromAge: 0,
  toAge: "",
  defaultValue: "",
  minValue: "",
  maxValue: "",
  unit: "",
  displayValue: "",
  error: "",
});

const EditRangePopup = ({ isOpen, onClose, data }: EditRangePopupProps) => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [selectedGender, setSelectedGender] = useState("M");
  const [rangeTableData, setRangeTableData] = useState<RangeTableItem[]>([]);

  const [successMessage, setSuccessMessage] = useState<string>("");

  let closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  //  get table data
  const getRangeData = async (observationId: number, gender: string) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_INVESTIGATION_OBSERVATION_RANGE_MASTER,
      {},
      { params: { observationId, gender } },
      { component: "EditRangePopup", silent: true }
    );

    const apiData = resp?.data ?? [];

    if (apiData.length === 0) {
      setRangeTableData([createEmptyRow(gender)]);
    } else {
      setRangeTableData(
        apiData.map((item: RangeTableItem) => ({
          ...item,
          error: "",
        }))
      );
    }
  };

  useEffect(() => {
    if (data?.observationId) {
      getRangeData(data.observationId, selectedGender);
    }
  }, [data, selectedGender]);

  const genderChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedGender(e.target.value);
  };

  const isValidNumber = (value: string) => /^\d{0,5}$/.test(value);

  const handleChange = (index: number, field: string, value: string) => {
    if (!isValidNumber(value) && (field === "fromAge" || field === "toAge")) return;

    setRangeTableData(prev =>
      prev.map((row, i) => {
        if (i !== index) return row;

        const updated = { ...row, [field]: value };

        const fromAge = Number(updated.fromAge || 0);
        const toAge = Number(updated.toAge || 0);

        if (updated.toAge !== "" && toAge < fromAge) {
          updated.error = " must be ≥ From Age";
        } else {
          updated.error = "";
        }

        if (field === "minValue" || field === "maxValue") {
          updated.displayValue = `${updated.minValue || ""}-${updated.maxValue || ""}`;
        }

        return updated;
      })
    );
  };

  //   add & delete row
  const addRow = (index: number) => {
    const currentRow = rangeTableData[index];

    const fromAge = currentRow?.fromAge;
    const toAge = currentRow?.toAge;

    // validation
    if (fromAge === "" || fromAge === null || fromAge === undefined) {
      setRangeTableData(prev =>
        prev.map((row, i) => (i === index ? { ...row, error: "Please fill From Age first" } : row))
      );
      return;
    }

    // validation
    if (toAge === "" || toAge === null || toAge === undefined) {
      setRangeTableData(prev =>
        prev.map((row, i) => (i === index ? { ...row, error: "Please fill To Age first" } : row))
      );
      return;
    }

    // validation
    if (Number(toAge) < Number(fromAge)) {
      setRangeTableData(prev =>
        prev.map((row, i) => (i === index ? { ...row, error: "To Age must be ≥ From Age" } : row))
      );
      return;
    }

    setRangeTableData(prev => prev.map((row, i) => (i === index ? { ...row, error: "" } : row)));

    // add new row
    const newRow = {
      ...createEmptyRow(selectedGender),
      fromAge: Number(toAge) + 1,
      unit: currentRow?.unit ?? "",
    };

    setRangeTableData(prev => {
      const updated = [...prev];
      updated.splice(index + 1, 0, newRow);
      return updated;
    });
  };

  const deleteLastRow = () => {
    setRangeTableData(prev => (prev.length <= 1 ? prev : prev.slice(0, -1)));
  };

  const hasError = useMemo(() => rangeTableData.some(row => row.error), [rangeTableData]);

  //  table

  const renderTable = () => (
    <div className="table-container">
      <div className="table-scroll-wrapper">
        <div className="table-size lg:min-h-60 lg:max-h-60">
          <table className="base-table">
            <thead className="table-head">
              <tr>
                {EditRangesTableHeader.map((header, i) => (
                  <th key={i} className="table-th">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rangeTableData.map((row, index) => (
                <tr key={index} className="table-row ">
                  {/* Gender */}
                  <td className="table-td ">
                    <input className="input-field max-w-27" value={row.gender} readOnly />
                  </td>

                  {/* From Age */}

                  <td className="table-td">
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`input-field max-w-27 ${
                        row.error?.includes("From Age") ? "border-red-500" : ""
                      }`}
                      value={row.fromAge}
                      onChange={e => handleChange(index, "fromAge", e.target.value)}
                    />
                    {row.error?.includes("From Age") && (
                      <p className="input-field-error">{row.error}</p>
                    )}
                  </td>

                  {/* To Age */}
                  <td className="table-td">
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`input-field max-w-27 `}
                      value={row.toAge}
                      onChange={e => handleChange(index, "toAge", e.target.value)}
                    />
                    {row.error && <p className="input-field-error">{row.error}</p>}
                  </td>

                  {/* Default */}
                  <td className="table-td">
                    <input
                      className="input-field max-w-27"
                      value={row.defaultValue}
                      onChange={e => handleChange(index, "defaultValue", e.target.value)}
                    />
                  </td>

                  {/* Min */}
                  <td className="table-td">
                    <input
                      className="input-field max-w-27"
                      value={row.minValue}
                      onChange={e => handleChange(index, "minValue", e.target.value)}
                    />
                  </td>

                  {/* Max */}
                  <td className="table-td">
                    <input
                      className="input-field max-w-27"
                      value={row.maxValue}
                      onChange={e => handleChange(index, "maxValue", e.target.value)}
                    />
                  </td>

                  {/* Unit */}
                  <td className="table-td">
                    <input
                      className="input-field max-w-27"
                      value={row.unit}
                      onChange={e => handleChange(index, "unit", e.target.value)}
                    />
                  </td>

                  {/* Display */}
                  <td className="table-td">
                    <input className="input-field max-w-27" value={row.displayValue} readOnly />
                  </td>

                  {/* Add */}
                  <td className="table-td text-center">
                    <button type="button" onClick={() => addRow(index)}>
                      <i className="fa-solid fa-circle-plus icon-color-button" />
                    </button>
                  </td>

                  {/* Delete */}
                  <td className="table-td text-center">
                    {index === rangeTableData.length - 1 && (
                      <button type="button" onClick={deleteLastRow}>
                        <i className="fa-solid fa-trash icon-color-delete" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // create payload
  const createPayload = () => {
    return {
      observationId: data?.observationId,
      gender: selectedGender,
      ranges: rangeTableData.map(row => ({
        observationId: data?.observationId,
        gender: selectedGender,
        fromAge: String(row.fromAge ?? ""),
        toAge: String(row.toAge ?? ""),
        defaultValue: row.defaultValue ?? "",
        minValue: Number(row.minValue ?? 0),
        maxValue: Number(row.maxValue ?? 0),
        unit: row.unit ?? "",
        displayValue: row.displayValue ?? "",
      })),
    };
  };

  // submit handler
  const handleSubmitRange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasError) return;

    const payload = createPayload();

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SUBMIT_INVESTIGATION_OBSERVATION_RANGE_MASTER,
      payload,
      {},
      { component: "EditRangePopup" }
    );
    if (!resp?.result) {
      return;
    }
    setSuccessMessage(resp?.message ?? "Data saved successfully");
    closeTimer.current = setTimeout(() => {
      onClose();
      setSuccessMessage("");
    }, 1000);
  };

  // clear timer
  useEffect(() => {
    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    };
  }, []);

  useScrollLock(isOpen);

  return createPortal(
    <>
      <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        />

        <div className={`central-popup lg:min-w-340 ${isOpen ? "opacity-full" : ""}`}>
          <div className="popup-header">
            <h2 className="popup-helper-text">Edit Range Mapping</h2>
            <button onClick={onClose} className="close-drawer-btn">
              ×
            </button>
          </div>

          {successMessage ? <SuccessMessage text={successMessage} /> : <></>}
          {error ? <ErrorMessage text={error?.message} /> : <></>}

          <form>
            <div className="form-grid-4">
              <InputField label="Observation Name">
                <input className="input-field" value={data?.observationName || ""} readOnly />
              </InputField>

              <InputField label="Gender">
                <select
                  className="input-field"
                  value={selectedGender}
                  onChange={genderChangeHandler}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="B">Both</option>
                </select>
              </InputField>
            </div>

            {renderTable()}

            <div className="form-actions-responsive mt-5">
              <button
                type="submit"
                className={`save-btn ${hasError ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={hasError}
                onClick={handleSubmitRange}
              >
                Save
              </button>

              {/* <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button> */}
            </div>
          </form>
        </div>
      </div>
      {loading && <CustomLoader isLoading={loading} />}
    </>,
    document.body
  );
};

export default EditRangePopup;
