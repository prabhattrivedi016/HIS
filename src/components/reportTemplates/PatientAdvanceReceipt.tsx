import { ENDPOINTS } from "@/config/defaults";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import {
  PatientAdvancePaymentModeItem,
  PatientAdvanceReceiptItem,
} from "@/screens/patientAdvance/types";
import { useContext, useEffect, useState } from "react";
import Barcode from "react-barcode";
import logoImg from "../../../assets/logo.jpg";

type BranchItem = {
  branchId: number;
  branchName: string;
  branchCode: string;
  email: string;
  contactNo1: string;
  contactNo2: string;
  address: string;
  isActive: number;
  fyStartMonth: string;
  defaultCountryId: number;
  defaultStateId: number;
  defaultDistrictId: number;
  defaultCityId: number;
  defaultInsuranceCompanyId: number;
  defaultCorporateId: number;
};

// number to word converter
const numberToWords = (num: number): string => {
  if (num === null || num === undefined || isNaN(num) || num === 0) {
    return "Zero Rupees";
  }

  if (num < 0) {
    return "Minus " + numberToWords(Math.abs(num));
  }

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const getWords = (n: number): string => {
    if (n < 20) return a[n] || "";
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + getWords(n % 100);
    if (n < 100000) return getWords(Math.floor(n / 1000)) + " Thousand " + getWords(n % 1000);
    if (n < 10000000) return getWords(Math.floor(n / 100000)) + " Lakh " + getWords(n % 100000);
    return getWords(Math.floor(n / 10000000)) + " Crore " + getWords(n % 10000000);
  };

  const words = getWords(num);
  return (words ? words.trim() : "") + " Rupees Only";
};

// barcode block
const BarcodeBlock = ({ value, label }: { value: string; label?: string }) => (
  <div style={{ textAlign: "center", display: "inline-block" }}>
    <Barcode
      value={value || "NA"}
      width={1.2}
      height={30}
      fontSize={12}
      displayValue={false}
      margin={0}
      background="transparent"
      lineColor="#000"
    />

    {/* barcode  */}
    <div style={{ fontSize: 12, marginTop: 4, fontWeight: "bold" }}>{value}</div>

    {/* Optional label */}
    {label && <div style={{ fontSize: 11, marginTop: 2 }}>{label}</div>}
  </div>
);

export default function PatientAdvanceReceipt({
  printOnMount = false,
  patientDetails,
  paymentModeList,
  paidAmt,
  isRefund,
}: {
  printOnMount?: boolean;
  patientDetails: PatientAdvanceReceiptItem | null;
  paymentModeList: PatientAdvancePaymentModeItem[];
  paidAmt: number;
  isRefund?: number;
}) {
  const { loading, fetchApi } = useGlobalApi();

  const branchId = Number(useContext(AuthContext)?.user?.branchId ?? 1);
  const [branchDetails, setBranchDetails] = useState<BranchItem | null>(null);
  const branchAddress = branchDetails?.address?.trim() || "";
  const branchName = branchDetails?.branchName?.trim() || "";

  const getBranchDetails = async () => {
    if (!branchId) return;
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_BRANCH_DETAILS,
      {},
      { params: { branchId } },
      { component: "OpdDetails" }
    );
    setBranchDetails(resp?.data?.[0]);
  };

  useEffect(() => {
    getBranchDetails();
  }, [branchId]);

  useEffect(() => {
    if (
      printOnMount &&
      paymentModeList?.length > 0 &&
      !document.getElementById("patient-advance-receipt-print-wrapper")
    ) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [printOnMount, paymentModeList]);

  // current date and time
  const today = new Date();
  const todayDate = today.toLocaleDateString();
  const todayTime = today.toLocaleTimeString();

  const toNumber = (value: unknown): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  if (!patientDetails) return null;

  const isRefundReceipt =
    Number(isRefund ?? patientDetails?.IsRefund ?? patientDetails?.isRefund ?? 0) === 1;

  return (
    <div id="patient-advance-receipt-print-wrapper">
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          fontFamily: "Times New Roman, serif",
          fontSize: "14px",
          background: "#f4f6f9",
          padding: "20px 0",
        }}
      >
        <div
          style={{
            width: "800px",
            background: "#fff",
            padding: "20px",
            border: "1px solid #ccc",
            color: "#000",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Watermark */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-45deg)",
              fontSize: "100px",
              color: "rgba(0, 0, 0, 0.05)",
              fontWeight: "bold",
              zIndex: 0,
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            GRAVITY
          </div>

          {/* Header Logo Area */}
          <div style={{ textAlign: "center", position: "relative" }}>
            <img
              src={logoImg}
              alt="GRAVITY WEB SOLUTIONS"
              style={{
                width: "100%",
                maxHeight: "140px",
                marginTop: "-10px",
                margin: "5px",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Details Bill Title */}
          <div
            style={{
              border: "1px solid #ccc",
              textAlign: "center",
              padding: "4px",
              marginBottom: "15px",
              fontSize: "16px",
              fontWeight: "normal",
            }}
          >
            {isRefundReceipt ? "Out Patient Refund Receipt" : "Out Patient Advance Receipt"}
          </div>

          {/* Patient Details */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ width: "50%" }}>
              <table style={{ width: "100%", fontSize: "14px" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "130px", verticalAlign: "top" }}>UHID</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.UHID}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Name</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.PatientName}</td>
                  </tr>

                  <tr>
                    <td style={{ verticalAlign: "top" }}>Contact No</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.ContactNumber}</td>
                  </tr>
                  {/* <tr>
                    <td style={{ verticalAlign: "top" }}>Relative Name</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.RelativeName}</td>
                  </tr> */}
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Address</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.Address}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ width: "50%" }}>
              <table style={{ width: "100%", fontSize: "14px" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "130px", verticalAlign: "top" }}>Bill Date & Time</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.CreatedOn}</td>
                  </tr>

                  <tr>
                    <td style={{ verticalAlign: "top" }}>Age/Sex</td>
                    <td style={{ verticalAlign: "top" }}>
                      : {patientDetails?.Age} / {patientDetails?.Gender}
                    </td>
                  </tr>
                  {/* <tr>
                    <td style={{ verticalAlign: "top" }}>Bill No.</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.ReceiptNo}</td>
                  </tr> */}
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Receipt No.</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.ReceiptNo}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Corporate.</td>
                    <td style={{ verticalAlign: "top" }}>
                      : {patientDetails?.CorporateName ?? ""}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Services Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #000",
              marginBottom: "4px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #000", background: "#fff" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "2px 5px",
                    borderRight: "1px solid #000",
                    fontWeight: "bold",
                  }}
                >
                  Service Name
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "2px 5px",
                    borderRight: "1px solid #000",
                    fontWeight: "bold",
                  }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "2px 5px", borderRight: "1px solid #000" }}>
                  {isRefundReceipt ? "Patient Refund" : "Patient Advance"}
                </td>
                <td
                  style={{ padding: "2px 5px", borderRight: "1px solid #000" }}
                >{`₹ ${patientDetails?.ReceiptAmount}`}</td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              fontWeight: "bold",
              marginBottom: "2px",
              fontSize: "14px",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            Receipt Details:
          </div>

          {/* Receipt Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #000",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #000" }}>
                <th
                  style={{ padding: "4px 5px", borderRight: "1px solid #000", fontWeight: "bold" }}
                >
                  Receipt Date & Time.
                </th>
                <th
                  style={{ padding: "4px 5px", borderRight: "1px solid #000", fontWeight: "bold" }}
                >
                  Receipt No
                </th>
                <th
                  style={{ padding: "4px 5px", borderRight: "1px solid #000", fontWeight: "bold" }}
                >
                  Amount
                </th>
                <th
                  style={{ padding: "4px 5px", borderRight: "1px solid #000", fontWeight: "bold" }}
                >
                  Payment Mode
                </th>
                <th style={{ padding: "4px 5px", fontWeight: "bold" }}>Collected By</th>
              </tr>
            </thead>
            <tbody>
              {paymentModeList.map((receipt: PatientAdvancePaymentModeItem, index: number) => (
                <tr key={index}>
                  <td style={{ padding: "4px 5px", borderRight: "1px solid #000" }}>
                    {todayDate} & {todayTime}
                  </td>
                  <td style={{ padding: "4px 5px", borderRight: "1px solid #000" }}>
                    {receipt?.ReceiptNo}
                  </td>
                  <td
                    style={{
                      padding: "4px 5px",
                      borderRight: "1px solid #000",
                      // color: "blue",
                      // textDecoration: "underline",
                    }}
                  >
                    {receipt?.Amount}
                  </td>
                  <td style={{ padding: "4px 5px", borderRight: "1px solid #000" }}>
                    {receipt?.PaymentModeName}
                  </td>
                  <td style={{ padding: "4px 5px" }}>{receipt?.UserName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontWeight: "bold", marginBottom: "15px", fontSize: "14px" }}>
              {isRefundReceipt
                ? "Refunded with thanks an amount of "
                : "Received with thanks an amount of "}
              {numberToWords(Number(patientDetails?.ReceiptAmount))} .
            </div>

            <div style={{ fontWeight: "bold", marginBottom: "15px", fontSize: "14px" }}>
              Total Amount: {`₹ ${patientDetails?.ReceiptAmount}`}
            </div>
          </div>

          {/* Footer Area */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "2px",
              fontSize: "14px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <span>Prepared By : {patientDetails?.CreatedBy}</span>
            <span>Prepared on : {patientDetails?.CreatedOn}</span>
          </div>
          <div
            style={{
              borderTop: "1px solid #000",
              paddingTop: "2px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <span id="receipt-branch-address">{`Subject to ${branchAddress} Jurisdiction`}</span>
            <span style={{ paddingLeft: "40px" }}>E. & O.E.</span>
            <span id="receipt-branch-name">{`For ${branchName}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
