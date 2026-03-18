export const toInputDate = (date?: string) => {
  if (!date) return "";
  const [dd, mm, yyyy] = date.split("-");
  return `${yyyy}-${mm}-${dd}`;
};

// ✅ UI FORMAT → "31st March"
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
// ✅ API → INPUT
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
