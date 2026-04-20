import React from "react";
import Barcode from "react-barcode";

interface PatientInfo {
  uhid: string;
  name: string;
  ageSex: string;
  consultant: string;
  opdRoomNo?: string;
  department: string;
  referBy?: string;
  date: string;
  contactNo: string;
  address: string;
  drRegNo?: string;
  panel: string;
  receiptNo?: string;
  userName?: string;
  tokenNo: number | string;
}

interface OpdCardApiPatient {
  UHID?: string;
  PatientName?: string;
  Age?: string;
  Gender?: string;
  Relation?: string;
  CreatedDate?: string;
  CreatedTime?: string;
  CorporateName?: string;
  ContactNumber?: string;
  CompleteName?: string;
  Department?: string;
  Address?: string;
  AppointmentNo?: number | string;
  BillNo?: string;
  ReceiptNo?: string;
  OPDRoomNo?: string;
}

interface Vitals {
  bp?: string;
  temp?: string;
  pulse?: string;
  weight?: string;
  spo2?: string;
  height?: string;
  rr?: string;
  bmi?: string;
}

interface OpdCardProps {
  patient?: Partial<PatientInfo & OpdCardApiPatient>;
  vitals?: Vitals;
  chiefComplaint?: string;
  followUpDateTime?: string;
  emergencyContact?: string;
  appointmentContact?: string;
}

const defaultPatient: PatientInfo = {
  uhid: "",
  name: "",
  ageSex: "",
  consultant: "",
  opdRoomNo: "",
  department: "",
  referBy: "",
  date: "",
  contactNo: "",
  address: "",
  drRegNo: "",
  panel: "",
  receiptNo: "",
  userName: "",
  tokenNo: "",
};

const painFaces = [
  { emoji: "\u{1F60A}", score: 0, label: "No Hurt" },
  { emoji: "\u{1F642}", score: 2, label: "Hurts Little Bit" },
  { emoji: "\u{1F610}", score: 4, label: "Hurts Little More" },
  { emoji: "\u{1F61F}", score: 6, label: "Hurts Even More" },
  { emoji: "\u{1F622}", score: 8, label: "Hurts Whole Lot" },
  { emoji: "\u{1F62D}", score: 10, label: "Hurts Worst" },
];

const knownHO = [
  ["Asthma", "Hypothyroid"],
  ["DM", "CKD"],
  ["HTN", "Surgery"],
  ["COPD", "Stroke"],
];

const allergies = [
  ["Drug", "Previous ADR (If Any)"],
  ["Food", ""],
];

const nutritionalItems = [
  ["Pale", "Under Weight"],
  ["Weakness", "Nutrition need in Kcal (Weight x 29/40)"],
  ["Muscle Wasting", "............."],
  ["Decrease in Food intake", "Severe Malnutrition"],
];

const dietItems = [
  ["Normal", "Renal"],
  ["Low Salt", "Semi-Solid"],
  ["Hepatic", "Pregnancy"],
  ["Cardiac", "K. Cal Required"],
  ["Anti-Bloating", "Any Other"],
];

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: "800px",
    maxWidth: "100%",
    margin: "18px auto",
    background: "#fff",
    border: "1px solid #ccc",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    fontFamily: "Times New Roman, serif",
    fontSize: "13px",
    color: "#000",
    padding: "14px",
    boxSizing: "border-box",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #000",
    paddingBottom: "8px",
    marginBottom: "10px",
    gap: "10px",
  },
  titleText: {
    fontSize: "22px",
    fontWeight: "bold",
    letterSpacing: "0.8px",
  },
  tokenText: {
    fontSize: "14px",
    fontWeight: "bold",
    whiteSpace: "nowrap" as const,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4px 16px",
    marginBottom: "12px",
    paddingBottom: "10px",
    borderBottom: "1px solid #000",
  },
  infoRow: {
    display: "flex",
    gap: "4px",
    padding: "1px 0",
    alignItems: "flex-start",
  },
  infoLabel: {
    minWidth: "96px",
    fontWeight: "bold",
    flexShrink: 0,
  },
  infoColon: {
    marginRight: "4px",
  },
  infoVal: {
    wordBreak: "break-word" as const,
  },
  bodyGrid: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "10px",
    alignItems: "start",
  },
  leftPanel: {
    border: "2px solid #000",
    display: "flex",
    flexDirection: "column",
  },
  section: {
    padding: "8px 6px",
    borderTop: "2px solid #000",
  },
  sectionFirst: {
    padding: "8px 6px",
  },
  sectionLast: {
    padding: "8px 6px",
    borderTop: "2px solid #000",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: "11px",
    marginBottom: "6px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.3px",
  },
  sectionSubTitle: {
    fontWeight: "bold",
    fontSize: "11px",
    marginBottom: "4px",
  },
  painRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "4px",
  },
  painFaceCell: {
    textAlign: "center" as const,
    fontSize: "11px",
    lineHeight: 1.2,
    maxWidth: "30px",
  },
  faceEmoji: {
    display: "block",
    fontSize: "16px",
    lineHeight: "1.1",
  },
  faceScore: {
    display: "block",
    fontWeight: "bold",
  },
  faceLabel: {
    display: "block",
    fontSize: "10px",
    lineHeight: 1.1,
  },
  listGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2px 10px",
  },
  listItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "4px",
    fontSize: "11px",
    lineHeight: 1.2,
  },
  arrow: {
    fontSize: "9px",
    marginTop: "2px",
    flexShrink: 0,
  },
  rightPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  chiefHeader: {
    fontWeight: "bold",
    fontSize: "15px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginBottom: "6px",
  },
  vitalsTable: {
    borderCollapse: "collapse" as const,
    width: "100%",
    fontSize: "12px",
  },
  vtd: {
    border: "1px solid #000",
    padding: "4px 6px",
  },
  vLabel: {
    fontWeight: "bold",
    width: "58px",
    background: "#f5f5f5",
  },
  vVal: {
    minWidth: "70px",
  },
  vUnit: {
    width: "48px",
  },
  chiefArea: {
    border: "1px solid #000",
    minHeight: "160px",
    padding: "8px",
    marginTop: "8px",
    whiteSpace: "pre-wrap" as const,
  },
  placeholder: {
    color: "#666",
    fontStyle: "italic",
  },
  bottomSection: {
    marginTop: "12px",
    borderTop: "1px solid #000",
    paddingTop: "8px",
  },
  followUpText: {
    fontSize: "13px",
    lineHeight: 1.5,
    marginBottom: "6px",
  },
  dateTimeRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "6px",
  },
  dateTimeLabel: {
    fontWeight: "bold",
    border: "1px solid #000",
    padding: "3px 8px",
  },
  dateTimeInput: {
    border: "1px solid #000",
    padding: "3px 8px",
    fontSize: "12px",
    width: "220px",
    outline: "none",
    fontFamily: "Courier New, monospace",
  },
  emergencyText: {
    fontSize: "13px",
    lineHeight: 1.5,
  },
};

const buildAgeSex = (patient?: Partial<PatientInfo & OpdCardApiPatient>) => {
  if (patient?.ageSex) return patient.ageSex;

  const age = patient?.Age ?? "";
  const gender = patient?.Gender ?? "";
  return [age, gender].filter(Boolean).join(" / ");
};

const buildDateTime = (patient?: Partial<PatientInfo & OpdCardApiPatient>) => {
  if (patient?.date) return patient.date;

  const date = patient?.CreatedDate ?? "";
  const time = patient?.CreatedTime ?? "";
  return [date, time].filter(Boolean).join(" ");
};

const normalizePatient = (patient?: Partial<PatientInfo & OpdCardApiPatient>): PatientInfo => ({
  uhid: patient?.uhid ?? patient?.UHID ?? defaultPatient.uhid,
  name: patient?.name ?? patient?.PatientName ?? defaultPatient.name,
  ageSex: buildAgeSex(patient),
  consultant: patient?.consultant ?? patient?.CompleteName ?? defaultPatient.consultant,
  opdRoomNo: patient?.opdRoomNo ?? patient?.OPDRoomNo ?? defaultPatient.opdRoomNo,
  department: patient?.department ?? patient?.Department ?? defaultPatient.department,
  referBy: patient?.referBy ?? patient?.Relation ?? defaultPatient.referBy,
  date: buildDateTime(patient),
  contactNo: patient?.contactNo ?? patient?.ContactNumber ?? defaultPatient.contactNo,
  address: patient?.address ?? patient?.Address ?? defaultPatient.address,
  drRegNo: patient?.drRegNo ?? defaultPatient.drRegNo,
  panel: patient?.panel ?? patient?.CorporateName ?? defaultPatient.panel,
  receiptNo:
    patient?.receiptNo ?? patient?.ReceiptNo ?? patient?.BillNo ?? defaultPatient.receiptNo,
  userName: patient?.userName ?? defaultPatient.userName,
  tokenNo: patient?.tokenNo ?? patient?.AppointmentNo ?? defaultPatient.tokenNo,
});

const InfoRow: React.FC<{ label: string; value?: string; bold?: boolean }> = ({
  label,
  value = "",
  bold,
}) => (
  <div style={styles.infoRow}>
    <span style={{ ...styles.infoLabel, ...(bold ? { fontWeight: "bold" } : {}) }}>{label}</span>
    <span style={styles.infoColon}>:</span>
    <span style={styles.infoVal}>{value}</span>
  </div>
);

const ListGrid: React.FC<{ items: string[][] }> = ({ items }) => (
  <div style={styles.listGrid}>
    {items.flatMap((row, ri) =>
      row.map((item, ci) =>
        item ? (
          <div key={`${ri}-${ci}`} style={styles.listItem}>
            <span style={styles.arrow}>&#9658;</span>
            <span>{item}</span>
          </div>
        ) : (
          <div key={`${ri}-${ci}`} />
        )
      )
    )}
  </div>
);

const OpdCard: React.FC<OpdCardProps> = ({
  patient,
  vitals = {},
  chiefComplaint = "",
  followUpDateTime = "",
  emergencyContact = "+91-9125760017",
  appointmentContact = "+91-915760017",
}) => {
  const mappedPatient = normalizePatient(patient);

  const today = new Date();
  const todayDate = today.toLocaleDateString();
  const todayTime = today.toLocaleTimeString();

  return (
    <div style={styles.wrapper}>
      <div style={styles.titleRow}>
        <span style={styles.titleText}>OPD CARD</span>
        <Barcode
          value={mappedPatient.uhid || "NA"}
          format="CODE128"
          width={1.2}
          height={34}
          displayValue={false}
          margin={0}
          background="transparent"
          lineColor="#111"
        />
        <span style={styles.tokenText}>Token No: {mappedPatient.tokenNo || "-"}</span>
      </div>

      <div style={styles.infoGrid}>
        <div>
          <InfoRow label="UHID" value={mappedPatient.uhid} />
          <InfoRow label="Name" value={mappedPatient.name} bold />
          <InfoRow label="Age/Sex" value={mappedPatient.ageSex} />
          <InfoRow label="Consultant" value={mappedPatient.consultant} />
          <InfoRow label="OPD Room No." value={mappedPatient.opdRoomNo} bold />
          <InfoRow label="Department" value={mappedPatient.department} />
          <InfoRow label="Refer By" value={mappedPatient.referBy} />
        </div>
        <div>
          <InfoRow label="Date" value={mappedPatient.date} />
          <InfoRow label="Contact No." value={mappedPatient.contactNo} />
          <InfoRow label="Address" value={mappedPatient.address} />
          <InfoRow label="Dr. Reg No." value={mappedPatient.drRegNo} />
          <InfoRow label="Panel" value={mappedPatient.panel} />
          <InfoRow label="Receipt No." value={mappedPatient.receiptNo} />
          <InfoRow label="User Name" value={mappedPatient.userName} />
        </div>
      </div>

      <div style={styles.bodyGrid}>
        <div style={styles.leftPanel}>
          <div style={styles.sectionFirst}>
            <div style={styles.sectionTitle}>Pain Assessment Score</div>
            <div style={styles.painRow}>
              {painFaces.map(face => (
                <div key={face.score} style={styles.painFaceCell}>
                  <span style={styles.faceEmoji}>{face.emoji}</span>
                  <span style={styles.faceScore}>{face.score}</span>
                  <span style={styles.faceLabel}>{face.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>KNOWN H/O</div>
            <ListGrid items={knownHO} />
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>ALLERGY</div>
            <ListGrid items={allergies} />
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>NUTRITIONAL SCREENING</div>
            <ListGrid items={nutritionalItems} />
          </div>

          <div style={styles.sectionLast}>
            <div style={styles.sectionSubTitle}>Type of Diet Advised</div>
            <div style={styles.sectionTitle}>TYPE OF DIET ADVISED</div>
            <ListGrid items={dietItems} />
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div>
            <div style={styles.chiefHeader}>
              <span style={{ fontSize: "11px" }}>&#9658;</span>
              CHIEF COMPLAINT
            </div>
            <table style={styles.vitalsTable}>
              <tbody>
                <tr>
                  <td style={{ ...styles.vtd, ...styles.vLabel }}>BP:</td>
                  <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.bp ?? ""}</td>
                  <td style={{ ...styles.vtd, ...styles.vUnit }}>mmHg</td>
                  <td style={{ ...styles.vtd, ...styles.vLabel }}>Temp:</td>
                  <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.temp ?? ""}</td>
                  <td style={{ ...styles.vtd, ...styles.vUnit }}>deg F</td>
                </tr>
                <tr>
                  <td style={{ ...styles.vtd, ...styles.vLabel }}>Pulse:</td>
                  <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.pulse ?? ""}</td>
                  <td style={{ ...styles.vtd, ...styles.vUnit }}>PPM</td>
                  <td style={{ ...styles.vtd, ...styles.vLabel }}>Weight:</td>
                  <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.weight ?? ""}</td>
                  <td style={{ ...styles.vtd, ...styles.vUnit }}>Kg</td>
                </tr>
                <tr>
                  <td style={{ ...styles.vtd, ...styles.vLabel }}>SpO2:</td>
                  <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.spo2 ?? ""}</td>
                  <td style={{ ...styles.vtd, ...styles.vUnit }}>%</td>
                  <td style={{ ...styles.vtd, ...styles.vLabel }}>Height:</td>
                  <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.height ?? ""}</td>
                  <td style={{ ...styles.vtd, ...styles.vUnit }}>cm</td>
                </tr>
                <tr>
                  <td style={{ ...styles.vtd, ...styles.vLabel }}>R/R:</td>
                  <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.rr ?? ""}</td>
                  <td style={{ ...styles.vtd, ...styles.vUnit }}>BPM</td>
                  <td style={{ ...styles.vtd, ...styles.vLabel }}>BMI:</td>
                  <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.bmi ?? ""}</td>
                  <td style={{ ...styles.vtd, ...styles.vUnit }}>Kg/m2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={styles.bottomSection}>
        <div style={styles.followUpText}>
          <strong>Next follow-up date and time with prior appointment on </strong>
          <strong>{appointmentContact}</strong>
        </div>

        <div style={styles.dateTimeRow}>
          <span style={styles.dateTimeLabel}>&#9658; Date &amp; Time:</span>
          <input
            type="text"
            style={styles.dateTimeInput}
            defaultValue={`${todayDate} ${todayTime}`}
            placeholder="DD-MM-YYYY HH:MM"
          />
        </div>

        <div style={styles.emergencyText}>
          <strong>In case of any medical emergency please call us on </strong>
          <strong>{emergencyContact}</strong> (24x7)
        </div>
      </div>
    </div>
  );
};

export default OpdCard;
