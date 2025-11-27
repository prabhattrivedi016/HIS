import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ---------------------------------------------------------
// TYPE ALIASES
// ---------------------------------------------------------
type ColumnData = {
  keyFromApi: string;
  label: string;
  value: any;
};

type ListItem = {
  columns: ColumnData[];
};

// ---------------------------------------------------------
// DATE HELPERS
// ---------------------------------------------------------

// detect date formats dd-mm-yyyy or yyyy-mm-dd
const isDateValue = (value: string): boolean =>
  /^\d{2}-\d{2}-\d{4}$/.test(value) || /^\d{4}-\d{2}-\d{2}$/.test(value);

// convert ANY detected date into dd-mm-yyyy
const formatDate = (value: string): string => {
  if (!value) return "-";

  if (value.includes("-")) {
    const parts = value.split("-");
    // yyyy-mm-dd → dd-mm-yyyy
    if (parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  return value;
};

// ---------------------------------------------------------
// PREPARE ROWS
// ---------------------------------------------------------

const prepareRows = (listData: ListItem[]): (string | number)[][] =>
  listData.map(item =>
    item.columns.map(col => {
      let value: string | number = col.value ?? "-";

      if (col.keyFromApi === "isActive") {
        value = value === 1 ? "Active" : "Inactive";
      }

      if (typeof value === "string" && isDateValue(value)) {
        value = formatDate(value);
      }

      if (typeof value === "string" && /^\d{10,}$/.test(value)) {
        value = `'${value}`;
      }

      return value;
    })
  );

// ---------------------------------------------------------
// EXCEL EXPORT
// ---------------------------------------------------------

export const exportToExcel = (listData: ListItem[], fileName: string) => {
  let headers: string[] = [];
  let rows: (string | number)[][] = [];

  if (listData?.length > 0) {
    headers = listData[0].columns.map(col => col.label);
    rows = prepareRows(listData);
  } else {
    headers = ["Data"];
    rows = [["No data found"]];
  }

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();

  // auto column width
  worksheet["!cols"] = headers.map((h, i) => ({
    wch: Math.max(h.length, ...rows.map(r => (r[i] || "").toString().length)) + 2,
  }));

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// PDF EXPORT — jsPDF + autoTable

export const exportToPDF = (listData: ListItem[], fileName: string) => {
  let headers: string[] = [];
  let rows: (string | number)[][] = [];

  if (listData.length > 0) {
    headers = listData[0].columns.map(col => col.label);
    rows = prepareRows(listData);
  } else {
    headers = ["Data"];
    rows = [["No data found"]];
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  doc.setFontSize(14);
  doc.text(fileName, 30, 30);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 70,

    // General styling
    styles: {
      fontSize: 10,
      cellPadding: 4,
      halign: "center",
      valign: "middle",
    },

    // Header styling
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      halign: "center",
      valign: "middle",
    },
  });

  doc.save(`${fileName}.pdf`);
};

// MAIN EXPORT HANDLER

export const exportListViewData = (
  listData: ListItem[],
  fileName: string,
  type: "excel" | "pdf" = "excel"
) => {
  if (type === "pdf") return exportToPDF(listData, fileName);
  return exportToExcel(listData, fileName);
};
