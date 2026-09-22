#!/usr/bin/env node
/**
 * export-patients.mjs — pull the patient list from the HIS API and write it locally.
 *
 * Run this yourself. Credentials are read from the environment or typed at the
 * prompt (hidden); they are never written to disk, never logged, and never
 * embedded in this file. The output CSV/JSON contains patient data — treat it
 * as PHI: keep it off shared drives, and delete it when you're done.
 *
 * Usage:
 *   node scripts/export-patients.mjs
 *   node scripts/export-patients.mjs --branch 1 --format csv --out patients.csv
 *   HIS_USER=myuser HIS_PASS='...' node scripts/export-patients.mjs   # non-interactive
 *
 * Filters (all optional, mirror SearchPatientPopup):
 *   --uhid, --first-name, --last-name, --contact, --dob, --registration-date
 *   Dates are dd-mm-yyyy, matching what the UI sends.
 */

import { writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { stdin, stdout, argv, env, exit } from "node:process";

const BASE_URL = env.HIS_API_BASE_URL ?? "http://103.217.247.236/HISWEBAPI/Api";

/* ------------------------------- args ---------------------------------- */

const args = {};
for (let i = 2; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) continue;
  const key = argv[i].slice(2);
  const next = argv[i + 1];
  args[key] = next && !next.startsWith("--") ? (i++, next) : true;
}

const branchId = Number(args.branch ?? 1);
const format = (args.format ?? "csv").toLowerCase();
const outPath = args.out ?? `patients-branch${branchId}-${new Date().toISOString().slice(0, 10)}.${format}`;

const filters = {
  branchId,
  uhid: args.uhid ?? "",
  ipdNo: args["ipd-no"] ?? "",
  firstName: args["first-name"] ?? "",
  middleName: args["middle-name"] ?? "",
  lastName: args["last-name"] ?? "",
  relativeName: args["relative-name"] ?? "",
  contactNumber: args.contact ?? "",
  emergencyContactNumber: "",
  dob: args.dob ?? "",
  address: args.address ?? "",
  registrationDate: args["registration-date"] ?? "",
};

/* ---------------------------- credentials ------------------------------- */

const ask = (question, { hidden = false } = {}) =>
  new Promise(resolve => {
    const rl = createInterface({ input: stdin, output: stdout, terminal: true });
    if (hidden) {
      // Suppress echo so the password never appears on screen or in scrollback.
      const onData = char => {
        if (["\n", "\r", ""].includes(char.toString())) stdin.removeListener("data", onData);
        else stdout.write("\x1b[2K\x1b[200D" + question + "*".repeat(rl.line.length));
      };
      stdin.on("data", onData);
    }
    rl.question(question, answer => {
      rl.close();
      if (hidden) stdout.write("\n");
      resolve(answer.trim());
    });
  });

async function getCredentials() {
  const userName = env.HIS_USER || (await ask("Username: "));
  const password = env.HIS_PASS || (await ask("Password: ", { hidden: true }));
  if (!userName || !password) {
    console.error("Username and password are both required.");
    exit(1);
  }
  return { userName, password };
}

/* ------------------------------- api ------------------------------------ */

async function login({ userName, password }) {
  const res = await fetch(`${BASE_URL}/User/userLogin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ branchId, userName, password, rememberMe: false }),
  });

  if (!res.ok) throw new Error(`Login failed: HTTP ${res.status} ${res.statusText}`);

  // This API returns business failures as HTTP 200 with { result: false } —
  // same quirk useGlobalApi.ts normalises in the app.
  const body = await res.json();
  if (!body?.result) throw new Error(`Login rejected: ${body?.message ?? "unknown reason"}`);

  const token = body?.data?.accessToken;
  if (!token) throw new Error("Login succeeded but no accessToken was returned.");
  return token;
}

async function fetchPatients(token) {
  const params = new URLSearchParams(
    Object.entries(filters)
      .filter(([, v]) => v !== "" && v != null)
      .map(([k, v]) => [k, String(v)])
  );

  const res = await fetch(`${BASE_URL}/Patient/searchPatientMaster?${params}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error(`Search failed: HTTP ${res.status} ${res.statusText}`);

  const body = await res.json();
  if (body?.result === false) throw new Error(`Search rejected: ${body?.message ?? "unknown reason"}`);
  return body?.data ?? [];
}

/* ------------------------------ output ---------------------------------- */

const COLUMNS = [
  "PatientId", "UHID", "Title", "PatientName", "FirstName", "MiddleName", "LastName",
  "Gender", "Age", "DOB", "Relation", "RelativeName", "ContactNumber",
  "EmergencyContactNumber", "Email", "FullAddress", "RegistrationDate", "IPDNo",
  "BranchId", "IsRegistrationValid",
];

const csvCell = value => {
  if (value == null) return "";
  const s = String(value);
  // Guard against CSV injection when the file is opened in Excel.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

const toCsv = rows =>
  [COLUMNS.join(","), ...rows.map(r => COLUMNS.map(c => csvCell(r[c])).join(","))].join("\n");

/* ------------------------------- main ----------------------------------- */

try {
  const credentials = await getCredentials();
  process.stdout.write("Authenticating… ");
  const token = await login(credentials);
  console.log("ok");

  process.stdout.write(`Fetching patients (branch ${branchId})… `);
  const patients = await fetchPatients(token);
  console.log(`${patients.length} record(s)`);

  if (patients.length === 0) {
    console.log("Nothing to write.");
    exit(0);
  }

  writeFileSync(outPath, format === "json" ? JSON.stringify(patients, null, 2) : toCsv(patients), "utf8");
  console.log(`\nWrote ${outPath}`);
  console.log("This file contains patient data. Store it somewhere controlled and delete it when done.");
} catch (err) {
  console.error(`\nError: ${err.message}`);
  exit(1);
}
