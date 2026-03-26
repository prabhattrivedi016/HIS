export const createPatientFormData = async (data: any, image?: string | null) => {
  const formData = new FormData();

  // helper for DOB
  const formatDob = (dob?: string) => {
    if (!dob) return "string";
    const [y, m, d] = dob.split("-");
    return `${d}-${m}-${y}`;
  };

  formData.append("PatientId", String(data.PatientId ?? 0));
  formData.append("BranchId", String(data.BranchId ?? 0));

  formData.append("Title", (data.Title || "miss").toLowerCase().replace(".", ""));
  formData.append("FirstName", data.FirstName || "string");
  formData.append("MiddleName", data.MiddleName || "string");
  formData.append("LastName", data.LastName || "string");

  formData.append("AgeYears", String(data.AgeYears ?? 0));
  formData.append("AgeMonths", String(data.AgeMonths ?? 0));
  formData.append("AgeDays", String(data.AgeDays ?? 0));

  formData.append("Dob", formatDob(data.Dob));

  formData.append("Gender", data.Gender || "Female");

  formData.append("MaritalStatus", data.MaritalStatus || "string");
  formData.append("Relation", data.Relation || "string");
  formData.append("RelativeName", data.RelativeName || "string");

  formData.append("IdProofName", data.IdProofName || "string");
  formData.append("IdProofNumber", data.IdProofNumber || "string");

  formData.append("SelfContactNumber", data.SelfContactNumber || "string");
  formData.append("EmergencyContactNumber", data.EmergencyContactNumber || "string");
  formData.append("Email", data.Email || "string");

  formData.append("Address", data.Address || "string");
  formData.append("CountryId", String(data.CountryId ?? 0));
  formData.append("Country", data.Country || "string");
  formData.append("StateId", String(data.StateId ?? 0));
  formData.append("State", data.State || "string");
  formData.append("DistrictId", String(data.DistrictId ?? 0));
  formData.append("District", data.District || "string");
  formData.append("CityId", String(data.CityId ?? 0));
  formData.append("City", data.City || "string");

  formData.append("InsuranceCompanyId", String(data.InsuranceCompanyId ?? 0));
  formData.append("CorporateId", String(data.CorporateId ?? 0));
  formData.append("CardNo", data.CardNo || "string");

  if (image) {
    const blob = await fetch(image).then(res => res.blob());
    formData.append("PatientImageFile", blob, "patient.jpg");
  } else {
    formData.append("PatientImageFile", "");
  }

  formData.append("UniqueId", data.UniqueId || "string");
  formData.append("IsVaccination", String(data.IsVaccination ?? 0));
  formData.append("VipPatient", String(data.VipPatient ?? 0));

  formData.append("PolicyNo", data.PolicyNo || "string");
  formData.append("PolicyCardNo", data.PolicyCardNo || "string");
  formData.append("ExpiryDate", data.ExpiryDate || "string");
  formData.append("CardHolder", data.CardHolder || "string");

  formData.append("ReferalNo", data.ReferalNo || "string");
  formData.append("ReferalDate", data.ReferalDate || "string");

  formData.append("OnlinePtId", String(data.OnlinePtId ?? 0));
  formData.append("HealthId", data.HealthId || "string");
  formData.append("HealthIdNumber", data.HealthIdNumber || "string");
  formData.append("UhidOrBarcode", data.UhidOrBarcode || "string");

  formData.append("SearchBy", data.SearchBy || "string");
  formData.append("SearchValue", data.SearchValue || "string");

  return formData;
};
