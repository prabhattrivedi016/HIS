import { PatientSearchResultTableHeader } from "@/constants/tableHeaders";
import { usePatientContext } from "@/context/PatientContext";
import { createPortal } from "react-dom";
import { PatientDataItem } from "../types";

type MultiplePatientsPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  data: PatientDataItem[];
};

const MultiplePatientsPopup = ({ isOpen, onClose, data }) => {
  if (data?.length <= 1) return;
  const { setSearchedPatientData } = usePatientContext();

  const editPatientHandler = (item: PatientDataItem) => {
    if (!item) return;
    setSearchedPatientData(item);
    onClose();
  };

  return createPortal(
    <>
      <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`popup-bg-overlay ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        />

        <div
          className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-340 ${isOpen ? "opacity-full" : ""}`}
        >
          <div className="popup-header">
            <h2 className="popup-helper-text">Patient Search Results</h2>
            <button onClick={onClose} className="close-drawer-btn">
              ×
            </button>
          </div>
          <div className="table-container ">
            <div className="table-scroll-wrapper ">
              <div className="table-size lg:min-h-60 lg:max-h-60">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      {PatientSearchResultTableHeader.map((h, index) => (
                        <th key={index} className="table-th  ">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {data?.length === 0 && (
                      <tr>
                        <td colSpan={PatientSearchResultTableHeader.length} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}

                    {data.map((item: PatientDataItem, idx: number) => (
                      <tr
                        key={idx}
                        className="table-row cursor-pointer"
                        onClick={() => editPatientHandler(item)}
                      >
                        <td className="table-td">{item?.uhid || "-"}</td>
                        <td className="table-td">{item?.patientName || "-"}</td>{" "}
                        <td className="table-td">{item?.age || "-"}</td>{" "}
                        <td className="table-td">{item?.gender || "-"}</td>{" "}
                        <td className="table-td">{item?.contactNumber || "-"}</td>{" "}
                        <td className="table-td">{item?.emergencyContactNumber || "-"}</td>
                        <td className="table-td">{item?.idProofNumber || "-"}</td>
                        <td className="table-td">{item?.address || "-"}</td>
                        <td className="table-td">{item?.registrationDate || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default MultiplePatientsPopup;
