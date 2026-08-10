import {
  OptionSchema,
  TableMasterEntryConfig,
  TableOrderSetConfig,
} from "@/components/dynamicForm/types";
import { ENDPOINTS } from "@/config/defaults";

/**
 * Single place to declare "special" EMR header behavior — anything beyond a plain field with
 * static LOV options. Adding a new section/header that needs a custom dropdown source, an order
 * set, a master-entry drawer, or favourites turned off means appending ONE rule here; nothing in
 * EmrSectionRenderer.tsx needs to change. A header with no matching rule renders exactly as it
 * does today (plain field / static-LOV dropdown / plain table with favourites on).
 */

export interface EmrDataSourceConfig {
  /** key into ENDPOINTS, e.g. "GET_SERVICE_ITEM_LIST" */
  endpointKey: keyof typeof ENDPOINTS;
  /** fixed params sent with every request */
  params?: Record<string, unknown>;
  /** response row field to use as the option value — default "value" */
  valueField?: string;
  /** response row field to use as the option label — default "label" */
  labelField?: string;
  /** when set, this becomes an async-search source: the typed query is sent under this param key */
  searchParamKey?: string;
  /** when set, the current header's own headerId is sent under this param key — needed by
   * data sources that run per-header, e.g. GET_EMR_HEADER_QUERY_RESULT's saved "Custom" query */
  headerIdParamKey?: string;
  /** escape hatch for a response shape that isn't a plain field lookup (fallback/concat logic etc.) —
   * takes precedence over valueField/labelField when provided */
  mapOption?: (row: Record<string, unknown>) => OptionSchema;
  /** applied to each response row before mapping, e.g. to keep only isActive rows */
  filterRow?: (row: Record<string, unknown>) => boolean;
}

export interface EmrColumnDataSourceRule {
  /** matched against the table column's label (case-insensitive) */
  match: (columnLabel: string) => boolean;
  dataSource: EmrDataSourceConfig;
}

export interface EmrTableBehaviorConfig {
  /** default true — matches today's behavior of every table getting doctor-wise favourites */
  favouritesEnabled?: boolean;
  masterEntry?: TableMasterEntryConfig;
  orderSet?: TableOrderSetConfig;
  columnDataSources?: EmrColumnDataSourceRule[];
}

export interface EmrTextBehaviorConfig {
  /** default false — the "save current text as a favourite" bar only shows for headers that opt in */
  favouritesEnabled?: boolean;
  /** default false — a large, auto-growing textarea for long narrative fields (e.g. History).
   * everything else stays a normal, fixed-height textarea like its sibling fields */
  large?: boolean;
}

export interface EmrHeaderBehaviorRule {
  /** dev-facing label only, shown nowhere in the UI */
  name: string;
  match: (headerName: string) => boolean;
  /** force the dynamic control type, e.g. "dropdown" / "multiselect-search" */
  controlTypeOverride?: string;
  /** for non-table dropdown/multiselect headers */
  dataSource?: EmrDataSourceConfig;
  /** for table-type headers */
  table?: EmrTableBehaviorConfig;
  /** for text/textarea/richtext headers */
  text?: EmrTextBehaviorConfig;
}

const normalize = (headerName: string) => (headerName || "").trim().toLowerCase();

/** no dedicated "Condition Master"/"Family History Master" endpoint exists, so both Family
 * History rules below reuse the Diagnosis master + order set — a family history condition is the
 * same kind of catalog entry as a diagnosis */
const CONDITION_STYLE_MASTER_TABLE_CONFIG: EmrTableBehaviorConfig = {
  masterEntry: {
    saveEndpoint: ENDPOINTS.CREATE_UPDATE_DIAGNOSIS_MASTER,
    listEndpoint: ENDPOINTS.GET_DIAGNOSIS_MASTER_LIST,
    idField: "diagnosisId",
    nameField: "diagnosisName",
    tableName: "DiagnosisMaster",
  },
  orderSet: {
    listEndpoint: ENDPOINTS.GET_DIAGNOSIS_ORDER_SET_LIST,
    saveEndpoint: ENDPOINTS.CREATE_UPDATE_DIAGNOSIS_ORDER_SET,
    itemSearchEndpoint: ENDPOINTS.GET_DIAGNOSIS_MASTER_LIST,
    idField: "orderSetId",
    nameField: "orderSetName",
    itemsField: "items",
  },
};

/** "shortName (name)" when a short name exists, else just "name" — falls back to name for the value too */
const mapInvestigationOption = (item: Record<string, unknown>): OptionSchema => {
  const shortName = item?.shortName as string | undefined;
  const name = (item?.name as string | undefined) ?? "";
  return {
    value: shortName || name,
    label: shortName ? `${shortName} (${name})` : name,
  };
};

const mapChiefComplaintOption = (item: Record<string, unknown>): OptionSchema => ({
  label: (item?.complaintName as string) ?? "",
  value: (item?.complaintName as string) ?? "",
  key: String(item?.ComplaintId ?? item?.complaintId ?? ""),
});

export const EMR_HEADER_BEHAVIOR_RULES: EmrHeaderBehaviorRule[] = [
  {
    // must come before history-text-favourites below — "Family History" contains "history" too,
    // and .find() stops at the first match, so the more specific rule has to win by going first
    name: "family-history-single-header-card-group",
    match: name => normalize(name).includes("family"),
    table: CONDITION_STYLE_MASTER_TABLE_CONFIG,
  },
  {
    name: "history-text-favourites",
    match: name => normalize(name).includes("history"),
    text: { favouritesEnabled: true, large: true },
  },
  {
    name: "doctor-picker",
    match: name => normalize(name) === "doctor",
    controlTypeOverride: "dropdown",
    dataSource: {
      endpointKey: "GET_EMR_HEADER_QUERY_RESULT",
      headerIdParamKey: "headerId",
      valueField: "Value",
      labelField: "name",
    },
  },
  {
    name: "medicine-picker",
    match: name => normalize(name).includes("medicine"),
    controlTypeOverride: "dropdown",
    dataSource: {
      endpointKey: "GET_SERVICE_ITEM_LIST",
      params: { categoryTypeId: 6, serviceName: "medicine", isActive: 1 },
      valueField: "serviceItemId",
      labelField: "name",
    },
  },
  {
    name: "investigation-table",
    match: name => normalize(name).includes("investigation"),
    controlTypeOverride: "multiselect-search",
    dataSource: {
      endpointKey: "GET_INVESTIGATION_SERVICE_ITEM_LIST",
      params: { categoryTypeId: 3, isActive: 1 },
      searchParamKey: "serviceName",
      mapOption: mapInvestigationOption,
    },
    table: {
      orderSet: {
        listEndpoint: ENDPOINTS.GET_INVESTIGATION_ORDER_SET_LIST,
        saveEndpoint: ENDPOINTS.CREATE_UPDATE_INVESTIGATION_ORDER_SET,
        itemSearchEndpoint: ENDPOINTS.GET_INVESTIGATION_SERVICE_ITEM_LIST,
        itemSearchParams: { categoryTypeId: 3, isActive: 1 },
        idField: "orderSetId",
        nameField: "orderSetName",
        itemsField: "items",
      },
      columnDataSources: [
        {
          match: label => /service\s*name/i.test(label),
          dataSource: {
            endpointKey: "GET_INVESTIGATION_SERVICE_ITEM_LIST",
            params: { categoryTypeId: 3, isActive: 1 },
            searchParamKey: "serviceName",
            mapOption: mapInvestigationOption,
          },
        },
      ],
    },
  },
  {
    name: "chief-complaint-table",
    match: name => normalize(name).includes("complaint"),
    table: {
      masterEntry: {
        saveEndpoint: ENDPOINTS.CREATE_UPDATE_CHIEF_COMPLAINT_MASTER,
        listEndpoint: ENDPOINTS.GET_CHIEF_COMPLAINT_MASTER_LIST,
        idField: "complaintId",
        nameField: "complaintName",
        tableName: "ChiefComplaintMaster",
      },
      // the name column also gets a static dropdown of existing master entries, so a doctor can
      // pick a previously-added complaint inline instead of only via the master-entry drawer
      columnDataSources: [
        {
          match: label => /complaint/i.test(label),
          dataSource: {
            endpointKey: "GET_CHIEF_COMPLAINT_MASTER_LIST",
            filterRow: row => Number(row?.isActive) === 1,
            mapOption: mapChiefComplaintOption,
          },
        },
      ],
    },
  },
  {
    // whichever header in the group matches supplies the whole card-group's master-entry +
    // order set (and becomes its name/title column) — see EmrSectionRenderer's isCardGroup
    // branch, which scans every header in the group for a match rather than assuming the first
    name: "diagnosis-type-card-group",
    match: name => normalize(name).includes("diagnosis"),
    table: {
      masterEntry: {
        saveEndpoint: ENDPOINTS.CREATE_UPDATE_DIAGNOSIS_MASTER,
        listEndpoint: ENDPOINTS.GET_DIAGNOSIS_MASTER_LIST,
        idField: "diagnosisId",
        nameField: "diagnosisName",
        tableName: "DiagnosisMaster",
      },
      orderSet: {
        listEndpoint: ENDPOINTS.GET_DIAGNOSIS_ORDER_SET_LIST,
        saveEndpoint: ENDPOINTS.CREATE_UPDATE_DIAGNOSIS_ORDER_SET,
        itemSearchEndpoint: ENDPOINTS.GET_DIAGNOSIS_MASTER_LIST,
        idField: "orderSetId",
        nameField: "orderSetName",
        itemsField: "items",
      },
    },
  },
  {
    // same idea as diagnosis-type-card-group — "Procedure" (Status/Follow Up/Date alongside it)
    // renders as a card group too, so its master-entry + order set come from this header
    name: "procedure-card-group",
    match: name => normalize(name).includes("procedure"),
    table: {
      masterEntry: {
        saveEndpoint: ENDPOINTS.CREATE_UPDATE_PROCEDURE_MASTER,
        listEndpoint: ENDPOINTS.GET_PROCEDURE_MASTER_LIST,
        idField: "procedureId",
        nameField: "procedureName",
        tableName: "ProcedureMaster",
      },
      orderSet: {
        listEndpoint: ENDPOINTS.GET_PROCEDURE_ORDER_SET_LIST,
        saveEndpoint: ENDPOINTS.CREATE_UPDATE_PROCEDURE_ORDER_SET,
        itemSearchEndpoint: ENDPOINTS.GET_PROCEDURE_MASTER_LIST,
        idField: "orderSetId",
        nameField: "orderSetName",
        itemsField: "items",
      },
    },
  },
  {
    // Family History's meaningful/master-searchable field — "Condition" isn't sequenced first in
    // that group (Relationship is), which is exactly why EmrSectionRenderer now scans every
    // header for a match instead of assuming headers[0]. Exact-match only ("condition", not
    // "includes"), so this doesn't also catch the separate free-text "Condition Text" header.
    // Applies when Family History is configured as several real headers (Relationship/Sex/
    // Status/.../Condition/...) sharing one card-group section.
    name: "family-history-condition-card-group",
    match: name => normalize(name) === "condition",
    table: CONDITION_STYLE_MASTER_TABLE_CONFIG,
  },
];

export const resolveHeaderBehavior = (headerName: string): EmrHeaderBehaviorRule | undefined =>
  EMR_HEADER_BEHAVIOR_RULES.find(r => r.match(headerName));
