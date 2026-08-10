import { ENDPOINTS } from "@/config/defaults";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
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
  if (num === 0) return "Zero Rupees";

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
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + getWords(n % 100);
    if (n < 100000) return getWords(Math.floor(n / 1000)) + " Thousand " + getWords(n % 1000);
    if (n < 10000000) return getWords(Math.floor(n / 100000)) + " Lakh " + getWords(n % 100000);
    return getWords(Math.floor(n / 10000000)) + " Crore " + getWords(n % 10000000);
  };

  return getWords(num).trim() + " Rupees Only";
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
    <div style={{ fontSize: 12, marginTop: 4, fontWeight: "bold" }}>{value}</div>
    {label && <div style={{ fontSize: 11, marginTop: 2 }}>{label}</div>}
  </div>
);

export const openOpdAppointmentReceiptInNewTab = (existingWindow: Window | null = null) => {
  const newWindow = existingWindow || window.open("", "_blank");
  if (!newWindow) {
    alert("Popup blocked! Please allow popups for this site to view the receipt.");
    return null;
  }

  newWindow.document.write(`
    <html>
      <head>
        <title>OPD Appointment Receipt</title>
        <base href="${window.location.origin}" />
        <style>
          @page {
            size: A4;
            margin: 6mm;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: #fff;
          }

          #root {
            display: block;
            width: 100%;
            padding: 0;
          }

          #root #opd-appointment-receipt-print-wrapper {
            width: 100% !important;
            page-break-inside: avoid;
            break-inside: avoid-page;
          }

          #root #opd-appointment-receipt-print-wrapper > div {
            padding: 0 !important;
            background: #fff !important;
          }

          #root #opd-appointment-receipt-print-wrapper > div > div {
            width: 100% !important;
            max-width: 100% !important;
            padding: 10px !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          #root #opd-appointment-receipt-print-wrapper table {
            margin-bottom: 6px !important;
          }

          #root #opd-appointment-receipt-print-wrapper tr,
          #root #opd-appointment-receipt-print-wrapper td,
          #root #opd-appointment-receipt-print-wrapper th {
            page-break-inside: avoid !important;
          }

          @media print {
            #root #opd-appointment-receipt-print-wrapper {
              zoom: 0.92;
            }
          }
        </style>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `);

  newWindow.document.close();

  let attempts = 0;
  const tryRender = () => {
    const content = document.getElementById("opd-appointment-receipt-print-wrapper");

    if (!content) {
      attempts++;
      if (attempts > 50) {
        newWindow.document.body.innerHTML =
          "<h3 style='text-align:center;margin-top:50px'>Error: OPD Appointment receipt not found</h3>";
        return;
      }
      setTimeout(tryRender, 100);
      return;
    }

    if (!content.innerHTML || content.innerHTML.trim() === "") {
      attempts++;
      if (attempts > 50) {
        newWindow.document.body.innerHTML =
          "<h3 style='text-align:center;margin-top:50px'>Error: OPD Appointment receipt empty</h3>";
        return;
      }
      setTimeout(tryRender, 100);
      return;
    }

    const branchAddressNode = content.querySelector("#receipt-branch-address");
    const branchNameNode = content.querySelector("#receipt-branch-name");
    const branchAddressText = branchAddressNode?.textContent?.trim() || "";
    const branchNameText = branchNameNode?.textContent?.trim() || "";

    const hasResolvedBranchFooter =
      branchAddressText.length > 0 &&
      branchNameText.length > 0 &&
      !branchAddressText.toLowerCase().includes("undefined") &&
      !branchNameText.toLowerCase().includes("undefined") &&
      branchAddressText !== "Subject to  Jurisdiction" &&
      branchNameText !== "For";

    if (!hasResolvedBranchFooter) {
      attempts++;
      if (attempts > 50) {
        newWindow.document.body.innerHTML =
          "<h3 style='text-align:center;margin-top:50px'>Error: Branch details not ready for receipt</h3>";
        return;
      }
      setTimeout(tryRender, 100);
      return;
    }

    newWindow.document.getElementById("root")!.innerHTML = content.innerHTML;

    const images = newWindow.document.images;
    if (images.length === 0) {
      newWindow.focus();
      return;
    }

    let loaded = 0;
    for (let i = 0; i < images.length; i++) {
      images[i].onload = images[i].onerror = () => {
        loaded++;
        if (loaded === images.length) {
          newWindow.focus();
        }
      };
    }
  };

  tryRender();
  return newWindow;
};

export default function OpdAppointmentReceipt({
  printOnMount = false,
  patientDetails,
  paymentModeList = [],
  paidAmt,
  receiptId,
}: {
  printOnMount?: boolean;
  patientDetails: any;
  paymentModeList?: any[];
  paidAmt: number;
  receiptId?: number;
}) {
  const { fetchApi } = useGlobalApi();

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
      { component: "OpdAppointmentReceipt" }
    );
    setBranchDetails(resp?.data?.[0]);
  };

  useEffect(() => {
    getBranchDetails();
  }, [branchId]);

  useEffect(() => {
    if (
      printOnMount &&
      patientDetails &&
      !document.getElementById("opd-appointment-receipt-print-wrapper")
    ) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [printOnMount, patientDetails]);

  // current date and time
  const today = new Date();
  const todayDate = today.toLocaleDateString();
  const todayTime = today.toLocaleTimeString();

  if (!patientDetails) return null;

  const hasReceipt =
    Number(receiptId ?? patientDetails?.ReceiptId ?? patientDetails?.receiptId ?? 0) > 0;

  // normalize payment modes
  const activePaymentModes =
    paymentModeList && paymentModeList.length > 0
      ? paymentModeList
      : [
          {
            ReceiptNo: patientDetails.TokenNo || patientDetails.ReceiptId || "-",
            Amount: paidAmt || patientDetails.Amount || 0,
            PaymentModeName: patientDetails.SourceType || "Cash",
            UserName: patientDetails.CreatedBy || "-",
          },
        ];

  return (
    <div id="opd-appointment-receipt-print-wrapper">
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
            OPD Appointment Receipt
          </div>

          {/* Patient Details */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ width: "50%" }}>
              <table style={{ width: "100%", fontSize: "14px" }}>
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Token No.</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.TokenNo}</td>
                  </tr>
                  <tr>
                    <td style={{ width: "130px", verticalAlign: "top" }}>UHID</td>
                    <td style={{ verticalAlign: "top" }}>
                      : {patientDetails?.UHID || patientDetails?.Uhid || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Name</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.PatientName}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Contact No</td>
                    <td style={{ verticalAlign: "top" }}>
                      : {patientDetails?.ContactNumber || patientDetails?.SelfContactNumber || "-"}
                    </td>
                  </tr>
                  {/* <tr>
                    <td style={{ verticalAlign: "top" }}>Relative Name</td>
                    <td style={{ verticalAlign: "top" }}>
                      : {patientDetails?.RelativeName || "-"}
                    </td>
                  </tr> */}
                </tbody>
              </table>
            </div>
            <div style={{ width: "50%" }}>
              <table style={{ width: "100%", fontSize: "14px" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "130px", verticalAlign: "top" }}>Appointment Date</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.AppDateTime}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Age/Sex</td>
                    <td style={{ verticalAlign: "top" }}>
                      : {patientDetails?.Age} / {patientDetails?.Gender}
                    </td>
                  </tr>

                  <tr>
                    <td style={{ verticalAlign: "top" }}>Doctor Name</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.DoctorName}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Address</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.Address || "-"}</td>
                  </tr>
                  {/* <tr>
                    <td style={{ verticalAlign: "top" }}>Corporate</td>
                    <td style={{ verticalAlign: "top" }}>
                      : {patientDetails?.CorporateName || "-"}
                    </td>
                  </tr> */}
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
                  {patientDetails?.ServiceName || "OPD Appointment Fee"}
                </td>
                <td
                  style={{ padding: "2px 5px", borderRight: "1px solid #000" }}
                >{`₹ ${patientDetails?.Amount || 0}`}</td>
              </tr>
            </tbody>
          </table>

          {hasReceipt && (
            <>
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
                      style={{
                        padding: "4px 5px",
                        borderRight: "1px solid #000",
                        fontWeight: "bold",
                      }}
                    >
                      Receipt Date & Time
                    </th>
                    <th
                      style={{
                        padding: "4px 5px",
                        borderRight: "1px solid #000",
                        fontWeight: "bold",
                      }}
                    >
                      Receipt No
                    </th>
                    <th
                      style={{
                        padding: "4px 5px",
                        borderRight: "1px solid #000",
                        fontWeight: "bold",
                      }}
                    >
                      Amount
                    </th>
                    <th
                      style={{
                        padding: "4px 5px",
                        borderRight: "1px solid #000",
                        fontWeight: "bold",
                      }}
                    >
                      Payment Mode
                    </th>
                    <th style={{ padding: "4px 5px", fontWeight: "bold" }}>Collected By</th>
                  </tr>
                </thead>
                <tbody>
                  {activePaymentModes.map((receipt: any, index: number) => (
                    <tr key={index}>
                      <td style={{ padding: "4px 5px", borderRight: "1px solid #000" }}>
                        {patientDetails?.CreatedOn || todayDate}
                      </td>
                      <td style={{ padding: "4px 5px", borderRight: "1px solid #000" }}>
                        {receipt?.ReceiptNo || receipt?.receiptNo || "-"}
                      </td>
                      <td
                        style={{
                          padding: "4px 5px",
                          borderRight: "1px solid #000",
                        }}
                      >
                        {receipt?.Amount || receipt?.amount || 0}
                      </td>
                      <td style={{ padding: "4px 5px", borderRight: "1px solid #000" }}>
                        {receipt?.PaymentModeName || receipt?.paymentModeName || "-"}
                      </td>
                      <td style={{ padding: "4px 5px" }}>
                        {receipt?.UserName || receipt?.createdBy || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: "bold", marginBottom: "15px", fontSize: "14px" }}>
                  Received with thanks an amount of {numberToWords(paidAmt)} .
                </div>

                <div style={{ fontWeight: "bold", marginBottom: "15px", fontSize: "14px" }}>
                  Total Amount: {`₹ ${paidAmt}`}
                </div>
              </div>
            </>
          )}

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
            <span>Prepared on : {patientDetails?.CreatedOn || todayDate}</span>
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
