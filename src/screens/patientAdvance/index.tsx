import { BillingDetailsHandle } from "@/components/BillingDetails/types";
import CustomLoader from "@/components/customLoader";
import PatientAdvanceReceipt from "@/components/reportTemplates/PatientAdvanceReceipt";
import UhidGlobalSearch from "@/components/SingledrawerAndPopup/components/UhidGlobalSearch";
import { ENDPOINTS } from "@/config/defaults";
import { PageType, PatientAdvanceTabName } from "@/constants/constants";
import { AuthContext } from "@/context/AuthContext";
import { RoleContext } from "@/context/RoleContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { showError, showSuccess, showWarning } from "@/utils/alert";
import { formatApiValidationMessage } from "@/utils/errorUtils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useContext, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Buttons from "../opdBilling/components/Buttons";
import PatientData from "../patientRegistration/components/PatientData";
import SearchPatientPopup from "../patientRegistration/components/SearchPatientPopup";
import { PatientDataHandle, SearchedPatientItem } from "../patientRegistration/types";
import { registerPatientMaster } from "../patientRegistration/utils/registerPatientMaster";
import PatientAdvanceAmount from "./components/PatientAdvanceAmount";
import {
  PatientAdvancePaymentModeItem,
  PatientAdvanceReceiptItem,
  PatientAdvanceSavePayload,
} from "./types";
import { openPatientAdvanceReceiptInNewTab } from "./utils/patientAdvanceReceiptPrint";
import {
  buildPatientAdvanceSavePayload,
  getDefaultAdvanceLedgerDetails,
  normalizeAdvanceLedgerDetails,
} from "./utils/patientAdvanceUtils";

const PatientAdvance = () => {
  const [activeTab, setActiveTab] = useState<string>(PatientAdvanceTabName.PATIENT_DETAILS);
  const [patientTabError, setPatientTabError] = useState<boolean>(false);
  const { loading, fetchApi } = useGlobalApi();
  const queryClient = useQueryClient();
  const branchId = Number(useContext(AuthContext)?.user?.branchId ?? 1);
  const roleId = Number(useContext(RoleContext)?.roleId ?? 0);

  const [openSearchPatientPopup, setOpenSearchPatientPopup] = useState(false);
  const [renderSearchPatientPopup, setRenderSearchPatientPopup] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [uhidSearchResetKey, setUhidSearchResetKey] = useState(0);
  const [formResetKey, setFormResetKey] = useState(0);
  const [showTable, setShowTable] = useState(false);

  const [patientAdvanceAmount, setPatientAdvanceAmount] = useState<number>(0);

  const [receiptData, setReceiptData] = useState<PatientAdvanceReceiptItem | null>(null);
  const [paymentModes, setPaymentModes] = useState<PatientAdvancePaymentModeItem[]>([]);
  const [receiptPaidAmount, setReceiptPaidAmount] = useState<number>(0);
  const [patientRegistrationDetails, setPatientRegistrationDetails] = useState<
    Record<string, unknown>
  >({});

  const patientDataRef = useRef<PatientDataHandle>(null);
  const billingDetailsRef = useRef<BillingDetailsHandle>(null);

  const fetchAdvanceAmountByPatientId = useCallback(async (patientId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_LEDGER_BILL,
      {},
      { params: { patientId } },
      { component: "PatientAdvance" }
    );

    return (
      normalizeAdvanceLedgerDetails(resp?.data, patientId) ??
      getDefaultAdvanceLedgerDetails(patientId)
    );
  }, []);

  const { data: advanceAmount } = useQuery({
    queryKey: ["patientAdvanceLedger", selectedPatientId],
    queryFn: () => fetchAdvanceAmountByPatientId(selectedPatientId!),
    enabled: !!selectedPatientId,
  });

  const bindPatient = useCallback(async (patientId: number) => {
    setSelectedPatientId(patientId);
    setPatientTabError(false);
    await patientDataRef.current?.loadPatientById(patientId);
    setActiveTab(PatientAdvanceTabName.PATIENT_ADVANCE);
  }, []);

  const handlePatientLoaded = useCallback(() => {
    setActiveTab(PatientAdvanceTabName.PATIENT_ADVANCE);
  }, []);

  const handleUhidPatientSelect = useCallback(
    async (patientId: number) => {
      if (!patientId) {
        showWarning("Invalid patient selected.");
        return false;
      }

      await bindPatient(patientId);
      return true;
    },
    [bindPatient]
  );

  const handleSelectPatient = useCallback(
    async (item: SearchedPatientItem) => {
      const patientId = Number(item?.PatientId ?? 0);
      if (!patientId) {
        showWarning("Invalid patient selected.");
        return false;
      }

      await bindPatient(patientId);
      return true;
    },
    [bindPatient]
  );

  const SearchOldPatientHandler = () => {
    setRenderSearchPatientPopup(true);
    setOpenSearchPatientPopup(true);
  };

  const closeSearchPatientHandler = useCallback(() => {
    setOpenSearchPatientPopup(false);
    setTimeout(() => {
      setRenderSearchPatientPopup(false);
    }, 300);
  }, []);

  const resetForm = useCallback(() => {
    billingDetailsRef.current?.reset?.();
    setPatientAdvanceAmount(0);
    setSelectedPatientId(null);
    setPatientTabError(false);
    setActiveTab(PatientAdvanceTabName.PATIENT_DETAILS);
    setUhidSearchResetKey(prev => prev + 1);
    setFormResetKey(prev => prev + 1);
    setReceiptData(null);
    setPaymentModes([]);
    setReceiptPaidAmount(0);
    setPatientRegistrationDetails({});
    queryClient.removeQueries({ queryKey: ["patientAdvanceLedger"] });
  }, [queryClient]);

  // receipts apis
  const getPatientLadgerReceiptDetails = async (
    patientId: number,
    receiptId: number,
    ledgerId: number
  ) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_LEDGER_RECEIPT_DETAILS,
      {},
      { params: { patientId, receiptId, ledgerId } },
      { component: "PatientAdvance" }
    );
    return resp?.data?.[0];
  };

  const getPatientAdvancePaymentModeList = async (patientId: number, receiptId: number) => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_PATIENT_ADVANCE_RECEIPT_LIST,
      {},
      { params: { patientId, receiptId } },
      { component: "PatientAdvance" }
    );
    return resp?.data?.slice(0, 10);
  };

  const savePatientAdvance = useCallback(async () => {
    const isPatientValid = (await patientDataRef.current?.validateForm?.()) ?? false;
    if (!isPatientValid) {
      setPatientTabError(true);
      setActiveTab(PatientAdvanceTabName.PATIENT_DETAILS);
      return;
    }

    setPatientTabError(false);

    if (patientAdvanceAmount <= 0) {
      showWarning("Please enter advance amount.");
      setActiveTab(PatientAdvanceTabName.PATIENT_ADVANCE);
      return;
    }

    const isBillingValid = (await billingDetailsRef.current?.validateForm?.()) ?? false;
    if (!isBillingValid) {
      setActiveTab(PatientAdvanceTabName.PATIENT_ADVANCE);
      return;
    }

    const billingPayload = billingDetailsRef.current?.getPayload?.();
    const paymentList = Array.isArray(billingPayload?.payments)
      ? (billingPayload.payments as Array<Record<string, unknown>>)
      : [];

    const registrationResult = await registerPatientMaster(
      fetchApi,
      patientRegistrationDetails,
      "PatientAdvance"
    );

    if (!registrationResult.ok) {
      if (registrationResult.error.fieldErrors) {
        patientDataRef.current?.applyApiFieldErrors?.(registrationResult.error.fieldErrors);
      }
      setPatientTabError(true);
      setActiveTab(PatientAdvanceTabName.PATIENT_DETAILS);
      showError(registrationResult.error.message);
      return;
    }

    const resolvedPatientId = registrationResult.data.patientId;
    setSelectedPatientId(resolvedPatientId);

    const ledgerDetails = await fetchAdvanceAmountByPatientId(resolvedPatientId);

    const payload: PatientAdvanceSavePayload = buildPatientAdvanceSavePayload({
      branchId,
      roleId,
      patientId: resolvedPatientId,
      patientLedgerId: Number(ledgerDetails?.LedgerId ?? 0),
      payments: paymentList,
    });

    if (!payload.paymentDetails.length) {
      showWarning("Please enter advance payment amount.");
      setActiveTab(PatientAdvanceTabName.PATIENT_ADVANCE);
      return;
    }

    const totalCollected = payload.paymentDetails.reduce((sum, item) => sum + item.amount, 0);
    if (totalCollected !== patientAdvanceAmount) {
      showWarning("You cannot take more amount or less amount than advance amount.");
      setActiveTab(PatientAdvanceTabName.PATIENT_ADVANCE);
      return;
    }

    setPatientAdvanceAmount(totalCollected);

    const resp = await fetchApi(
      "POST",
      ENDPOINTS.SAVE_PATIENT_ADVANCE,
      payload,
      {},
      { component: "PatientAdvance" }
    );

    if (!resp?.result) {
      showError(formatApiValidationMessage(resp, "Failed to save patient advance."));
      return;
    }

    const [receiptDetails, paymentModeDetails] = await Promise.allSettled([
      getPatientLadgerReceiptDetails(
        Number(resp?.data?.patientId ?? 0),
        Number(resp?.data?.receiptId ?? 0),
        Number(resp?.data?.ledgerId ?? 0)
      ),
      getPatientAdvancePaymentModeList(
        Number(resp?.data?.patientId ?? 0),
        Number(resp?.data?.receiptId ?? 0)
      ),
    ]);

    const resolvedReceipt = receiptDetails.status === "fulfilled" ? receiptDetails.value : null;
    const resolvedPaymentModes =
      paymentModeDetails.status === "fulfilled" ? (paymentModeDetails.value ?? []) : [];

    showSuccess(resp?.message ?? "Patient advance saved successfully.");

    setReceiptData(resolvedReceipt);
    setPaymentModes(resolvedPaymentModes);
    setReceiptPaidAmount(totalCollected);

    if (!resolvedReceipt) {
      showError("Patient advance saved, but receipt data is unavailable.");
      window.setTimeout(() => {
        resetForm();
      }, 300);
      return;
    }

    await new Promise(resolve => window.setTimeout(resolve, 120));

    openPatientAdvanceReceiptInNewTab();

    window.setTimeout(() => {
      resetForm();
    }, 300);
  }, [
    branchId,
    fetchAdvanceAmountByPatientId,
    patientAdvanceAmount,
    patientRegistrationDetails,
    resetForm,
    roleId,
  ]);

  const buttonClickHandler = useCallback(
    (action: string) => {
      if (action === "save") {
        void savePatientAdvance();
        return;
      }

      if (action === "cancel") {
        resetForm();
      }
    },
    [resetForm, savePatientAdvance]
  );

  return (
    <div className="page-container">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <h1 className="page-heading">Patient Advance</h1>

          <nav className="helper-text">
            <NavLink to="/dashboard" className="hover:underline">
              Home
            </NavLink>
            <span>››</span>
            <span>Patient Advance</span>
          </nav>
        </div>

        <div className="flex justify-center flex-1 mt-1">
          <UhidGlobalSearch
            onPatientSelect={handleUhidPatientSelect}
            resetKey={uhidSearchResetKey}
            className="w-full lg:w-auto"
          />
        </div>

        <div className="flex justify-end flex-1">
          <button
            type="button"
            className="save-btn whitespace-nowrap"
            onClick={SearchOldPatientHandler}
          >
            Search Old Patient
          </button>
        </div>
      </div>

      <div className="tab-card mt-1 rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab(PatientAdvanceTabName.PATIENT_DETAILS)}
          className={`tab-btn transition ${
            patientTabError
              ? "border-2 input-field-error"
              : activeTab === PatientAdvanceTabName.PATIENT_DETAILS
                ? "tab-btn-active"
                : "tab-btn-inactive"
          }`}
        >
          {PatientAdvanceTabName.PATIENT_DETAILS}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(PatientAdvanceTabName.PATIENT_ADVANCE)}
          className={`tab-btn transition ${
            activeTab === PatientAdvanceTabName.PATIENT_ADVANCE
              ? "tab-btn-active"
              : "tab-btn-inactive"
          }`}
        >
          {PatientAdvanceTabName.PATIENT_ADVANCE}
        </button>
      </div>

      <div className={activeTab === PatientAdvanceTabName.PATIENT_DETAILS ? "mt-1" : "mt-1 hidden"}>
        <PatientData
          key={`patient-data-${formResetKey}`}
          ref={patientDataRef}
          selectedPatientId={selectedPatientId}
          showRegistrationButton={false}
          onPayloadChange={setPatientRegistrationDetails}
          onPatientLoaded={handlePatientLoaded}
        />
      </div>

      <div className={activeTab === PatientAdvanceTabName.PATIENT_ADVANCE ? "mt-1" : "mt-1 hidden"}>
        <PatientAdvanceAmount
          billingDetailsRef={billingDetailsRef}
          formResetKey={formResetKey}
          patientAdvanceAmount={patientAdvanceAmount}
          onPatientAdvanceAmountChange={setPatientAdvanceAmount}
          advanceAmount={advanceAmount}
        />
      </div>

      <Buttons
        onButtonClick={buttonClickHandler}
        pageType={PageType.PATIENT_ADVANCE}
        hasDiscountApplied={false}
      />

      {renderSearchPatientPopup && (
        <SearchPatientPopup
          isOpen={openSearchPatientPopup}
          onClose={closeSearchPatientHandler}
          showTable={showTable}
          setShowTable={setShowTable}
          onSelectPatient={handleSelectPatient}
        />
      )}

      {!!loading && <CustomLoader isLoading={loading} />}

      <div style={{ visibility: "hidden", position: "absolute", top: 0 }}>
        {receiptData && (
          <PatientAdvanceReceipt
            printOnMount={false}
            patientDetails={receiptData}
            paymentModeList={paymentModes}
            paidAmt={receiptPaidAmount}
          />
        )}
      </div>
    </div>
  );
};

export default PatientAdvance;
