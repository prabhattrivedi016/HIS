export const toInputDate = (date?: string) => {
  if (!date) return "";
  const [dd, mm, yyyy] = date.split("-");
  return `${yyyy}-${mm}-${dd}`;
};

// UI FORMAT → "31st March"
export const formatDisplayDate = (dateString?: string) => {
  if (!dateString) return "-";

  const [day, month, year] = dateString.split("-");
  const date = new Date(`${year}-${month}-${day}`);

  const d = date.getDate();
  const monthName = date.toLocaleString("en-IN", { month: "long" });
  const y = date.getFullYear();

  const suffix = (d: number) => (d > 3 && d < 21 ? "th" : ["th", "st", "nd", "rd"][d % 10] || "th");

  return `${d}${suffix(d)} ${monthName} ${y}`;
};
//  API → INPUT
export const formatToYYYYMMDD = (dateString?: string) => {
  if (!dateString) return "";
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
};
// formate change
export const formatToDDMMYYYY = (dateString: string) => {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

export const formatBookingDate = (date?: string | null): string => {
  if (!date) return "-";

  // API format: DD-MM-YYYY
  const parts = date.split("-");

  if (parts.length !== 3) return date;

  const [day, month, year] = parts;

  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const normalizeToYYYYMMDD = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  const clean = String(dateStr).split("T")[0].split(" ")[0].trim();
  const parts = clean.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    }
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return clean;
};

export const normalizeToDDMMYYYY = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  const clean = String(dateStr).split("T")[0].split(" ")[0].trim();
  const parts = clean.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 2 && parts[2].length === 4) {
      return `${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}-${parts[2]}`;
    }
    if (parts[0].length === 4) {
      const [yyyy, mm, dd] = parts;
      return `${dd.padStart(2, "0")}-${mm.padStart(2, "0")}-${yyyy}`;
    }
  }
  return clean;
};
