import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { SelectStyles } from "@/components/customSelect";
import SubmitButton from "@/components/globalButtons/SubmitButton";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { OptionItem, SelectItem } from "@/types";
import { showSuccess, showWarning } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { DoctorItem, IpdPatientItem, PreviousDoctorListItem } from "../types";

const DoctorTransfer = ({ patient }: { patient: IpdPatientItem }) => {
  const { loading, fetchApi } = useGlobalApi();
  console.log("patient", patient);

  const [selectedPrimaryDoctor, setSelectedPrimaryDoctor] = useState<SelectItem | null>(null);
  const [selectedSecondaryDoctors, setSelectedSecondaryDoctors] = useState<readonly SelectItem[]>(
    []
  );

  //   doctor
  const getDoctorByBranchId = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_MASTER_LIST_BY_BRANCH_ID,
      {},
      { params: { branchId: patient?.BranchId, isDoctorUnit: 0 } },
      { component: "IpdBillingComponent" }
    );
    return resp?.data ?? [];
  };

  const { data: doctorLists } = useQuery({
    queryKey: ["doctor-lists"],
    queryFn: getDoctorByBranchId,
    enabled: !!patient?.BranchId,
  });

  const doctorSelectOption = useMemo(() => {
    return doctorLists?.map((doctor: DoctorItem) => ({
      value: doctor.doctorId,
      label: doctor.name,
    }));
  }, [doctorLists]);

  const secondarySelectOption = useMemo(() => {
    return doctorSelectOption?.filter(
      (d: OptionItem) => Number(d?.value) !== Number(selectedPrimaryDoctor?.value)
    );
  }, [doctorSelectOption, selectedPrimaryDoctor]);

  useEffect(() => {
    const docId = Number(patient?.DoctorNumber);

    if (docId && doctorSelectOption) {
      const match = doctorSelectOption.find((opt: any) => Number(opt.value) === Number(docId));
      if (match) {
        setSelectedPrimaryDoctor(match);
      }
    }
  }, [patient, doctorSelectOption]);

  const primaryDoctorChangeHandler = (option: SelectItem | null) => {
    setSelectedPrimaryDoctor(option);
  };

  const secondaryDoctorChangeHandler = (options: any) => {
    setSelectedSecondaryDoctors(options || []);
  };

  const transferDoctorHandler = async () => {
    if (!selectedPrimaryDoctor) {
      showWarning("Please select a primary doctor");
      return;
    }

    const payload = {
      primaryDoctorId: Number(selectedPrimaryDoctor.value),
      secondaryDoctorIds: selectedSecondaryDoctors.map(opt => Number(opt.value)),
      visitId: patient?.VisitId,
      branchId: patient?.BranchId,
    };

    if (payload?.primaryDoctorId === 0) {
      showWarning("Please select primary doctor!");
      return;
    }

    const resp = await fetchApi(
      "PATCH",
      ENDPOINTS.TRANSFER_IPD_PATIENT_DOCTOR,
      payload,
      {},
      { component: "DoctorTransfer" }
    );

    if (!resp?.result) {
      showWarning(resp?.message ?? "Error while transferring doctor");
      return;
    }

    showSuccess(resp?.message ?? "Doctor transferred successfully");
    setSelectedSecondaryDoctors([]);
    doctorHistoryRefetch?.();
  };

  //   get previous doctor list (history)
  const getPreviousDoctors = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_IPD_PATIENT_DOCTOR_HISTORY,
      {},
      { params: { visitId: patient?.VisitId } },
      { component: "DoctorTransfer" }
    );
    return resp?.data ?? [];
  };

  const { data: previousDoctorList = [], refetch: doctorHistoryRefetch } = useQuery({
    queryKey: ["previousDoctorList", patient?.VisitId],
    queryFn: getPreviousDoctors,
    enabled: !!patient?.VisitId,
  });

  return (
    <div>
      <h3 className="ipd-billing-text">Doctor Transfer</h3>
      <div className="form-grid-4">
        <InputField label=" Primary Doctor">
          <Select
            options={doctorSelectOption}
            name="primaryDoctor"
            value={selectedPrimaryDoctor}
            onChange={primaryDoctorChangeHandler}
            placeholder="Select Doctor"
            styles={SelectStyles as any}
            isSearchable
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </InputField>
        <InputField label="Secondary Doctor">
          <Select
            options={secondarySelectOption}
            name="secondaryDoctors"
            isMulti
            value={selectedSecondaryDoctors as any}
            onChange={secondaryDoctorChangeHandler}
            placeholder="Select Doctor(s)"
            styles={SelectStyles as any}
            isSearchable
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </InputField>
      </div>
      <div className="form-actions-responsive mt-5">
        <SubmitButton label="Transfer" onClick={transferDoctorHandler} />
      </div>
      {!!loading && <CustomLoader isLoading={loading} />}

      <h3 className="ipd-billing-text mt-8 mb-3">Doctor Transfer History</h3>
      <div className="overflow-x-auto">
        <div className="table-container">
          <div className="table-scroll-wrapper">
            <div className="table-size w-full lg:max-h-100">
              <table className="base-table">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">#</th>
                    <th className="table-th">Doctor Name</th>
                    <th className="table-th">Admitted By</th>
                    <th className="table-th">Admitted On</th>
                    <th className="table-th">Transferred By</th>
                    <th className="table-th">Transferred On</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previousDoctorList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="table-empty text-center py-4">
                        No transfer history found
                      </td>
                    </tr>
                  )}
                  {previousDoctorList.map((item: PreviousDoctorListItem, index: number) => (
                    <tr
                      key={index}
                      className={`table-row ${item.IsCurrent === 1 ? "bg-green-300 text-green-800" : ""}`}
                    >
                      <td className="table-td">{index + 1}</td>
                      <td className="table-td">{item.DoctorName || "-"}</td>
                      <td className="table-td">{item.AdmittedBy || "-"}</td>
                      <td className="table-td">{item.AdmittedOn || "-"}</td>
                      <td className="table-td">{item.TransferedBy || "-"}</td>
                      <td className="table-td">{item.TransferedOn || "-"}</td>
                      <td className="table-td">
                        {item.IsCurrent === 1 ? (
                          <span className="badge badge-success text-green-600 font-semibold bg-green-100 px-2 py-1 rounded">
                            Current
                          </span>
                        ) : (
                          <span className="badge badge-secondary text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded">
                            Transferred
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorTransfer;
