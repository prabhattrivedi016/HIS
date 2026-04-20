import { PaymentModeItem } from "@/screens/opdBilling/types";
import { useEffect, useState } from "react";
import Barcode from "react-barcode";
import logoImg from "../../../assets/logo.jpg";

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

    {/* barcode  */}
    <div style={{ fontSize: 12, marginTop: 4, fontWeight: "bold" }}>{value}</div>

    {/* Optional label */}
    {label && <div style={{ fontSize: 11, marginTop: 2 }}>{label}</div>}
  </div>
);

export default function OpdDetailsBills({
  printOnMount = false,
  data,
  paymentModeList,
  paidAmt,
}: {
  printOnMount?: boolean;
  data: any;
  paymentModeList: PaymentModeItem[];
  paidAmt: number;
}) {
  const patientDetails = data?.[0];

  useEffect(() => {
    if (printOnMount && paymentModeList?.length > 0) {
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

  // amount calculation
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(0);
  const [balanceAmount, setBalanceAmount] = useState<number>(0);
  useEffect(() => {
    const totalAmount = data?.reduce((acc: number, item: any) => acc + item?.Rate, 0);
    const totalDiscount = data?.reduce((acc: number, item: any) => acc + item?.DiscAmt, 0);
    const netAmount = data?.reduce((acc: number, item: any) => acc + item?.NetAmt, 0);

    const balanceAmount = data?.reduce(
      (acc: number, item: any) => acc + item?.TotalBalanceAmount,
      0
    );
    setTotalAmount(totalAmount);
    setTotalDiscount(totalDiscount);
    setNetAmount(netAmount);
    setBalanceAmount(balanceAmount);
  }, [data, paymentModeList]);

  const amountInWords = numberToWords(Math.floor(netAmount));

  if (!data) return null;

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
            Details Bill
          </div>

          {/* Barcodes */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <BarcodeBlock value={patientDetails?.UHID} />
            <BarcodeBlock value={patientDetails?.BillNo} />
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
                    <td style={{ verticalAlign: "top" }}>Age/Sex</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.Age}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Contact No</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.ContactNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Relative Name</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.RelativeName}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Address</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.Address}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Diagnostic No.</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.DiagnosticNo}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ width: "50%" }}>
              <table style={{ width: "100%", fontSize: "14px" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "130px", verticalAlign: "top" }}>BillDate & Time</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.BillDate}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Doctor</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.CompleteName}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Refer Doctor</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.ReferDoctorName}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Corporate</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.CorporateName}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Bill No.</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.BillNo}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Receipt No.</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.ReceiptNo}</td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>Doc Token No.</td>
                    <td style={{ verticalAlign: "top" }}>: {patientDetails?.DocTokenNo}</td>
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
                  Net Amt
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
              {/* Add an empty row for spacing if needed to match height */}
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

          {/* Summary Details */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              marginBottom: "5px",
              fontSize: "15px",
            }}
          >
            <span>Total Amount : {totalAmount}</span>
            <span>Total Discount : {totalDiscount}</span>
            <span>Net Amount : {netAmount}</span>
            <span>Paid Amount : {paidAmt}</span>
            <span>Balance Amount : {balanceAmount}</span>
          </div>
          <div style={{ fontWeight: "bold", marginBottom: "15px", fontSize: "14px" }}>
            Amount In Words(INR): {amountInWords}
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
              {paymentModeList.map((receipt: PaymentModeItem, index: number) => (
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
            <span>Printed By : {patientDetails?.PrintBy}</span>
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
            <span>Subject to Varanasi Jurisdiction</span>
            <span style={{ paddingLeft: "40px" }}>E. & O.E.</span>
            <span>For GWS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
