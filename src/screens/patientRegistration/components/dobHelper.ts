// utils/dateHelpers.ts
export const getAgeFromDob = (dob: string) => {
  if (!dob) return null;

  const birthDate = new Date(`${dob}T00:00:00`);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }

  if (months < 0) {
    months += 12;
    years--;
  }

  return { years, months, days };
};

// utils/dateHelpers.ts
export const getDobFromAge = (years: number, months: number, days: number) => {
  const today = new Date();

  const birthDate = new Date(today);
  birthDate.setFullYear(today.getFullYear() - (years || 0));
  birthDate.setMonth(today.getMonth() - (months || 0));
  birthDate.setDate(today.getDate() - (days || 0));

  if (isNaN(birthDate.getTime())) return "";

  return formatDate(birthDate);
};

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const normalize = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export const resolvePickValue = (
  options: Array<{ value?: string }>,
  incoming: unknown,
  aliases: Record<string, string[]> = {}
) => {
  const incomingNormalized = normalize(incoming);
  if (!incomingNormalized) return "";

  for (const [canonical, aliasList] of Object.entries(aliases)) {
    if (aliasList.includes(incomingNormalized)) {
      const matched = options.find(item => normalize(item?.value) === normalize(canonical));
      if (matched?.value) return matched.value;
    }
  }

  const directMatch = options.find(item => normalize(item?.value) === incomingNormalized);
  return directMatch?.value ?? String(incoming ?? "");
};

export const resolveMaritalStatus = (value: unknown) => {
  const normalized = normalize(value);
  if (!normalized) return "";
  if (["married", "m"].includes(normalized)) return "MARRIED";
  if (["unmarried", "unmarid", "single", "um", "unm", "unmarriedstatus"].includes(normalized))
    return "UN-MARRIED";
  return String(value ?? "");
};

export const normalizePatientGenderForApi = (value: unknown): string => {
  const normalized = normalize(value);
  if (!normalized) return "";

  if (["male", "m", "man", "boy"].includes(normalized) || normalized.startsWith("mal")) {
    return "Male";
  }

  if (["female", "f", "woman", "girl"].includes(normalized) || normalized.startsWith("fem")) {
    return "Female";
  }

  if (
    ["other", "o", "others", "transgender", "trans"].includes(normalized) ||
    normalized.startsWith("oth")
  ) {
    return "Other";
  }

  return "";
};
