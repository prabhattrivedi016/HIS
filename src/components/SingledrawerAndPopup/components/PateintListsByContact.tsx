import CentralPopup from "@/components/centralPopup";
import { PatientSearchByContactTableHeader } from "@/constants/tableHeaders";

interface PatientListItem {
  PatientId: number;
  UHID: string;
  PatientName: string;
  Age: string;
  Gender: string;
  ContactNumber: string;
  EmergencyContactNumber?: string;
  IdProofNumber?: string;
  Address?: string;
  RegistrationDate?: string;
}

interface PateintListssByContactProps<T> {
  showPopup: boolean;
  onClose?: () => void;
  data: T[];
  activeIndex?: number;
  setActiveIndex?: (index: number) => void;
  onSelect: (item: T) => void;
  getLabel?: (item: T) => string;
}

const PateintListssByContact = <T extends PatientListItem>({
  showPopup,
  onClose,
  data,
  onSelect,
}: PateintListssByContactProps<T>) => {
  if (!showPopup) return null;

  return (
    <CentralPopup
      title="Patient Search Results"
      onClose={onClose || (() => {})}
      isOpen={showPopup}
      className="w-[95vw] lg:min-w-250"
    >
      <div className="table-container mt-2">
        <div className="table-scroll-wrapper">
          <div className="table-size lg:min-h-60 lg:max-h-[400px] overflow-y-auto">
            <table className="base-table">
              <thead className="table-head">
                <tr>
                  {PatientSearchByContactTableHeader.map((h, index) => (
                    <th key={index} className="table-th">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={PatientSearchByContactTableHeader.length}
                      className="table-empty text-center py-4"
                    >
                      No records found
                    </td>
                  </tr>
                ) : (
                  data.map((item: any, idx: number) => {
                    const uhid = item?.uhid ?? item?.UHID ?? "-";
                    const name = item?.patientName ?? item?.PatientName ?? "-";
                    const dobRaw = item?.dob ?? item?.DOB ?? "-";
                    const dob = dobRaw !== "-" ? dobRaw.split("T")[0] : "-";
                    const gender = item?.gender ?? item?.Gender ?? "-";
                    const contact = item?.contactNumber ?? item?.ContactNumber ?? "-";

                    const address =
                      item?.address ??
                      item?.Address ??
                      item?.fullAddress ??
                      item?.FullAddress ??
                      "-";
                    const regDate = item?.registrationDate ?? item?.RegistrationDate ?? "-";

                    return (
                      <tr
                        key={idx}
                        className="table-row cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => onSelect(item)}
                      >
                        <td className="table-td ">{idx + 1}</td>
                        <td className="table-td ">{uhid}</td>

                        <td className="table-td">{name}</td>
                        <td className="table-td">{dob}</td>
                        <td className="table-td">{gender}</td>
                        <td className="table-td">{contact}</td>
                        <td className="table-td">{address}</td>
                        <td className="table-td">{regDate}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CentralPopup>
  );
};

export default PateintListssByContact;
