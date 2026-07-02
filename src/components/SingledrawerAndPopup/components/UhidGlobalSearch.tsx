import InputField from "@/components/customInputField";
import CustomLoader from "@/components/customLoader";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showWarning } from "@/utils/alert";
import { Search } from "lucide-react";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { UhidGlobalSearchProps } from "../types";

const resolvePatientIdFromSearchData = (data: unknown): number => {
  if (!data) return 0;

  if (Array.isArray(data)) {
    const first = data[0] as Record<string, unknown> | undefined;
    return Number(first?.patientId ?? first?.PatientId ?? 0);
  }

  if (typeof data === "object") {
    const item = data as Record<string, unknown>;
    return Number(item.patientId ?? item.PatientId ?? 0);
  }

  return 0;
};

const UhidGlobalSearch = ({
  onPatientSelect,
  minSearchLength = 1,
  placeholder = "Enter UHID & press Enter to search",
  className = "",
  resetKey = 0,
}: UhidGlobalSearchProps) => {
  const { loading, fetchApi } = useGlobalApi();
  const [searchUhid, setSearchUhid] = useState("");
  const onPatientSelectRef = useRef(onPatientSelect);
  const isSearchingRef = useRef(false);

  onPatientSelectRef.current = onPatientSelect;

  useEffect(() => {
    setSearchUhid("");
  }, [resetKey]);

  const searchPatientByUhid = async (uhid: string) => {
    const trimmedUhid = uhid.trim();

    if (!trimmedUhid) {
      showWarning("UHID is required");
      return;
    }

    if (trimmedUhid.length < minSearchLength) {
      showWarning(`UHID must be at least ${minSearchLength} characters`);
      return;
    }

    if (isSearchingRef.current) return;
    isSearchingRef.current = true;

    try {
      const searchResp = await fetchApi(
        "GET",
        ENDPOINTS.SEARCH_PATIENT_MASTER,
        {},
        { params: { uhid: trimmedUhid } },
        { component: "UhidGlobalSearch", silent: true }
      );

      if (!searchResp?.result) {
        showWarning(searchResp?.message ?? "Patient not found");
        return;
      }

      const patientId = resolvePatientIdFromSearchData(searchResp?.data);

      if (!patientId) {
        showWarning("Patient not found");
        return;
      }

      const canProceed = await onPatientSelectRef.current?.(patientId);
      if (canProceed !== false) {
        setSearchUhid("");
      }
    } finally {
      isSearchingRef.current = false;
    }
  };

  const uhidChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchUhid(e.target.value);
  };

  const uhidKeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    void searchPatientByUhid(searchUhid);
  };

  return (
    <>
      <div className={`w-full flex justify-center ${className}`.trim()}>
        <InputField>
          <div className="relative w-64">
            <Search
              size={18}
              className="absolute left-3 top-5 z-10 -translate-y-1/2 text-gray-500 pointer-events-none"
            />

            <input
              type="text"
              value={searchUhid}
              className="input-field w-full pl-10!"
              placeholder={placeholder}
              onChange={uhidChangeHandler}
              onKeyDown={uhidKeyDownHandler}
            />
          </div>
        </InputField>
      </div>

      {loading && <CustomLoader isLoading={loading} />}
    </>
  );
};

export default UhidGlobalSearch;
