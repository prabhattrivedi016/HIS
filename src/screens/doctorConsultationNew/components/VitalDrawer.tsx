import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DatePopup from "./DatePopup";

const vitalsConfig = [
  { label: "Pulse", unit: "/min", name: "pulse" },
  { label: "Systolic", unit: "mmHg", name: "systolic" },
  { label: "Diastolic", unit: "mmHg", name: "diastolic" },
  { label: "SPO2", unit: "%", name: "spo2" },
  { label: "Temperature", unit: "°F", name: "temperature" },
  { label: "R rate", unit: "/min", name: "rrate" },
  { label: "Height", unit: "cm", name: "height" },
  { label: "Weight", unit: "kg", name: "weight" },
  { label: "Ofc", unit: "cm", name: "ofc" },
  { label: "Waist", unit: "cm", name: "waist" },
  { label: "Hip", unit: "cm", name: "hip" },
  { label: "PEFR", unit: "L/min", name: "pefr" },
  { label: "Body Fat", unit: "%", name: "bodyFat" },
  { label: "Upper Segment", unit: "cm", name: "upperSegment" },
  { label: "Lower Segment", unit: "cm", name: "lowerSegment" },
  { label: "Arm Span", unit: "cm", name: "armSpan" },
  { label: "Sitting Height", unit: "cm", name: "sittingHeight" },
  { label: "Height Age", unit: "", name: "heightAge" },
  { label: "EGFR", unit: "", name: "egfr" },
  { label: "BMI", unit: "kg/m²", name: "bmi" },
  { label: "Fundal Ht.", unit: "cm", name: "fundalHt" },
  { label: "Diastolic (Rt)", unit: "mmHg", name: "diastolicRt" },
  { label: "Diastolic (Lt)", unit: "mmHg", name: "diastolicLt" },
  { label: "Systolic (Rt)", unit: "mmHg", name: "systolicRt" },
  { label: "Systolic (Lt)", unit: "mmHg", name: "systolicLt" },
  { label: "MUAC", unit: "cm", name: "muac" },
  { label: "ECOG Score", unit: "", name: "ecog" },
  { label: "CAT Score", unit: "", name: "cat" },
  { label: "ACT Score", unit: "", name: "act" },
  { label: "BSA", unit: "m²", name: "bsa" },
  { label: "HGT", unit: "", name: "hgt" },
  { label: "Systolic (Lying)", unit: "mmHg", name: "sysLying" },
  { label: "Diastolic (Lying)", unit: "mmHg", name: "diaLying" },
  { label: "Systolic (Standing)", unit: "mmHg", name: "sysStanding" },
  { label: "Diastolic (Standing)", unit: "mmHg", name: "diaStanding" },
  { label: "General-RBS", unit: "mg/dL", name: "rbs" },
  { label: "Spot Blood Sugar", unit: "mg/dL", name: "spotSugar" },
];

const getCurrentLabel = () => {
  const now = new Date();

  const date = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date} ${time}`;
};

const VitalDrawer = ({ isOpen, onClose }) => {
  const [columns, setColumns] = useState([]);
  const [values, setValues] = useState({});
  const [openPopup, setOpenPopup] = useState(false);
  const tableRef = useRef(null);

  // initialize default column on open
  useEffect(() => {
    if (!isOpen) return;
    const label = getCurrentLabel();
    setColumns(prev => (prev.length ? prev : [label]));
  }, [isOpen]);

  // auto scroll to latest column
  useEffect(() => {
    if (!tableRef.current) return;
    tableRef.current.scrollLeft = tableRef.current.scrollWidth;
  }, [columns]);

  const addColumn = label => {
    setColumns(prev => {
      if (prev.includes(label)) return prev;
      return [...prev, label];
    });
  };

  const handleChange = (vital, colIndex, value) => {
    setValues(prev => ({
      ...prev,
      [vital]: {
        ...(prev[vital] || {}),
        [colIndex]: value,
      },
    }));
  };

  const closePopup = useCallback(() => setOpenPopup(false), []);

  return createPortal(
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
      <div className="absolute inset-0">
        <div
          className={`drawer-bg-fade ${isOpen ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
        />

        <div className={`drawer-layout drawer-bg ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="drawer-title-border">
            <h2 className="drawer-title">Vitals Trend</h2>
            <button onClick={onClose} className="drawer-close-btn">
              ×
            </button>
          </div>

          <div className="p-4">
            <div className="flex justify-between mb-4">
              <button className="save-btn" onClick={() => setOpenPopup(true)}>
                + Add Date
              </button>
            </div>

            <div ref={tableRef} className="overflow-auto  lg:max-h-[620px] border rounded-md">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Vital</th>
                    {columns.map((col, i) => (
                      <th key={i} className="px-4 py-2 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {vitalsConfig.map(vital => (
                    <tr key={vital.name} className="border-b border-gray-300">
                      <td className="px-4 py-2 font-medium text-gray-700">{vital.label}</td>

                      {columns.map((_, colIndex) => (
                        <td key={colIndex} className="px-4 py-2">
                          <div className="flex items-center border rounded overflow-hidden">
                            <input
                              type="text"
                              value={values[vital.name]?.[colIndex] || ""}
                              onChange={e => handleChange(vital.name, colIndex, e.target.value)}
                              className="px-2 py-1 w-30 outline-none "
                              placeholder="Enter"
                            />
                            <span className="px-2 text-gray-500 text-xs bg-gray-50 border-l">
                              {vital.unit || "-"}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DatePopup isOpen={openPopup} onClose={closePopup} onAdd={addColumn} />
      </div>
    </div>,
    document.body
  );
};

export default VitalDrawer;
