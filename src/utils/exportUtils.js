import * as XLSX from "xlsx";

/**
 * Exports transformed master data to CSV or Excel
 * @param {Array} data - The transformed data array (from transformDataWithConfig)
 * @param {string} fileName - The name of the exported file
 * @param {'csv' | 'excel'} format - Export format type
 */
export const exportMasterData = (
  data,
  fileName = "MasterData",
  format = "csv"
) => {
  if (!data || data.length === 0) {
    alert("No data available to export!");
    return;
  }

  // Extract headers dynamically
  const headers = [
    data[0]?.cardId?.label || "ID",
    data[0]?.cardTitle?.label || "Name",
    "Status",
    ...(data[0]?.cardFooterSection?.map((f) => f.label) || []),
  ];

  // Prepare rows
  const rows = data.map((item) => {
    const id = item?.cardId?.value || "-";
    const name = item?.cardTitle?.value || "-";
    const status = item?.cardLeftTop?.value === 1 ? "Active" : "Inactive";

    // Handle footer data safely + prevent Excel number formatting (e.g. phone numbers)
    const footerValues =
      item?.cardFooterSection?.map((f) => {
        let value = f.value || "-";

        // ✅ Fix: Prevent Excel scientific notation for long numbers (phone, contact, etc.)
        // Option 1 — detect by label name
        const label = f.label?.toLowerCase() || "";
        const isPhoneLike =
          label.includes("phone") ||
          label.includes("contact") ||
          label.includes("mobile");

        // Option 2 — detect by numeric length (8+ digits)
        const looksLikeLongNumber =
          /^\d{8,}$/.test(value) && !isNaN(Number(value));

        if (isPhoneLike || looksLikeLongNumber) {
          value = `'${value}`; // force Excel to treat as text
        }

        return value;
      }) || [];

    return [id, name, status, ...footerValues];
  });

  // ✅ CSV Export
  if (format === "csv") {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.map((h) => `"${h}"`).join(","),
        ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ✅ Excel Export
  else if (format === "excel") {
    const sheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Force Excel to treat long numbers as strings
    Object.keys(worksheet).forEach((cell) => {
      if (cell[0] === "!") return; // skip metadata
      const cellValue = worksheet[cell].v;
      if (typeof cellValue === "number" && cellValue.toString().length >= 8) {
        worksheet[cell].t = "s"; // set type to string
        worksheet[cell].v = cellValue.toString();
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }
};
