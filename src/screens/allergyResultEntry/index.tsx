import InputField from "@/components/customInputField";
import { AllergyResultEntryButtons, AllergyResultEntryTableHeader } from "@/constants/tableHeaders";
import { BriefcaseMedical } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const AllergyResultEntry = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const [activeIndex, setActiveIndex] = useState(0);

  const [renderReport, setRenderReport] = useState<boolean>(false);
  const [openReport, setOpenReport] = useState<boolean>(false);

  const reportHandler = () => {
    setRenderReport(true);
    requestAnimationFrame(() => {
      setOpenReport(true);
    });
  };

  useEffect(() => {
    const closeTimers: Array<ReturnType<typeof setTimeout>> = [];

    if (renderReport && !openReport) {
      closeTimers.push(
        setTimeout(() => {
          setRenderReport(false);
        }, 300)
      );
    }

    return () => {
      closeTimers.forEach(timer => clearTimeout(timer));
    };
  }, [renderReport, openReport]);

  const closeHandler = useCallback(() => {
    setOpenReport(false);
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-heading">Allergy Result Entry</h1>

      <nav className="helper-text">
        <NavLink to="/dashboard" className="hover:underline">
          Home
        </NavLink>
        <span>››</span>
        <span>Allergy Result Entry</span>
      </nav>
      <div className="card">
        <div className="form-grid-4">
          <InputField label="UHID" required>
            <input type="text" className="input-field" placeholder="Enter UHID " />
          </InputField>

          <InputField label="Bar Code" required>
            <input
              type="text"
              className="input-field"
              placeholder="Enter Barcode No  & press Enter to search"
            />
          </InputField>

          <InputField label="Patient Name" required>
            <input type="text" className="input-field" placeholder="Enter patient name " />
          </InputField>

          <InputField label="Type" required>
            <input type="text" className="input-field" placeholder="Enter lab number " />
          </InputField>

          <InputField label="Lab No" required>
            <input type="text" className="input-field" placeholder="Enter client name " />
          </InputField>

          <InputField label="Client/Panel" required>
            <input type="text" className="input-field" placeholder="Enter department name " />
          </InputField>

          <InputField label="Department" required>
            <input type="text" className="input-field" placeholder="Enter department name " />
          </InputField>

          <InputField label="Investigation" required>
            <input type="text" className="input-field" placeholder="Enter department name " />
          </InputField>

          <InputField label="From Date" required>
            <input
              type="date"
              className="input-field"
              placeholder="Enter contact number "
              value={currentDate}
              max={currentDate}
            />
          </InputField>

          <InputField label="To Date">
            <input
              type="date"
              className="input-field"
              placeholder="Enter contact number "
              max={currentDate}
              value={currentDate}
            />
          </InputField>
          <InputField label="Status" required>
            <input type="text" className="input-field" placeholder="Enter department name " />
          </InputField>
        </div>
        {/* -------------------------action buttons ---------------------------*/}
        <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* LEFT — STATS */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <span className="name-header">Total Patient:</span>
              <span className="ml-2">20</span>
            </div>

            <div className="flex items-center">
              <span className="name-header">Total Test:</span>
              <span className="ml-2">20</span>
            </div>

            <div className="flex items-center">
              <span className="name-header">Approved Test:</span>
              <span className="ml-2">20</span>
            </div>

            <div className="flex items-center">
              <span className="name-header">Pending Test:</span>
              <span className="ml-2">20</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button type="button" className="save-btn w-full sm:w-auto">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* -----------------------report buttons--------------------------- */}
      <div className="flex lg:flex-row sm:flex-col gap-2 m-2 overflow-x-auto">
        {AllergyResultEntryButtons.map((b, idx) => {
          const isActive = idx === activeIndex;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`report-button ${
                isActive ? "report-button-active" : "report-button-inactive"
              }`}
            >
              <BriefcaseMedical size={20} />
              <span>
                {b} : {20}
              </span>
            </button>
          );
        })}
      </div>
      {/* ------------------------table------------------------ */}
      <div className="table-container ">
        <div className="table-scroll-wrapper ">
          <div className="table-size lg:min-h-60 lg:max-h-60">
            <table className="base-table ">
              <thead className="table-head">
                <tr>
                  {AllergyResultEntryTableHeader.map((h, index) => (
                    <th key={index} className="table-th ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[].length === 0 ? (
                  <tr>
                    <td colSpan={17} className="text-center py-6 text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  [].map((item, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="table-td">{idx + 1}</td>
                      <td className="table-td">{item?.BillDate || "-"}</td>
                      <td className="table-td">{item?.LabNo || "-"}</td>
                      <td className="table-td">{item?.UHID || "-"}</td>
                      <td className="table-td">{item?.PatientName || "-"}</td>
                      <td className="table-td">
                        {item?.CurrentAge || "-"} / {item?.Gender}
                      </td>
                      <td className="table-td">{item?.ClientName || "-"}</td>
                      <td className="table-td">{item?.Name || "-"}</td>
                      <td className="table-td">{item?.Barcode || "-"}</td>

                      <td className="table-td cursor-pointer" onClick={reportHandler}>
                        <i className="fa-solid fa-file icon-color-button"></i>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllergyResultEntry;
