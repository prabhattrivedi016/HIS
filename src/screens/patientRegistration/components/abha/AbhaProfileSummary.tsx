import { extractAbhaAddress, extractAbhaNumber, extractPhoto, formatAbhaDobToDDMMYYYY } from "./abhaFieldMapper";
import { AbdmProfile } from "./abhaTypes";

type Props = {
  profile: AbdmProfile;
  onBind: () => void;
  binding?: boolean;
};

const Row = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="mb-1.5 flex text-sm">
    <span className="w-32 shrink-0 font-bold text-[#003366]">{label}</span>
    <span className="flex-1 break-words text-gray-800">{value || "-"}</span>
  </div>
);

const AbhaProfileSummary = ({ profile, onBind, binding }: Props) => {
  const photo = extractPhoto(profile);

  return (
    <div className="rounded-lg border border-[#cde8f8] bg-[#f7fbff] p-3.5">
      {photo && (
        <img
          src={photo.startsWith("data:") ? photo : `data:image/jpeg;base64,${photo}`}
          alt="ABHA profile"
          className="float-right ml-3 mb-1.5 h-20 w-20 rounded-lg border-2 border-[#00c0ef] object-cover"
        />
      )}
      <div style={{ overflow: "hidden" }}>
        <Row label="ABHA Address" value={extractAbhaAddress(profile)} />
        <Row label="ABHA Number" value={extractAbhaNumber(profile)} />
        <Row label="Name" value={profile.name || [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ")} />
        <Row label="Gender" value={profile.gender === "M" ? "Male" : profile.gender === "F" ? "Female" : profile.gender} />
        <Row label="DOB" value={formatAbhaDobToDDMMYYYY(profile)} />
        <Row label="Mobile" value={profile.mobile} />
        <Row label="Address" value={profile.address} />
        <Row label="State" value={profile.stateName} />
        <Row label="District" value={profile.districtName} />
        <Row label="Pincode" value={profile.pincode || profile.pinCode} />
      </div>

      <div className="mt-2.5 flex justify-center">
        <button type="button" className="save-btn" onClick={onBind} disabled={binding}>
          {binding ? "Binding..." : "✓ Bind Details to Patient"}
        </button>
      </div>
    </div>
  );
};

export default AbhaProfileSummary;
