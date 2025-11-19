import * as XLSX from "xlsx";

// detect valid YYYY-MM-DD or DD/MM/YYYY
const isDateValue = value =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) || /^\d{2}\/\d{2}\/\d{4}$/.test(value);

// convert ANY detected date into dd-mm-yyyy
const formatDate = value => {
  if (value.includes("-")) {
    const [y, m, d] = value.split("-");
    return `${d}-${m}-${y}`;
  } else {
    const [d, m, y] = value.split("/");
    return `${d}-${m}-${y}`;
  }
};

export const exportListViewData = (
  listData,
  fileName = "MasterList",
  format = "excel" // <--- change to "csv" when needed
) => {
  if (!listData?.length) return alert("No data found!");

  const headers = [
    "ID",
    "Name",
    "Status",
    ...(listData[0]?.listGroupSection?.map(i => i.label) || []),
  ];

  const rows = listData.map(item => {
    const id = item?.cardId?.[0]?.value ?? "-";
    const name = item?.cardTitle?.map(t => t.value).join(" ") ?? "-";
    const status = item?.listStatus?.[0]?.value === 1 ? "Active" : "Inactive";

    const footerValues =
      item?.listGroupSection?.map(f => {
        let value = f.value || "-";

        // DATE FORMAT
        if (isDateValue(value)) {
          return formatDate(value);
        }

        // PHONE NUMBER
        if (/^\d{8,}$/.test(value)) {
          return `'${value}`;
        }

        return value;
      }) ?? [];

    return [id, name, status, ...footerValues];
  });

  // csv export
  if (format === "csv") {
    const csvContent = [
      headers.join(","),
      ...rows.map(row =>
        row
          .map(cell => {
            if (isDateValue(cell)) return `"="${cell}"`;
            return `"${cell}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();

    return;
  }

  // EXCEL EXPORT
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
