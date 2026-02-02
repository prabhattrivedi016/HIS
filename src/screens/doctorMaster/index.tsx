import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import InputField from "../../components/customInputField";
import CustomLoader from "../../components/customLoader";
import { SelectStyles } from "../../components/customSelect";
import { ENDPOINTS } from "../../config/defaults";
import useGlobalApi from "../../hooks/useGlobalApi";
import DoctorMasterPopup from "./components/DoctorMasterPopup";
import { DepartmentItem, SelectItem, SpecializationItem } from "./types";

const DoctorMaster = () => {
  const { loading, error, fetchApi } = useGlobalApi();

  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [specializationId, setSpecializationId] = useState<number | null>(null);

  const [departmentList, setDepartmentList] = useState<DepartmentItem[]>([]);
  const [specializationList, setSpecializationList] = useState<SpecializationItem[]>([]);

  const [selectedDepartmentOption, setSelectedDepartmentOption] = useState<SelectItem | null>(null);
  const [selectedSpecializationOption, setSelectedSpecializationOption] =
    useState<SelectItem | null>(null);

  const [popUpOpen, setPopUpOpen] = useState<boolean>(false);
  const [popupType, setPopupType] = useState<"department" | "specialization" | null>(null);
  const [popupData, setPopupData] = useState<DepartmentItem | SpecializationItem | null>(null);

  /*------------------------------department--------------------------- */
  const getDepartmentLists = async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_DOCTOR_DEPARTMENT_LIST, {}, {});
    const data = resp?.data ?? [];
    setDepartmentList(data);
    return data;
  };

  const departmentSelectOption = useMemo(() => {
    return departmentList.map(item => ({
      value: item?.departmentId,
      label: item?.department,
    }));
  }, [departmentList]);

  const selectDepartmentHandler = (option: SelectItem | null) => {
    setSelectedDepartmentOption(option);
    setDepartmentId(option ? option?.value : null);
  };

  /*-------------------------------specialization------------------- */
  const getSpecializationLists = async () => {
    const resp = await fetchApi("GET", ENDPOINTS.GET_DOCTOR_SPECIALIZATION_LIST, {}, {});
    const data = resp?.data ?? [];
    setSpecializationList(data);
    return data;
  };

  const specializationSelectOption = useMemo(() => {
    return specializationList.map(item => ({
      value: item?.specializationId,
      label: item?.specialization,
    }));
  }, [specializationList]);

  useEffect(() => {
    getDepartmentLists();
    getSpecializationLists();
  }, []);

  const selectSpecializationHandler = (option: SelectItem | null) => {
    setSelectedSpecializationOption(option);
    setSpecializationId(option ? option?.value : null);
  };

  const popupHandler = (type: "department" | "specialization") => {
    let data: DepartmentItem | SpecializationItem | null = null;

    if (type === "department" && departmentId) {
      data = departmentList.find(d => d.departmentId === departmentId) || null;
    } else if (type === "specialization" && specializationId) {
      data = specializationList.find(s => s.specializationId === specializationId) || null;
    }

    setPopupType(type);
    setPopupData(data);
    setPopUpOpen(true);
  };

  const closePopup = () => {
    setPopUpOpen(false);
    setPopupType(null);
    setPopupData(null);
  };

  const refreshData = async () => {
    const d = await getDepartmentLists();
    const s = await getSpecializationLists();

    if (departmentId) {
      const found = d?.find((i: DepartmentItem) => i.departmentId === departmentId);
      setSelectedDepartmentOption(
        found ? { value: found.departmentId, label: found.department } : null
      );
    }

    if (specializationId) {
      const found = s?.find((i: SpecializationItem) => i.specializationId === specializationId);
      setSelectedSpecializationOption(
        found ? { value: found.specializationId, label: found.specialization } : null
      );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen px-3 py-4 -mt-5">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900"> Doctor Master</h1>
        <nav className="text-sm text-gray-500 flex  gap-2 mt-1">
          <NavLink to="/dashboard" className="hover:underline">
            Home
          </NavLink>
          <span>››</span>
          <span>Doctor Master</span>
        </nav>
      </div>
      <div className=" shadow-lg m-2 p-6 rounded-lg   ">
        <h1 className="mb-4 text-xl font-semibold">Doctor Details</h1>
        <div className="form-grid-4">
          <InputField label="Title" required>
            <select className="input-field">
              <option value="">Select</option>
              <option value="">Dr.</option>
              <option value="">Mr.</option>
              <option value="">Mrs.</option>
              <option value="">Ms.</option>
            </select>
          </InputField>

          <InputField label="Doctor Name" required>
            <input type="text" className="input-field" placeholder="Enter Doctor Name.." />
          </InputField>
          <InputField label="Gender" required>
            <select className="input-field">
              <option value="">Select</option>
              <option value="">Male</option>
              <option value="">Female</option>
            </select>
          </InputField>
          <InputField label="Contact No." required>
            <input type="text" className="input-field" placeholder="Enter Contact No.." />
          </InputField>
          <InputField label="Email">
            <input type="email" className="input-field" placeholder="Enter Email.." />
          </InputField>
          <InputField label="Address">
            <input type="text" className="input-field" placeholder="Enter Address.." />
          </InputField>
          <InputField label="DOB" required>
            <input type="date" className="input-field" />
          </InputField>
          <InputField label="Specialization" required>
            <div className="flex gap-2 items-center">
              <Select
                options={specializationSelectOption}
                value={selectedSpecializationOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={selectSpecializationHandler}
                classNames={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <button onClick={() => popupHandler("specialization")} className="active:scale-95">
                <i className="fa-solid fa-circle-plus fa-xl"></i>
              </button>
            </div>
          </InputField>
          <InputField label="Department" required>
            <div className="flex gap-2 items-center">
              <Select
                options={departmentSelectOption}
                value={selectedDepartmentOption}
                placeholder="Select..."
                isSearchable
                isClearable
                onChange={selectDepartmentHandler}
                classNames={SelectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <button onClick={() => popupHandler("department")} className="active:scale-95">
                <i className="fa-solid fa-circle-plus fa-xl"></i>
              </button>
            </div>
          </InputField>

          <InputField label="Profile Summary" required>
            <input className="input-field" placeholder="Enter Profile Summary.." />
          </InputField>
          <InputField label="Registration No." required>
            <input type="text" className="input-field" placeholder="Enter Registration No.." />
          </InputField>
          <InputField label="Status" required>
            <select className="input-field">
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </InputField>
          <InputField label="OPD Room">
            <input type="text" className="input-field" placeholder="Enter OPD Room No.." />
          </InputField>
          <InputField label="Can Approve Lab Reports">
            <select className="input-field">
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </InputField>
          <InputField label="Can Approve Discharge Summary">
            <select className="input-field">
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </InputField>
          <InputField label="Upload Doctor Photo">
            <input type="number" className="input-field" placeholder="Enter Consultation Fee.." />
          </InputField>
        </div>
      </div>
      {popUpOpen && popupType && (
        <DoctorMasterPopup
          isOpenTab={popUpOpen}
          headerName={
            popupData
              ? `Update ${popupType.charAt(0).toUpperCase() + popupType.slice(1)}`
              : `Create ${popupType.charAt(0).toUpperCase() + popupType.slice(1)}`
          }
          onCloseTab={closePopup}
          type={popupType}
          data={popupData}
          onSuccess={refreshData}
        />
      )}

      {loading ? <CustomLoader isLoading={loading} /> : <></>}
    </div>
  );
};

export default DoctorMaster;
