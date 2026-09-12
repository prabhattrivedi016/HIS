import CentralPopup from "@/components/centralPopup";
import InputField from "@/components/customInputField";
import RemoveIconButton from "@/components/globalButtons/RemoveIconButton";
import { ENDPOINTS } from "@/config/defaults";
import { BranchContext } from "@/context/BranchContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import {
  CorpoarteItem,
  DischargeProcessItem,
  InsuranceListItem,
  MappedCorporateItem,
} from "../types";

const CorporateMapping = ({
  isOpen,
  onClose,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: DischargeProcessItem;
}) => {
  const { loading, fetchApi } = useGlobalApi();
  const branchId = useContext(BranchContext)?.branchId ?? 1;

  const [selectedInsurance, setSelectedInsurance] = useState<InsuranceListItem | null>(null);
  const [selectedCorporate, setSelectedCorporate] = useState<CorpoarteItem | null>(null);

  const [mappedCorporateLists, setMappedCorporateLists] = useState<MappedCorporateItem[]>([]);

  console.log("mappedCorporateLists", mappedCorporateLists);

  // insurance company lists
  const getInsuranceLists = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_ALL_INSURANCE_COMPANY_LIST,
      {},
      {},
      { component: "CorporateMapping" }
    );
    return resp?.data ?? [];
  };

  const { data: insuranceLists } = useQuery({
    queryKey: ["insuranceLists"],
    queryFn: getInsuranceLists,
    enabled: isOpen,
  });

  // insurance select handler

  const handleInsuranceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setSelectedCorporate(null);
    const matched = insuranceLists?.find((i: InsuranceListItem) => i?.insuranceCompanyId === value);
    setSelectedInsurance(matched ?? null);
  };

  // get corporate lists
  const getCorporateList = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_CORPORATE_LIST_BY_BRANCH_ID_AND_INSURANCE_COMPANY_ID,
      {},
      { params: { branchId, insuranceCompanyId: selectedInsurance?.insuranceCompanyId ?? 0 } },
      { component: "CorporateMapping" }
    );
    return resp?.data ?? [];
  };

  const { data: corporateList } = useQuery({
    queryKey: ["corporateList", branchId, selectedInsurance?.insuranceCompanyId],
    queryFn: getCorporateList,
    enabled: !!selectedInsurance,
  });

  // insurance select handler

  const handleCorpoarteChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    const matched = corporateList?.find((i: CorpoarteItem) => i?.corporateId === value);
    setSelectedCorporate(matched ?? null);
  };

  // corporate mapping lists list

  const getDischargeCorporateMapping = async () => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DISCHARGE_PROCESS_CORPORATE_MAPPING,
      {},
      { params: { dischargeProcessId: item?.DischargeProcessId } },
      { component: "CorporateMapping" }
    );
    return resp?.data ?? [];
  };

  const { data: corporateMapping, refetch: refetchCorporateMapping } = useQuery({
    queryKey: ["dischargeCorporateMapping", item?.DischargeProcessId],
    queryFn: getDischargeCorporateMapping,
    enabled: isOpen && !!item?.DischargeProcessId,
  });

  useEffect(() => {
    if (corporateMapping) {
      setMappedCorporateLists(corporateMapping);
    }
  }, [corporateMapping]);

  // add corporate
  const addCorporateHandler = () => {
    if (!selectedCorporate?.corporateId) {
      showWarning("Please select a corporate");
      return;
    }

    setMappedCorporateLists(prev => {
      const corporateId = Number(selectedCorporate.corporateId);

      // Check duplicate
      const exists = prev.some(corporate => Number(corporate?.CorporateId) === corporateId);

      if (exists) {
        showWarning("Corporate already exists");
        return prev;
      }

      // Create exactly one table record
      const newRecord: MappedCorporateItem = {
        DischargeProcessCorporateMappingId: 0,
        DischargeProcessId: Number(item?.DischargeProcessId) || 0,
        ProcessKey: item?.ProcessKey || "",
        ProcessName: item?.ProcessName || "",
        CorporateId: corporateId,
        CorporateName: selectedCorporate?.corporateName || "",
        InsuranceCompanyName: selectedInsurance?.insuranceCompanyName || "",
      };

      return [...prev, newRecord];
    });

    // Clear selections after adding
    setSelectedCorporate(null);
  };

  // remove corporate handler
  const removeCorporateHandler = (selectedItem: MappedCorporateItem) => {
    console.log("selectedItem", selectedItem);
    setMappedCorporateLists(prev =>
      prev.filter(
        (corporate: MappedCorporateItem) =>
          Number(corporate?.CorporateId) !== Number(selectedItem?.CorporateId)
      )
    );
  };

  // create payload
  const createPayload = () => {
    return {
      dischargeProcessId: item?.DischargeProcessId,
      corporateIds: mappedCorporateLists.map(
        (item: CorpoarteItem | MappedCorporateItem) => item?.CorporateId
      ),
    };
  };

  // save corporate mapping handler
  const saveCorporateMappingHandler = async () => {
    const payload = createPayload();
    if (payload?.corporateIds?.length === 0) {
      showWarning("Please select at least one corporate");
      return;
    }
    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_DISCHARGE_PROCESS_CORPORATE_MAPPING,
      payload,
      {},
      { component: "CorporateMapping" }
    );
    if (!resp?.result) {
      showError(resp?.message ?? "Failed while mapping corporate");
      return;
    }
    showSuccess(resp?.message ?? "Corporate mapped successfully");
    onClose();
    setSelectedInsurance(null);
    setSelectedCorporate(null);
    refetchCorporateMapping();
  };

  return (
    <CentralPopup isOpen={isOpen} onClose={onClose} title="Map Corporate" className="lg:min-w-150">
      <div>
        {/* <h1>Discharge Process: {item?.ProcessName}</h1> */}
        <div className="flex flex-row">
          <h3 className="name-header">Discharge Process : </h3> <span>{item?.ProcessName}</span>
        </div>
        <div className="form-grid-2 gap-4">
          <InputField label="Insurance">
            <select className="input-field" onChange={handleInsuranceChange}>
              <option value="">Select Insurance</option>
              {insuranceLists?.map((insurance: InsuranceListItem) => (
                <option key={insurance?.insuranceCompanyId} value={insurance?.insuranceCompanyId}>
                  {insurance?.insuranceCompanyName}
                </option>
              ))}
            </select>
          </InputField>
          <InputField label="Corporate">
            <select className="input-field" onChange={handleCorpoarteChange}>
              <option>Select Corporate</option>
              {corporateList?.map((corporate: CorpoarteItem) => (
                <option key={corporate?.corporateId} value={corporate?.corporateId}>
                  {corporate?.corporateName}
                </option>
              ))}
            </select>
          </InputField>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full lg:col-start-4 mt-4">
            <button className="save-btn" onClick={addCorporateHandler}>
              Add
            </button>
          </div>
        </div>
        {/* table */}
        <div>
          <div className="table-container ">
            <div className="table-scroll-wrapper">
              <div className="table-size lg:min-h-40 lg:max-h-60 ">
                <table className="base-table ">
                  <thead className="table-head">
                    <tr>
                      <th className="table-th">#</th>
                      <th className="table-th">Insurance Name</th>
                      <th className="table-th">Corporate Name</th>
                      <th className="table-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappedCorporateLists?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="table-empty">
                          No records found
                        </td>
                      </tr>
                    )}
                    {mappedCorporateLists?.map((item: MappedCorporateItem, index: number) => (
                      <tr key={index}>
                        <td className="table-td">{index + 1}</td>

                        <td className="table-td">{item?.InsuranceCompanyName || "-"}</td>

                        <td className="table-td">{item?.CorporateName || "-"}</td>

                        <td className="table-td">
                          <RemoveIconButton onClick={() => removeCorporateHandler(item)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-end gap-2 w-full w-30">
            <button className="save-btn " onClick={saveCorporateMappingHandler}>
              Map
            </button>
          </div>
        </div>
      </div>
    </CentralPopup>
  );
};

export default CorporateMapping;
