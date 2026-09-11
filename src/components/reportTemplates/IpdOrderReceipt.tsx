import { ENDPOINTS } from "@/config/defaults";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { useContext, useEffect, useMemo, useState } from "react";
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

export default function IpdOrderReceipt({
  printOnMount = false,
  data,
}: {
  printOnMount?: boolean;
  data: any;
}) {
  const patientDetails = data?.[0];
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
      { component: "IpdOrderReceipt" }
    );
    setBranchDetails(resp?.data?.[0]);
  };

  useEffect(() => {
    getBranchDetails();
  }, [branchId]);

  useEffect(() => {
    if (printOnMount) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [printOnMount]);

  // current date and time
  const today = new Date();
  const todayDate = today.toLocaleDateString();
  const todayTime = today.toLocaleTimeString();

  const toNumber = (value: unknown): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  // amount calculation from API response
  const { totalAmount, totalDiscount, netAmount } = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];

    const grossFromRows = rows.reduce(
      (acc: number, item: any) =>
        acc + toNumber(item?.GrossAmt || toNumber(item?.Rate) * toNumber(item?.Qty || 1)),
      0
    );
    const discountFromRows = rows.reduce(
      (acc: number, item: any) => acc + toNumber(item?.DiscAmt),
      0
    );
    const netFromRows = rows.reduce((acc: number, item: any) => acc + toNumber(item?.NetAmt), 0);

    return {
      totalAmount: Number(grossFromRows.toFixed(2)),
      totalDiscount: Number(discountFromRows.toFixed(2)),
      netAmount: Number(netFromRows.toFixed(2)),
    };
  }, [data]);

  const amountInWords = numberToWords(Math.floor(netAmount));

  if (!data || !patientDetails) {
    console.warn("IpdOrderReceipt: No data or patientDetails available", { data, patientDetails });
    return (
      <div id="receipt-print-wrapper">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>No data available for printing</h2>
        </div>
      </div>
    );
  }

  return (
    <div id="receipt-print-wrapper">
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
              style={{ width: "100%", maxHeight: "140px", margin: "15px", objectFit: "contain" }}
            />
          </div>

          {/* Order Title */}
          <div
            style={{
              border: "1px solid #ccc",
              textAlign: "center",
              padding: "4px",
              marginBottom: "15px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            IPD ORDER
          </div>

          {/* Patient Details */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ width: "50%" }}>
              <table style={{ width: "100%", fontSize: "14px" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "130px", verticalAlign: "top", fontWeight: "bold" }}>
                      UHID
                    </td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.UHID}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top", fontWeight: "bold" }}>Name</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.PatientName}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top", fontWeight: "bold" }}>Contact No</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.ContactNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top", fontWeight: "bold" }}>Relative Name</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.RelativeName}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top", fontWeight: "bold" }}>Department</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.DepartmentName}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top", fontWeight: "bold" }}>IPD No.</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.IPDNo}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ width: "50%" }}>
              <table style={{ width: "100%", fontSize: "14px" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "130px", verticalAlign: "top", fontWeight: "bold" }}>
                      Date & Time
                    </td>
                    <td style={{ verticalAlign: "top" }}>
                      : {patientDetails?.OrderDate || `${todayDate} ${todayTime}`}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top", fontWeight: "bold" }}>Age/Sex</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.Age}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top", fontWeight: "bold" }}>Corporate</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.CorporateName}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top", fontWeight: "bold" }}>Address</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.Address}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top", fontWeight: "bold" }}>Doctor</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.CompleteName}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top", fontWeight: "bold" }}>Bed No.</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.BedNo}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Services Table */}

          {!!data && data?.length > 0 ? (
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
                    Code
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "2px 5px",
                      borderRight: "1px solid #000",
                      fontWeight: "bold",
                    }}
                  >
                    QTY
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "2px 5px",
                      borderRight: "1px solid #000",
                      fontWeight: "bold",
                    }}
                  >
                    Rate
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "2px 5px",
                      borderRight: "1px solid #000",
                      fontWeight: "bold",
                    }}
                  >
                    Disc(%)
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "2px 5px",
                      borderRight: "1px solid #000",
                      fontWeight: "bold",
                    }}
                  >
                    Disc.
                  </th>
                  <th style={{ textAlign: "right", padding: "2px 5px", fontWeight: "bold" }}>
                    NetAmt
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.map((service: any, index: number) => (
                  <tr key={index}>
                    <td style={{ padding: "2px 5px", borderRight: "1px solid #000" }}>
                      {service?.ServiceName}
                    </td>
                    <td style={{ padding: "2px 5px", borderRight: "1px solid #000" }}>
                      {service?.Code}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: "2px 5px",
                        borderRight: "1px solid #000",
                      }}
                    >
                      {service?.Qty}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: "2px 5px",
                        borderRight: "1px solid #000",
                      }}
                    >
                      {service?.Rate}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: "2px 5px",
                        borderRight: "1px solid #000",
                      }}
                    >
                      {service?.DiscPer}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: "2px 5px",
                        borderRight: "1px solid #000",
                      }}
                    >
                      {service?.DiscAmt}
                    </td>
                    <td style={{ textAlign: "right", padding: "2px 5px" }}>{service?.NetAmt}</td>
                  </tr>
                ))}
                {/* Add an empty row for spacing if needed */}
                <tr>
                  <td style={{ padding: "10px 5px", borderRight: "1px solid #000" }}>&nbsp;</td>
                  <td style={{ padding: "10px 5px", borderRight: "1px solid #000" }}></td>
                  <td style={{ borderRight: "1px solid #000" }}></td>
                  <td style={{ borderRight: "1px solid #000" }}></td>
                  <td style={{ borderRight: "1px solid #000" }}></td>
                  <td style={{ borderRight: "1px solid #000" }}></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          ) : (
            <></>
          )}

          {/* Summary Details */}
          <div
            style={{
              textAlign: "right",
              marginBottom: "15px",
              fontSize: "14px",
              paddingRight: "10px",
            }}
          >
            <div style={{ marginBottom: "5px" }}>
              <span style={{ fontWeight: "bold" }}>GrossAmount</span>
              <span style={{ marginLeft: "30px" }}>: {totalAmount}</span>
            </div>
            <div style={{ marginBottom: "5px" }}>
              <span style={{ fontWeight: "bold" }}>Disc Amt</span>
              <span style={{ marginLeft: "50px" }}>: {totalDiscount}</span>
            </div>
            <div style={{ marginBottom: "5px" }}>
              <span style={{ fontWeight: "bold" }}>NetAmount</span>
              <span style={{ marginLeft: "40px" }}>: {netAmount}</span>
            </div>
          </div>

          <div style={{ fontWeight: "bold", marginBottom: "15px", fontSize: "14px" }}>
            Amount In Words(INR): {amountInWords}
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
            <span>Prepared By :{patientDetails?.CreatedBy || "TEAM GWS"}</span>
            <span>Printed By :{patientDetails?.PrintBy || "TEAM GWS"}</span>
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
            <span style={{ paddingLeft: "40px" }}>E.& O.E.</span>
            <span id="receipt-branch-name">{`For ${branchName}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
