export const toInputDate = (date?: string) => {
  if (!date) return "";
  const [dd, mm, yyyy] = date.split("-");
  return `${yyyy}-${mm}-${dd}`;
};
