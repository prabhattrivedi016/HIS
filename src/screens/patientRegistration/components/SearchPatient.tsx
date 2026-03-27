import InputField from "@/components/customInputField";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError } from "@/utils/alert";
import { Dispatch, KeyboardEvent, SetStateAction } from "react";
import { useFormContext } from "react-hook-form";
import { PatientDataItem } from "../types";

type SearchPatientProps = {
  setPatient: Dispatch<SetStateAction<PatientDataItem | null>>;
};

const SearchPatient = ({ setPatient }: SearchPatientProps) => {
  const { error, fetchApi } = useGlobalApi();
  const { register, getValues } = useFormContext();

  const dataFetchingHandler = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    const { SearchBy, SearchValue, UhidOrBarcode } = getValues();

    let params: Record<string, string> = {};

    if (UhidOrBarcode) {
      params.uhid = UhidOrBarcode;
    } else {
      if (!SearchBy || !SearchValue) {
        return;
      }

      switch (SearchBy) {
        case "patientId":
          if (isNaN(Number(SearchValue))) {
            console.error("Patient ID must be a number");
            return;
          }
          params.patientId = SearchValue;
          break;

        case "uhid":
          params.uhid = SearchValue;
          break;

        case "contactNumber":
          params.contactNumber = SearchValue;
          break;

        default:
          console.warn("Invalid SearchBy");
          return;
      }
    }

    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_MASTER,
      {},
      { params },
      { component: "SearchPatientOfPatientRegistration" }
    );

    if (!resp?.result) {
      showError(error?.message ?? "No data found! Please Enter correct data");
      return;
    }
    setPatient(resp?.data?.[0] ?? null);
    console.log("resp", resp?.data);
  };

  return (
    <div className="form-grid-3 card">
      {/* 🔹 UHID / Barcode */}
      <InputField label="UHID / Barcode">
        <input
          className="input-field"
          placeholder="Enter UHID No and Press Enter to search"
          {...register("UhidOrBarcode")}
          onKeyDown={dataFetchingHandler}
        />
      </InputField>

      {/* 🔹 Search By */}
      <InputField label="Search By">
        <select className="input-field" {...register("SearchBy")}>
          <option value="">Select</option>
          <option value="patientId">Patient Id</option>
          <option value="uhid">UHID</option>
          <option value="contactNumber">Contact Number</option>
        </select>
      </InputField>

      {/* 🔹 Search Value */}
      <InputField label="Search Value">
        <input
          className="input-field"
          placeholder="Enter Search Value and Press Enter to search"
          {...register("SearchValue")}
          onKeyDown={dataFetchingHandler}
        />
      </InputField>
    </div>
  );
};

export default SearchPatient;
