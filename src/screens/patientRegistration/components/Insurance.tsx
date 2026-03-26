import CustomDateInput from "@/components/customDateInput";
import InputField from "@/components/customInputField";
import { ENDPOINTS } from "@/config/defaults";
import { BranchId } from "@/constants/constants";
import useGetBranchList from "@/hooks/useGetBranchList";
import useGlobalApi from "@/hooks/useGlobalApi";
import { ChangeEvent, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { CorporateItem, InsuranceItem } from "../types";

type InsuranceProps = {
  resetSignal?: number;
};

const Insurance = ({ resetSignal = 0 }: InsuranceProps) => {
  const { loading, error, fetchApi } = useGlobalApi();
  const { branchList } = useGetBranchList();
  const branches = branchList?.data ?? [];

  const [insuranceList, setInsuranceList] = useState<InsuranceItem[]>([]);

  const [selectedInsurance, setSelectedInsurance] = useState<number | null>(null);
  const [corporateList, setCorporateList] = useState<CorporateItem[]>([]);

  // api call
  const getInsurance = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_INSURANCE_COMPANY_LIST,
      {},
      {},
      { component: "PatientRegistrationInsurance" }
    );
    setInsuranceList(resp?.data ?? []);
  };

  useEffect(() => {
    getInsurance();
  }, []);

  const {
    register,
    watch,
    setValue,

    formState: { errors },
  } = useFormContext();

  const insuranceCompanyReg = register("InsuranceCompanyId");
  const expiryDate = watch("ExpiryDate");
  const referalDate = watch("ReferalDate") || watch("ReferralDate");

  useEffect(() => {
    if (!branches.length) return;

    const defaultBranch = branches.find(b => b?.branchId === BranchId?.DEFAULT);

    if (defaultBranch) {
      setValue("BranchId", defaultBranch.branchId);
    }
  }, [branches, setValue]);

  useEffect(() => {
    setSelectedInsurance(null);
    setCorporateList([]);

    const defaultBranch = branches.find(b => b?.branchId === BranchId?.DEFAULT);
    if (defaultBranch) {
      setValue("BranchId", defaultBranch.branchId, { shouldValidate: false, shouldDirty: false });
    }
  }, [resetSignal, branches, setValue]);

  // insurance select handler
  const insuranceSelectHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    insuranceCompanyReg.onChange(e);
    const insuranceId = Number(e.target.value);
    if (!insuranceId) {
      setSelectedInsurance(null);
      setCorporateList([]);
      setValue("CorporateId", "");
      return;
    }
    setSelectedInsurance(insuranceId);

    getCorporate(insuranceId);
  };

  // corporate
  const getCorporate = async (insuranceId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_LIST_BY_INSURANCE_COMPANY_ID,
      {},
      { params: { insuranceCompanyId: insuranceId } },
      { component: "PatientRegistrationInsurance" }
    );
    setCorporateList(resp?.data ?? []);
  };
  return (
    <div className="form-grid-3 card -mt-3 mb-0">
      <InputField label="Insurance Company">
        <select className="input-field" {...insuranceCompanyReg} onChange={insuranceSelectHandler}>
          <option value="">Select</option>
          {insuranceList?.map(i => (
            <option key={i?.insuranceCompanyId} value={i?.insuranceCompanyId}>
              {i?.insuranceCompanyName}
            </option>
          ))}
        </select>
      </InputField>
      <InputField label="Corporate">
        <select className="input-field" {...register("CorporateId")}>
          <option>Select</option>
          {corporateList?.map(c => (
            <option key={c?.corporateId} value={c?.corporateId}>
              {c?.corporateName}
            </option>
          ))}
        </select>
      </InputField>
      <InputField label="Card/ Policy no">
        <input
          type="text"
          className="input-field"
          placeholder="Enter card or policy no"
          {...register("CardNo")}
        />
      </InputField>
      <InputField label="Policy no">
        <input
          type="text"
          className="input-field"
          placeholder="Enter policy number"
          {...register("PolicyNo")}
        />
      </InputField>

      {!!selectedInsurance && (
        <>
          {" "}
          <InputField label="Policy Card no">
            <input
              type="text"
              className="input-field"
              placeholder="Enter policy number"
              {...register("PolicyCardNo")}
            />
          </InputField>
          <InputField label="Expiry Date">
            <CustomDateInput
              value={expiryDate || ""}
              onChange={date => {
                setValue("ExpiryDate", date, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            />
          </InputField>
          <InputField label="Card Holder">
            <input
              type="text"
              className="input-field"
              placeholder="Enter card holder name"
              {...register("CardHolder")}
            />
          </InputField>
          <InputField label="Referral No.">
            <input
              type="text"
              className="input-field"
              placeholder="Enter referral number"
              {...register("ReferalNo")}
            />
          </InputField>
          <InputField label="Referral date">
            <CustomDateInput
              value={referalDate || ""}
              onChange={date => {
                setValue("ReferalDate", date, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                setValue("ReferralDate", date, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            />
          </InputField>{" "}
        </>
      )}

      <InputField label="Branch" required>
        <select className="input-field" {...register("BranchId", { valueAsNumber: true })}>
          <option value="">Select</option>
          {branches.map(item => (
            <option key={item?.branchId} value={item?.branchId}>
              {item?.branchName}
            </option>
          ))}
        </select>
        {errors.BranchId && <p className="input-field-error">{String(errors.BranchId.message)}</p>}
      </InputField>
    </div>
  );
};

export default Insurance;
