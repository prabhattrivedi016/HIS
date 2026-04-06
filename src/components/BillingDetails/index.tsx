import { ENDPOINTS } from "@/config/defaults";
import { BillingAmountContext } from "@/context/BillingAmountContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { allowOnlyNumbers } from "@/utils/inputValidationHandler";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import InputField from "../customInputField";
import PaymentMethods from "./components/PaymentMethods";
import { BillingDetailsHandle, DiscountApproveItem, PaymentMethodsHandle } from "./types";

type BillingDetailsProps = {
  setOpdBilling?: Dispatch<SetStateAction<Record<string, unknown>>>;
};

type BillingValues = {
  grossBillAmount: number;
  totalDiscPerOnBill: number;
  totalDiscAmtOnBill: number;
  roundOff: number;
  netAmount: number;
  balanceAmount: number;
  discApprovedById: number;
  discountReason: string;
  remarks: string;
};

const BillingDetails = forwardRef<BillingDetailsHandle, BillingDetailsProps>(
  ({ setOpdBilling, setBillingValues, billingValues }, ref) => {
    const { fetchApi } = useGlobalApi();
    const paymentMethodsRef = useRef<PaymentMethodsHandle>(null);

    const [discountApproveList, setDiscountApproveList] = useState<DiscountApproveItem[]>([]);
    const { totalBillingAmount } = useContext(BillingAmountContext);

    const toNumber = (value: unknown) => {
      if (value === "" || value === null || value === undefined) return 0;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const roundToTwo = (value: number) => Number(value.toFixed(2));

    const syncToOpdBilling = (nextValues: Partial<BillingValues>) => {
      if (!setOpdBilling) return;
      setOpdBilling(prev => ({ ...prev, ...nextValues }));
    };

    const setBillingState = (nextValues: Partial<BillingValues>) => {
      setBillingValues(prev => ({ ...prev, ...nextValues }));
      syncToOpdBilling(nextValues);
    };

    const calculateFromPercentage = (gross: number, discountPerInput: unknown) => {
      const normalizedGross = Math.max(0, gross);
      const discountPer = roundToTwo(Math.min(100, Math.max(0, toNumber(discountPerInput))));
      const discountAmt = roundToTwo((normalizedGross * discountPer) / 100);
      const netAmount = roundToTwo(normalizedGross - discountAmt);

      return { discountPer, discountAmt, netAmount };
    };

    const calculateFromAmount = (gross: number, discountAmtInput: unknown) => {
      const normalizedGross = Math.max(0, gross);
      const discountAmt = roundToTwo(
        Math.min(normalizedGross, Math.max(0, toNumber(discountAmtInput)))
      );
      const discountPer =
        normalizedGross > 0 ? roundToTwo((discountAmt / normalizedGross) * 100) : 0;
      const netAmount = roundToTwo(normalizedGross - discountAmt);

      return { discountPer, discountAmt, netAmount };
    };

    // discount approved by
    const getDiscountApprovedBy = async () => {
      const resp = await fetchApi(
        "GET",
        ENDPOINTS.GET_DISCOUNT_APPROVAL_MASTER_LIST,
        {},
        {},
        { component: "BillingDetails" }
      );
      setDiscountApproveList(resp?.data ?? []);
    };

    useEffect(() => {
      getDiscountApprovedBy();
    }, []);

    useEffect(() => {
      const gross = roundToTwo(toNumber(totalBillingAmount));
      const { discountPer, discountAmt, netAmount } = calculateFromAmount(
        gross,
        billingValues.totalDiscAmtOnBill
      );

      setBillingState({
        grossBillAmount: gross,
        totalDiscPerOnBill: discountPer,
        totalDiscAmtOnBill: discountAmt,
        netAmount,
      });
    }, [totalBillingAmount]);

    const discountPercentageChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      const gross = toNumber(totalBillingAmount);
      const { discountPer, discountAmt, netAmount } = calculateFromPercentage(
        gross,
        e.target.value
      );

      setBillingState({
        totalDiscPerOnBill: discountPer,
        totalDiscAmtOnBill: discountAmt,
        netAmount,
      });
    };

    const discountAmountChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      const gross = toNumber(totalBillingAmount);
      const { discountPer, discountAmt, netAmount } = calculateFromAmount(gross, e.target.value);

      setBillingState({
        totalDiscPerOnBill: discountPer,
        totalDiscAmtOnBill: discountAmt,
        netAmount,
      });
    };

    const discountApprovedHandler = (e: ChangeEvent<HTMLSelectElement>) => {
      const value = Number(e.target.value) || 0;
      setBillingState({ discApprovedById: value });
    };

    const discountChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      setBillingState({ discountReason: e.target.value });
    };

    const remarkChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
      setBillingState({ remarks: e.target.value });
    };

    useImperativeHandle(
      ref,
      () => ({
        validateForm: async () => {
          const hasNetAmount = billingValues.netAmount > 0;
          const isPaymentValid = paymentMethodsRef.current?.validatePayments() ?? false;
          return hasNetAmount && isPaymentValid;
        },
        getNetAmount: () => billingValues.netAmount,
        getPayload: () => {
          const payments = paymentMethodsRef.current?.getPaymentPayload() ?? [];
          return {
            ...billingValues,
            payments,
          };
        },
      }),
      [billingValues]
    );

    return (
      <div className="flex flex-col lg:flex-row mt-3 gap-3 w-full">
        <div className="billing details w-full lg:w-1/2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <InputField label="Gross Bill Amount">
              <input
                className="disabled-input-field w-full"
                disabled={true}
                value={billingValues.grossBillAmount}
                readOnly
              />
            </InputField>

            <InputField label="Bill Disc(%)">
              <input
                type="text"
                className="input-field w-full"
                value={billingValues.totalDiscPerOnBill}
                onInput={allowOnlyNumbers}
                onChange={discountPercentageChangeHandler}
              />
            </InputField>

            <InputField label="Bill Disc Amount">
              <input
                type="text"
                className="input-field"
                value={billingValues.totalDiscAmtOnBill}
                onInput={allowOnlyNumbers}
                onChange={discountAmountChangeHandler}
              />
            </InputField>

            <InputField label="Round Off">
              <input
                type="text"
                className="disabled-input-field"
                value={billingValues.roundOff}
                disabled={true}
                readOnly
              />
            </InputField>

            <InputField label="Net Amount">
              <input
                className="disabled-input-field  text-red-500 font-bold"
                value={billingValues.netAmount}
                disabled={true}
                readOnly
              />
            </InputField>

            <InputField label="Balance Amount">
              <input
                className="disabled-input-field "
                value={billingValues.balanceAmount}
                readOnly
                disabled={true}
              />
            </InputField>

            <InputField label="Discount Approved By">
              <select
                className="input-field"
                onChange={discountApprovedHandler}
                value={billingValues.discApprovedById || ""}
              >
                <option value="">Select</option>
                {discountApproveList?.map(b => (
                  <option key={b?.id} value={b?.id}>
                    {b?.name}
                  </option>
                ))}
              </select>
            </InputField>

            <InputField label="Discount Reason">
              <input
                type="text"
                className="input-field "
                placeholder="Enter discount reason"
                value={billingValues.discountReason}
                onChange={discountChangeHandler}
              />
            </InputField>

            <InputField label="Remark">
              <input
                type="text"
                placeholder="Enter remarks"
                className="input-field"
                value={billingValues.remarks}
                onChange={remarkChangeHandler}
              />
            </InputField>
          </div>
        </div>

        <PaymentMethods ref={paymentMethodsRef} />
      </div>
    );
  }
);

export default BillingDetails;
export type { BillingDetailsHandle } from "./types";
