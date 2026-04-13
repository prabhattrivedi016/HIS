// import React from "react";
// import Barcode from "react-barcode";

// // Install dependency: npm install react-barcode

// interface PatientInfo {
//   uhid: string;
//   name: string;
//   ageSex: string;
//   consultant: string;
//   opdRoomNo?: string;
//   department: string;
//   referBy?: string;
//   date: string;
//   contactNo: string;
//   address: string;
//   drRegNo?: string;
//   panel: string;
//   receiptNo?: string;
//   userName?: string;
//   tokenNo: number | string;
// }

// interface Vitals {
//   bp?: string;
//   temp?: string;
//   pulse?: string;
//   weight?: string;
//   spo2?: string;
//   height?: string;
//   rr?: string;
//   bmi?: string;
// }

// interface OpdCardProps {
//   patient?: PatientInfo;
//   vitals?: Vitals;
//   chiefComplaint?: string;
// }

// const defaultPatient: PatientInfo = {
//   uhid: "202602050005",
//   name: "MR. DEMO",
//   ageSex: "20Y 2M 4D / MALE",
//   consultant: "Dr. Demo Maurya, MBBS, MD",
//   opdRoomNo: "",
//   department: "MEDICINE",
//   referBy: "",
//   date: "09-04-2026 12:00PM",
//   contactNo: "9999999999",
//   address: "VARANASI UTTAR PRADESH",
//   drRegNo: "",
//   panel: "CASH",
//   receiptNo: "",
//   userName: "",
//   tokenNo: 1,
// };

// const painFaces = [
//   { emoji: "😊", score: 0, label: "No Hurt" },
//   { emoji: "🙂", score: 2, label: "Hurts Little Bit" },
//   { emoji: "😐", score: 4, label: "Hurts Little More" },
//   { emoji: "😟", score: 6, label: "Hurts Even More" },
//   { emoji: "😢", score: 8, label: "Hurts Whole Lot" },
//   { emoji: "😭", score: 10, label: "Hurts Worst" },
// ];

// const knownHO = [
//   ["Asthma", "Hypothyroid"],
//   ["DM", "CKD"],
//   ["HTN", "Surgery"],
//   ["COPD", "Stroke"],
// ];

// const allergies = [
//   ["Drug", "Previous ADR (If Any)"],
//   ["Food", ""],
// ];

// const nutritionalItems = [
//   ["Pale", "Under Weight"],
//   ["Weakness", "Nutrition need in Kcal (Weight × 29/40)"],
//   ["Muscle Wasting", "............"],
//   ["Decrease in Food intake", "Severe Malnutrition"],
// ];

// const styles: Record<string, React.CSSProperties> = {
//   wrapper: {
//     fontFamily: "Arial, sans-serif",
//     fontSize: "12px",
//     color: "#111",
//     border: "1px solid #999",
//     borderRadius: "4px",
//     padding: "12px 14px",
//     maxWidth: "960px",
//     margin: "0 auto",
//     background: "#fff",
//     boxSizing: "border-box",
//   },
//   titleRow: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: "10px",
//     borderBottom: "2px solid #333",
//     paddingBottom: "8px",
//     marginBottom: "10px",
//   },
//   titleText: {
//     fontSize: "20px",
//     fontWeight: "bold",
//     letterSpacing: "1px",
//   },
//   tokenText: {
//     fontSize: "13px",
//     fontWeight: "normal",
//     whiteSpace: "nowrap" as const,
//   },
//   infoGrid: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: "1px 20px",
//     marginBottom: "10px",
//     paddingBottom: "10px",
//     borderBottom: "1px solid #bbb",
//   },
//   infoRow: {
//     display: "flex",
//     gap: "4px",
//     padding: "2px 0",
//     alignItems: "flex-start",
//   },
//   infoLabel: {
//     minWidth: "95px",
//     color: "#333",
//     flexShrink: 0,
//   },
//   infoColon: {
//     color: "#666",
//     marginRight: "4px",
//   },
//   infoVal: {
//     color: "#111",
//   },
//   boldLabel: {
//     fontWeight: "bold",
//   },
//   bodyGrid: {
//     display: "grid",
//     gridTemplateColumns: "190px 1fr",
//     gap: "10px",
//     alignItems: "start",
//   },
//   leftPanel: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "8px",
//   },
//   panelBox: {
//     border: "1px solid #bbb",
//     borderRadius: "3px",
//     padding: "6px 8px",
//   },
//   panelTitle: {
//     fontWeight: "bold",
//     fontSize: "11px",
//     borderBottom: "1px solid #ddd",
//     paddingBottom: "4px",
//     marginBottom: "6px",
//     textTransform: "uppercase" as const,
//     letterSpacing: "0.3px",
//   },
//   painRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     marginTop: "4px",
//   },
//   painFaceCell: {
//     textAlign: "center" as const,
//     fontSize: "9px",
//     lineHeight: 1.2,
//     color: "#444",
//     maxWidth: "28px",
//   },
//   faceEmoji: {
//     display: "block",
//     fontSize: "18px",
//     lineHeight: "1.2",
//   },
//   faceScore: {
//     display: "block",
//     fontWeight: "bold",
//     fontSize: "9px",
//   },
//   faceLabel: {
//     display: "block",
//     fontSize: "8px",
//     color: "#666",
//     lineHeight: 1.1,
//   },
//   listGrid: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: "2px 6px",
//     marginTop: "2px",
//   },
//   listItem: {
//     display: "flex",
//     alignItems: "flex-start",
//     gap: "3px",
//     fontSize: "11px",
//     color: "#111",
//     lineHeight: 1.4,
//   },
//   arrow: {
//     color: "#555",
//     fontSize: "10px",
//     flexShrink: 0,
//     marginTop: "1px",
//   },
//   rightPanel: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "10px",
//   },
//   chiefHeader: {
//     fontWeight: "bold",
//     fontSize: "12px",
//     display: "flex",
//     alignItems: "center",
//     gap: "5px",
//     marginBottom: "6px",
//   },
//   vitalsTable: {
//     borderCollapse: "collapse" as const,
//     width: "auto",
//     fontSize: "12px",
//   },
//   vtd: {
//     border: "1px solid #aaa",
//     padding: "4px 8px",
//   },
//   vLabel: {
//     fontWeight: "bold",
//     width: "58px",
//     background: "#f5f5f5",
//   },
//   vVal: {
//     minWidth: "90px",
//   },
//   vUnit: {
//     color: "#444",
//     width: "52px",
//   },
//   chiefArea: {
//     border: "1px solid #bbb",
//     borderRadius: "3px",
//     minHeight: "200px",
//     padding: "8px",
//     fontSize: "12px",
//     color: "#aaa",
//     fontStyle: "italic",
//   },
// };

// // ── Sub-components ───────────────────────────────────────────────

// const InfoRow: React.FC<{ label: string; value?: string; bold?: boolean }> = ({
//   label,
//   value = "",
//   bold,
// }) => (
//   <div style={styles.infoRow}>
//     <span style={{ ...styles.infoLabel, ...(bold ? styles.boldLabel : {}) }}>{label}</span>
//     <span style={styles.infoColon}>:</span>
//     <span style={styles.infoVal}>{value}</span>
//   </div>
// );

// const PanelBox: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
//   <div style={styles.panelBox}>
//     <div style={styles.panelTitle}>{title}</div>
//     {children}
//   </div>
// );

// const ListGrid: React.FC<{ items: string[][] }> = ({ items }) => (
//   <div style={styles.listGrid}>
//     {items.flatMap((row, ri) =>
//       row.map((item, ci) =>
//         item ? (
//           <div key={`${ri}-${ci}`} style={styles.listItem}>
//             <span style={styles.arrow}>&#9658;</span>
//             <span>{item}</span>
//           </div>
//         ) : (
//           <div key={`${ri}-${ci}`} />
//         )
//       )
//     )}
//   </div>
// );

// // ── Main Component ───────────────────────────────────────────────

// const OpdCard: React.FC<OpdCardProps> = ({
//   patient = defaultPatient,
//   vitals = {},
//   chiefComplaint = "",
// }) => {
//   return (
//     <div style={styles.wrapper}>
//       {/* ── Title row with react-barcode ── */}
//       <div style={styles.titleRow}>
//         <span style={styles.titleText}>OPD CARD</span>

//         {/*
//           react-barcode encodes the UHID as a real CODE128 barcode.
//           displayValue={false} hides the number below the bars (it's
//           already shown in the info grid below).
//         */}
//         <Barcode
//           value={patient.uhid}
//           format="CODE128"
//           width={1.2}
//           height={36}
//           displayValue={false}
//           margin={0}
//           background="transparent"
//           lineColor="#111"
//         />

//         <span style={styles.tokenText}>Token No: {patient.tokenNo}</span>
//       </div>

//       {/* ── Patient Info Grid ── */}
//       <div style={styles.infoGrid}>
//         <div>
//           <InfoRow label="UHID" value={patient.uhid} />
//           <InfoRow label="Name" value={patient.name} bold />
//           <InfoRow label="Age/Sex" value={patient.ageSex} />
//           <InfoRow label="Consultant" value={patient.consultant} />
//           <InfoRow label="OPD Room No." value={patient.opdRoomNo} bold />
//           <InfoRow label="Department" value={patient.department} />
//           <InfoRow label="Refer By" value={patient.referBy} />
//         </div>
//         <div>
//           <InfoRow label="Date" value={patient.date} />
//           <InfoRow label="Contact No." value={patient.contactNo} />
//           <InfoRow label="Address" value={patient.address} />
//           <InfoRow label="Dr. Reg No." value={patient.drRegNo} />
//           <InfoRow label="Panel" value={patient.panel} />
//           <InfoRow label="Receipt No." value={patient.receiptNo} />
//           <InfoRow label="User Name" value={patient.userName} />
//         </div>
//       </div>

//       {/* ── Body ── */}
//       <div style={styles.bodyGrid}>
//         {/* Left Panel */}
//         <div style={styles.leftPanel}>
//           <PanelBox title="Pain Assessment Score">
//             <div style={styles.painRow}>
//               {painFaces.map(f => (
//                 <div key={f.score} style={styles.painFaceCell}>
//                   <span style={styles.faceEmoji}>{f.emoji}</span>
//                   <span style={styles.faceScore}>{f.score}</span>
//                   <span style={styles.faceLabel}>{f.label}</span>
//                 </div>
//               ))}
//             </div>
//           </PanelBox>

//           <PanelBox title="Known H/O">
//             <ListGrid items={knownHO} />
//           </PanelBox>

//           <PanelBox title="Allergy">
//             <ListGrid items={allergies} />
//           </PanelBox>

//           <PanelBox title="Nutritional Screening">
//             <ListGrid items={nutritionalItems} />
//           </PanelBox>
//         </div>

//         {/* Right Panel */}
//         <div style={styles.rightPanel}>
//           <div>
//             <div style={styles.chiefHeader}>
//               <span style={{ color: "#555", fontSize: "11px" }}>&#9658;</span>
//               CHIEF COMPLAINT
//             </div>

//             <table style={styles.vitalsTable}>
//               <tbody>
//                 <tr>
//                   <td style={{ ...styles.vtd, ...styles.vLabel }}>BP:</td>
//                   <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.bp ?? ""}</td>
//                   <td style={{ ...styles.vtd, ...styles.vUnit }}>mmHg</td>
//                   <td style={{ ...styles.vtd, ...styles.vLabel }}>Temp:</td>
//                   <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.temp ?? ""}</td>
//                   <td style={{ ...styles.vtd, ...styles.vUnit }}>°F</td>
//                 </tr>
//                 <tr>
//                   <td style={{ ...styles.vtd, ...styles.vLabel }}>Pulse:</td>
//                   <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.pulse ?? ""}</td>
//                   <td style={{ ...styles.vtd, ...styles.vUnit }}>PPM</td>
//                   <td style={{ ...styles.vtd, ...styles.vLabel }}>Weight:</td>
//                   <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.weight ?? ""}</td>
//                   <td style={{ ...styles.vtd, ...styles.vUnit }}>Kg</td>
//                 </tr>
//                 <tr>
//                   <td style={{ ...styles.vtd, ...styles.vLabel }}>SPO₂:</td>
//                   <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.spo2 ?? ""}</td>
//                   <td style={{ ...styles.vtd, ...styles.vUnit }}>%</td>
//                   <td style={{ ...styles.vtd, ...styles.vLabel }}>Height:</td>
//                   <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.height ?? ""}</td>
//                   <td style={{ ...styles.vtd, ...styles.vUnit }}>cm</td>
//                 </tr>
//                 <tr>
//                   <td style={{ ...styles.vtd, ...styles.vLabel }}>R/R:</td>
//                   <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.rr ?? ""}</td>
//                   <td style={{ ...styles.vtd, ...styles.vUnit }}>BPM</td>
//                   <td style={{ ...styles.vtd, ...styles.vLabel }}>BMI:</td>
//                   <td style={{ ...styles.vtd, ...styles.vVal }}>{vitals.bmi ?? ""}</td>
//                   <td style={{ ...styles.vtd, ...styles.vUnit }}>Kg/m²</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           <div style={styles.chiefArea}>{chiefComplaint || "Chief complaint notes..."}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OpdCard;

// /*
//   Setup:
//   ──────
//   npm install react-barcode

//   Usage Example:
//   ──────────────
//   import OpdCard from "./OpdCard";

//   <OpdCard
//     patient={{
//       uhid: "202602050005",
//       name: "MR. DEMO",
//       ageSex: "20Y 2M 4D / MALE",
//       consultant: "Dr. Demo Maurya, MBBS, MD",
//       department: "MEDICINE",
//       date: "09-04-2026 12:00PM",
//       contactNo: "9999999999",
//       address: "VARANASI UTTAR PRADESH",
//       panel: "CASH",
//       tokenNo: 1,
//     }}
//     vitals={{
//       bp: "120/80",
//       temp: "98.6",
//       pulse: "72",
//       weight: "65",
//       spo2: "98",
//       height: "170",
//       rr: "18",
//       bmi: "22.5",
//     }}
//     chiefComplaint="Patient presents with fever and cough for 3 days."
//   />

//   react-barcode Props used:
//   ─────────────────────────
//   value        → string to encode (UHID used here)
//   format       → "CODE128" | "EAN13" | "UPC" | "CODE39" | "ITF14" etc.
//   width        → width of each bar in px (1.2)
//   height       → height of bars in px (36)
//   displayValue → show text below bars — false (UHID shown in info grid)
//   margin       → whitespace around barcode (0 for tight fit)
//   background   → SVG bg color ("transparent")
//   lineColor    → bar color ("#111")
// */

import React from "react";
import Barcode from "react-barcode";

// Install dependency: npm install react-barcode --legacy-peer-deps

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
  patient?: PatientInfo;
  vitals?: Vitals;
  chiefComplaint?: string;
  followUpDateTime?: string;
  emergencyContact?: string;
  appointmentContact?: string;
}

const defaultPatient: PatientInfo = {
  uhid: "202602050005",
  name: "MR. DEMO",
  ageSex: "20Y 2M 4D / MALE",
  consultant: "Dr. Demo Maurya, MBBS, MD",
  opdRoomNo: "",
  department: "MEDICINE",
  referBy: "",
  date: "09-04-2026 12:00PM",
  contactNo: "9999999999",
  address: "VARANASI UTTAR PRADESH",
  drRegNo: "",
  panel: "CASH",
  receiptNo: "",
  userName: "",
  tokenNo: 1,
};

const painFaces = [
  { emoji: "😊", score: 0, label: "No Hurt" },
  { emoji: "🙂", score: 2, label: "Hurts Little Bit" },
  { emoji: "😐", score: 4, label: "Hurts Little More" },
  { emoji: "😟", score: 6, label: "Hurts Even More" },
  { emoji: "😢", score: 8, label: "Hurts Whole Lot" },
  { emoji: "😭", score: 10, label: "Hurts Worst" },
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
  ["Weakness", "Nutrition need in Kcal (Weight × 29/40)"],
  ["Muscle Wasting", "............"],
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
    fontFamily: "Arial, sans-serif ",
    fontSize: "12px",
    color: "#111",
    border: "1px solid #999",
    borderRadius: "4px",
    padding: "12px 14px",
    maxWidth: "960px",
    margin: "0 auto",
    background: "#fff",
    boxSizing: "border-box",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    borderBottom: "2px solid #333",
    paddingBottom: "8px",
    marginBottom: "10px",
  },
  titleText: {
    fontSize: "20px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },
  tokenText: {
    fontSize: "13px",
    fontWeight: "normal",
    whiteSpace: "nowrap" as const,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1px 20px",
    marginBottom: "10px",
    paddingBottom: "10px",
    borderBottom: "1px solid #bbb",
  },
  infoRow: {
    display: "flex",
    gap: "4px",
    padding: "2px 0",
    alignItems: "flex-start",
  },
  infoLabel: {
    minWidth: "95px",
    color: "#333",
    flexShrink: 0,
  },
  infoColon: {
    color: "#666",
    marginRight: "4px",
  },
  infoVal: {
    color: "#111",
  },
  boldLabel: {
    fontWeight: "bold",
  },
  bodyGrid: {
    display: "grid",
    gridTemplateColumns: "190px 1fr",
    gap: "10px",
    alignItems: "start",
  },
  leftPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  panelBox: {
    border: "1px solid #bbb",
    borderRadius: "3px",
    padding: "6px 8px",
  },
  panelTitle: {
    fontWeight: "bold",
    fontSize: "11px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "4px",
    marginBottom: "6px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.3px",
  },
  painRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "4px",
  },
  painFaceCell: {
    textAlign: "center" as const,
    fontSize: "9px",
    lineHeight: 1.2,
    color: "#444",
    maxWidth: "28px",
  },
  faceEmoji: {
    display: "block",
    fontSize: "18px",
    lineHeight: "1.2",
  },
  faceScore: {
    display: "block",
    fontWeight: "bold",
    fontSize: "9px",
  },
  faceLabel: {
    display: "block",
    fontSize: "8px",
    color: "#666",
    lineHeight: 1.1,
  },
  listGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2px 6px",
    marginTop: "2px",
  },
  listItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "3px",
    fontSize: "11px",
    color: "#111",
    lineHeight: 1.4,
  },
  arrow: {
    color: "#555",
    fontSize: "10px",
    flexShrink: 0,
    marginTop: "1px",
  },
  rightPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  chiefHeader: {
    fontWeight: "bold",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginBottom: "6px",
  },
  vitalsTable: {
    borderCollapse: "collapse" as const,
    width: "auto",
    fontSize: "12px",
  },
  vtd: {
    border: "1px solid #aaa",
    padding: "4px 8px",
  },
  vLabel: {
    fontWeight: "bold",
    width: "58px",
    background: "#f5f5f5",
  },
  vVal: {
    minWidth: "90px",
  },
  vUnit: {
    color: "#444",
    width: "52px",
  },
  chiefArea: {
    border: "1px solid #bbb",
    borderRadius: "3px",
    minHeight: "200px",
    padding: "8px",
    fontSize: "12px",
    color: "#aaa",
    fontStyle: "italic",
  },
  // ── Bottom section ──
  bottomSection: {
    marginTop: "14px",
    borderTop: "1px solid #bbb",
    paddingTop: "10px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  dietBox: {
    border: "1px solid #bbb",
    borderRadius: "3px",
    padding: "6px 10px",
    display: "inline-block",
    alignSelf: "flex-start" as const,
    minWidth: "220px",
  },
  dietTitle: {
    fontWeight: "bold",
    fontSize: "11px",
    textTransform: "uppercase" as const,
    marginBottom: "6px",
  },
  followUpText: {
    fontSize: "12px",
    lineHeight: 1.6,
  },
  followUpHindi: {
    fontSize: "12px",
    lineHeight: 1.6,
    fontFamily: "Arial, sans-serif",
  },
  dateTimeRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
  },
  dateTimeLabel: {
    fontWeight: "bold",
    background: "#eee",
    border: "1px solid #bbb",
    padding: "3px 8px",
    whiteSpace: "nowrap" as const,
  },
  dateTimeInput: {
    border: "1px solid #bbb",
    padding: "3px 8px",
    fontSize: "12px",
    fontFamily: "'Courier New', Courier, monospace",
    width: "200px",
    outline: "none",
  },
  emergencyText: {
    fontSize: "12px",
    lineHeight: 1.6,
  },
  emergencyHindi: {
    fontSize: "12px",
    lineHeight: 1.6,
    fontFamily: "Arial, sans-serif",
  },
};

// ── Sub-components ───────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value?: string; bold?: boolean }> = ({
  label,
  value = "",
  bold,
}) => (
  <div style={styles.infoRow}>
    <span style={{ ...styles.infoLabel, ...(bold ? styles.boldLabel : {}) }}>{label}</span>
    <span style={styles.infoColon}>:</span>
    <span style={styles.infoVal}>{value}</span>
  </div>
);

const PanelBox: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={styles.panelBox}>
    <div style={styles.panelTitle}>{title}</div>
    {children}
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

// ── Main Component ───────────────────────────────────────────────

const OpdCard: React.FC<OpdCardProps> = ({
  patient = defaultPatient,
  vitals = {},
  chiefComplaint = "",
  followUpDateTime = "",
  emergencyContact = "+91-9125760017",
  appointmentContact = "+91-915760017",
}) => {
  return (
    <div style={styles.wrapper}>
      {/* ── Title row with react-barcode ── */}
      <div style={styles.titleRow}>
        <span style={styles.titleText}>OPD CARD</span>
        <Barcode
          value={patient.uhid}
          format="CODE128"
          width={1.2}
          height={36}
          displayValue={false}
          margin={0}
          background="transparent"
          lineColor="#111"
        />
        <span style={styles.tokenText}>Token No: {patient.tokenNo}</span>
      </div>

      {/* ── Patient Info Grid ── */}
      <div style={styles.infoGrid}>
        <div>
          <InfoRow label="UHID" value={patient.uhid} />
          <InfoRow label="Name" value={patient.name} bold />
          <InfoRow label="Age/Sex" value={patient.ageSex} />
          <InfoRow label="Consultant" value={patient.consultant} />
          <InfoRow label="OPD Room No." value={patient.opdRoomNo} bold />
          <InfoRow label="Department" value={patient.department} />
          <InfoRow label="Refer By" value={patient.referBy} />
        </div>
        <div>
          <InfoRow label="Date" value={patient.date} />
          <InfoRow label="Contact No." value={patient.contactNo} />
          <InfoRow label="Address" value={patient.address} />
          <InfoRow label="Dr. Reg No." value={patient.drRegNo} />
          <InfoRow label="Panel" value={patient.panel} />
          <InfoRow label="Receipt No." value={patient.receiptNo} />
          <InfoRow label="User Name" value={patient.userName} />
        </div>
      </div>

      {/* ── Body ── */}
      <div style={styles.bodyGrid}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <PanelBox title="Pain Assessment Score">
            <div style={styles.painRow}>
              {painFaces.map(f => (
                <div key={f.score} style={styles.painFaceCell}>
                  <span style={styles.faceEmoji}>{f.emoji}</span>
                  <span style={styles.faceScore}>{f.score}</span>
                  <span style={styles.faceLabel}>{f.label}</span>
                </div>
              ))}
            </div>
          </PanelBox>

          <PanelBox title="Known H/O">
            <ListGrid items={knownHO} />
          </PanelBox>

          <PanelBox title="Allergy">
            <ListGrid items={allergies} />
          </PanelBox>

          <PanelBox title="Nutritional Screening">
            <ListGrid items={nutritionalItems} />
          </PanelBox>
        </div>

        {/* Right Panel */}
        <div style={styles.rightPanel}>
          <div>
            <div style={styles.chiefHeader}>
              <span style={{ color: "#555", fontSize: "11px" }}>&#9658;</span>
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
                  <td style={{ ...styles.vtd, ...styles.vUnit }}>°F</td>
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
                  <td style={{ ...styles.vtd, ...styles.vLabel }}>SPO₂:</td>
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
                  <td style={{ ...styles.vtd, ...styles.vUnit }}>Kg/m²</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={styles.chiefArea}>{chiefComplaint || "Chief complaint notes..."}</div>
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div style={styles.bottomSection}>
        {/* Diet Advised Box */}
        <div style={styles.dietBox}>
          <div style={styles.dietTitle}>Type of Diet Advised</div>
          <ListGrid items={dietItems} />
        </div>

        {/* Follow Up */}
        <div style={styles.followUpText}>
          <strong>Next Follow up date &amp; Time with a prior appointment on</strong>{" "}
          <strong>{appointmentContact}</strong>
        </div>
        <div style={styles.followUpHindi}>
          नियोजित अपॉइंटमेंट के लिए संपर्क करें: <strong>{appointmentContact}</strong>
        </div>

        {/* Date & Time input */}
        <div style={styles.dateTimeRow}>
          <span style={styles.dateTimeLabel}>&#9658; Date &amp; Time:</span>
          <input
            type="text"
            style={styles.dateTimeInput}
            defaultValue={followUpDateTime}
            placeholder="DD-MM-YYYY HH:MM"
          />
        </div>

        {/* Emergency */}
        <div style={styles.emergencyText}>
          <strong>In case of any medical emergency please call us on</strong>{" "}
          <strong>{emergencyContact}</strong> available 24x7.
        </div>
        <div style={styles.emergencyHindi}>
          चिकित्सा आपात स्थिति के लिए संपर्क करें: <strong>{emergencyContact}</strong> (24x7)
        </div>
      </div>
    </div>
  );
};

export default OpdCard;

/*
  Setup:
  ──────
  npm install react-barcode --legacy-peer-deps

  Usage Example:
  ──────────────
  import OpdCard from "./OpdCard";

  <OpdCard
    patient={{
      uhid: "202602050005",
      name: "MR. DEMO",
      ageSex: "20Y 2M 4D / MALE",
      consultant: "Dr. Demo Maurya, MBBS, MD",
      department: "MEDICINE",
      date: "09-04-2026 12:00PM",
      contactNo: "9999999999",
      address: "VARANASI UTTAR PRADESH",
      panel: "CASH",
      tokenNo: 1,
    }}
    vitals={{
      bp: "120/80",
      temp: "98.6",
      pulse: "72",
      weight: "65",
      spo2: "98",
      height: "170",
      rr: "18",
      bmi: "22.5",
    }}
    chiefComplaint="Patient presents with fever and cough for 3 days."
    followUpDateTime="15-04-2026 10:00"
    appointmentContact="+91-915760017"
    emergencyContact="+91-9125760017"
  />
*/
