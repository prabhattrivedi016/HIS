import CentralPopup from "@/components/centralPopup";
import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import { SelectStyles } from "@/components/customSelect";
import { ENDPOINTS } from "@/config/defaults";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useScrollLock } from "@/hooks/useScrollLock";
import { OptionItem } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Select, { StylesConfig } from "react-select";

const OpdAppointmentConfirmationPopup = ({ isOpen, onClose, onApply, initialValues }) => {
  const branchList = useGetBranchList()?.branchList?.data ?? [];
  const [filterValues, setFilterValues] = useState(initialValues);

  const { fetchApi } = useGlobalApi();
  const getDoctorList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER,
      {},
      { params: { isActive: 1, isDoctorUnit: 0 } },
      { component: "OpdAppointmentConfirmationPopup" }
    );
    return resp?.data ?? [];
  };
  const { data: doctorLists = [] } = useQuery({
    queryKey: ["getDoctorList"],
    queryFn: getDoctorList,
  });
  const doctorSelectOption = useMemo(() => {
    if (!doctorLists) return [];
    return doctorLists.map((d: any) => ({
      value: d?.doctorId,
      label: d?.completeName || d?.name || "",
    }));
  }, [doctorLists]);
  const selectedDoctor = useMemo(() => {
    return doctorSelectOption.find((opt: any) => opt.value === filterValues.doctorId) || null;
  }, [doctorSelectOption, filterValues.doctorId]);
  const doctorChangeHandler = (val: OptionItem | null) => {
    setFilterValues(prev => ({
      ...prev,
      doctorId: val ? Number(val.value) : 0,
    }));
  };

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setFilterValues(initialValues);
    }
  }, [isOpen, initialValues]);

  const branchChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterValues(prev => ({
      ...prev,
      branchId: Number(e.target.value),
    }));
  };

  const fromDateChangeHandler = (value: string) => {
    setFilterValues(prev => ({ ...prev, fromDate: value }));
  };

  const toDateChangeHandler = (value: string) => {
    setFilterValues(prev => ({ ...prev, toDate: value }));
  };

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!filterValues.branchId) return;

    onApply(filterValues);
  };

  if (!isOpen) return null;

  return (
    <CentralPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Opd Appointment Confirmation Filter"
      className="lg:min-w-250"
    >
      <form onSubmit={submitHandler} className="p-2">
        <div className="form-grid-4">
          <InputField label="Branch" required>
            <select
              className="input-field"
              value={filterValues.branchId}
              onChange={branchChangeHandler}
              name="branchId"
            >
              <option value={0}>--Select--</option>
              {branchList.map(branch => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.branchName}
                </option>
              ))}
            </select>
          </InputField>

          <InputField label="Doctor">
            <Select<OptionItem, false>
              value={selectedDoctor}
              options={doctorSelectOption}
              placeholder="Select doctor"
              isSearchable
              isClearable
              onChange={doctorChangeHandler}
              styles={SelectStyles as StylesConfig<OptionItem, false>}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </InputField>

          <InputField label="From Date">
            <CustomDateInput value={filterValues.fromDate} onChange={fromDateChangeHandler} />
          </InputField>

          <InputField label="To Date">
            <CustomDateInput value={filterValues.toDate} onChange={toDateChangeHandler} />
          </InputField>
        </div>

        <div className="form-actions-responsive mt-5 flex gap-3">
          <button type="submit" className="save-btn">
            Search
          </button>
        </div>
      </form>
    </CentralPopup>
  );
};

export default OpdAppointmentConfirmationPopup;
