import { AbdmProfile } from "./abhaTypes";

const pad2 = (value: string | number) => String(value).padStart(2, "0");

export const formatAbhaDobToDDMMYYYY = (profile: AbdmProfile): string => {
  if (profile.dayOfBirth && profile.monthOfBirth && profile.yearOfBirth) {
    return `${pad2(profile.dayOfBirth)}-${pad2(profile.monthOfBirth)}-${profile.yearOfBirth}`;
  }

  const dob = profile.dob?.trim();
  if (!dob) return "";

  const isoMatch = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch;
    return `${dd}-${mm}-${yyyy}`;
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(dob)) return dob;

  return "";
};

export const extractAbhaAddress = (profile: AbdmProfile): string => {
  if (profile.preferredAbhaAddress) return profile.preferredAbhaAddress;
  if (Array.isArray(profile.phrAddress)) return profile.phrAddress[0] ?? "";
  if (typeof profile.phrAddress === "string") return profile.phrAddress;
  return profile.abhaAddress ?? profile.healthId ?? "";
};

export const extractAbhaNumber = (profile: AbdmProfile): string =>
  profile.ABHANumber ?? profile.abhaNumber ?? "";

export const extractPhoto = (profile: AbdmProfile): string =>
  profile.photo ?? profile.kycPhoto ?? profile.profilePhoto ?? "";

export const mapAbhaProfileToPatientDetails = (profile: AbdmProfile): Record<string, unknown> => ({
  FirstName: profile.firstName ?? "",
  MiddleName: profile.middleName ?? "",
  LastName: profile.lastName ?? "",
  dob: formatAbhaDobToDDMMYYYY(profile),
  Gender: profile.gender ?? "",
  ContactNumber: profile.mobile ?? "",
  Email: profile.email ?? "",
  Address: profile.address ?? "",
  State: profile.stateName ?? "",
  District: profile.districtName ?? "",
  HealthId: extractAbhaAddress(profile),
  HealthIdNumber: extractAbhaNumber(profile),
  _photoBase64: extractPhoto(profile),
});
