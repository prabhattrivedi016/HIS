import Animation from "@/components/animation";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ErrorMessage } from "@/components/infoText";
import { ENDPOINTS } from "@/config/defaults";
import { PatientSearchResultTableHeader } from "@/constants/tableHeaders";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { BranchItem } from "@/types";
import { formatToDDMMYYYY } from "@/utils/dateConvertHandler";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SearchedPatientItem } from "../types";
import { formatDate } from "./dobHelper";

type SearchPatientPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  showTable: boolean;
  setShowTable: Dispatch<SetStateAction<boolean>>;
  onSelectPatientId?: Dispatch<SetStateAction<number | null>>;
  onSelectPatient?: (item: SearchedPatientItem) => boolean | Promise<boolean>;
  selectionErrorMessage?: string;
};

const getInitialFormData = () => ({
  uhid: "",
  ipdNo: "",
  firstName: "",
  middleName: "",
  lastName: "",
  relativeName: "",
  contactNumber: "",
  emergencyContactNumber: "",
  dob: "",
  address: "",
  registrationDate: "",
  branchId: 1,
});

const SearchPatientPopup = ({
  isOpen,
  onClose,
  showTable,
  setShowTable,
  onSelectPatientId,
  onSelectPatient,
  selectionErrorMessage = "",
}: SearchPatientPopupProps) => {
  const { loading, fetchApi } = useGlobalApi();
  const today = formatDate(new Date());
  const [searchPatientDataList, setSearchPatientDataList] = useState<SearchedPatientItem[]>([]);

  const [isTableData, setIsTableData] = useState<boolean>(false);

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (!isOpen) return;
    setFormData(getInitialFormData());
    setSearchPatientDataList([]);
    setIsTableData(false);
    setShowTable(false);
  }, [isOpen, setShowTable]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const trimmedValue = value.trim();
    setFormData(prevData => ({ ...prevData, [name]: trimmedValue }));
  };

  const handleDateChange = (field: "dob" | "registrationDate", value: string) => {
    setFormData(prevData => ({ ...prevData, [field]: value }));
  };

  const formSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchParams = {
      ...formData,
      dob: formData?.dob ? formatToDDMMYYYY(formData?.dob) : "",
      registrationDate: formData?.registrationDate
        ? formatToDDMMYYYY(formData?.registrationDate)
        : "",
    };

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_MASTER,
      {},
      { params: searchParams },
      { component: "searchPatientPopupOfPatientRegistration" }
    );

    setSearchPatientDataList(resp?.data ?? []);
    setShowTable(true);
    setIsTableData(true);
  };

  // close handler
  const closeHandler = () => {
    setFormData(getInitialFormData());
    setSearchPatientDataList([]);
    setIsTableData(false);
    onClose?.();
    setShowTable(false);
  };
  // select patient handler
  const selectPatientHandler = async (item: SearchedPatientItem) => {
    if (onSelectPatient) {
      const canProceed = await onSelectPatient(item);
      if (!canProceed) return;
    } else {
      onSelectPatientId?.(item?.patientId ?? null);
    }

    onClose();
    setShowTable(false);
  };

  // show patient details on mounting of the page
  const getAllPatientData = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.SEARCH_PATIENT_MASTER,
      {},
      { params: { branchId: formData?.branchId } },
      { component: "SearchPatientPopupOfRegistration" }
    );
    setSearchPatientDataList(resp?.data.slice(0, 99) ?? []);
    setShowTable(true);
    setIsTableData(true);
  };

  useEffect(() => {
    if (isOpen) {
      getAllPatientData();
    }
  }, [isOpen]);

  // branches
  const branchLists = useGetBranchList()?.branchList?.data ?? [];

  useScrollLock(isOpen);
  return createPortal(
    <div className={`fixed inset-0 z-9999 ${isOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`popup-bg-overlay   ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`central-popup overflow-auto max-h-[calc(100vh-20px)] w-[92vw] lg:min-w-7xl  ${isOpen ? "opacity-full" : ""}`}
      >
        <div className="popup-header">
          <h2 className="popup-helper-text">Search Old Patient</h2>
          <button onClick={closeHandler} className="close-drawer-btn">
            ×
          </button>
        </div>

        {!!selectionErrorMessage && <ErrorMessage text={selectionErrorMessage} />}
        <div className="flex flex-col mb-4  ">
          {/* form data */}
          <form id="searchPatientForm" className="form-grid-6" onSubmit={formSubmitHandler}>
            <InputField label="Branches">
              <select
                className="input-field"
                name="branch"
                value={formData.branchId}
                onChange={handleInputChange}
              >
                <option>--Select--</option>
                {branchLists.map((b: BranchItem) => (
                  <option key={b?.branchId} value={b?.branchId}>
                    {b?.branchName}
                  </option>
                ))}
              </select>
            </InputField>
            <InputField label="UHID">
              <input
                className="input-field"
                placeholder="Enter UHID number"
                name="uhid"
                value={formData.uhid}
                onChange={handleInputChange}
              />
            </InputField>

            <InputField label="IPD Number">
              <input
                className="input-field"
                placeholder="Enter IPD number"
                name="ipdNo"
                value={formData.ipdNo}
                onChange={handleInputChange}
              />
            </InputField>

            <InputField label="First Name">
              <input
                className="input-field"
                placeholder="Enter first name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </InputField>

            <InputField label="Middle Name">
              <input
                className="input-field"
                placeholder="Enter middle name"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
              />
            </InputField>

            <InputField label="Last Name">
              <input
                className="input-field"
                placeholder="Enter last name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </InputField>

            <InputField label="Relative Name">
              <input
                className="input-field"
                placeholder="Enter relative name"
                name="relativeName"
                value={formData.relativeName}
                onChange={handleInputChange}
              />
            </InputField>

            <InputField label="Contact Number">
              <input
                className="input-field"
                placeholder="Enter contact number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
              />
            </InputField>

            <InputField label="Emergency Contact Number">
              <input
                className="input-field"
                placeholder="Enter emergency contact number"
                name="emergencyContactNumber"
                value={formData.emergencyContactNumber}
                onChange={handleInputChange}
              />
            </InputField>

            <InputField label="Date of Birth">
              <CustomDateInput
                name="dob"
                value={formData.dob}
                max={today}
                onChange={(value: string) => handleDateChange("dob", value)}
              />
            </InputField>

            <InputField label="Address">
              <input
                className="input-field"
                placeholder="Enter address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </InputField>

            <InputField label="Registration Date">
              <CustomDateInput
                name="registrationDate"
                value={formData.registrationDate}
                onChange={(value: string) => handleDateChange("registrationDate", value)}
              />
            </InputField>
          </form>
          <div className="flex justify-center items-center  ">
            <button type="submit" form="searchPatientForm" className="save-btn -mt-3">
              Search
            </button>
          </div>
        </div>

        {/* table */}
        {!!isTableData && showTable && (
          <Animation isOpen={showTable}>
            <div className="table-container ">
              <div className="table-scroll-wrapper ">
                <div className="table-size lg:min-h-110  lg:max-h-110">
                  <table className="base-table ">
                    <thead className="table-head">
                      <tr>
                        {PatientSearchResultTableHeader.map((h, index) => (
                          <th key={index} className="table-th ">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {searchPatientDataList?.length === 0 && (
                        <tr>
                          <td
                            colSpan={PatientSearchResultTableHeader.length}
                            className="table-empty"
                          >
                            No patient records found
                          </td>
                        </tr>
                      )}

                      {searchPatientDataList.map((item, idx) => (
                        <tr
                          key={idx}
                          className="table-row cursor-pointer"
                          onDoubleClick={() => selectPatientHandler(item)}
                        >
                          <td className="table-td">{idx + 1}</td>
                          <td className="table-td">{item?.title || "-"}</td>
                          <td className="table-td max-w-50 wrap-break-word">
                            {item?.patientName || "-"}
                          </td>
                          <td className="table-td">{item?.uhid || "-"}</td>
                          <td className="table-td">{item?.dob || "-"}</td>
                          <td className="table-td">{item?.gender || "-"}</td>
                          <td className="table-td">{item?.relativeName || "-"}</td>
                          <td className="table-td">{item?.contactNumber || "-"}</td>
                          <td className="table-td max-w-40 wrap-break-word">
                            {item?.fullAddress || "-"}
                          </td>
                          <td className="table-td">{item?.registrationDate || "-"}</td>
                          <td className="table-td">{item?.ipdNo || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* <p className="input-field-error font-semibold text-center">
                💠 Please double click to select a patient
              </p> */}
            </div>
          </Animation>
        )}
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}
    </div>,
    document.body
  );
};

export default SearchPatientPopup;
