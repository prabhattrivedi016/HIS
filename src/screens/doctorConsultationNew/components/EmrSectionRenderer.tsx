import DynamicFormRenderer from "@/components/dynamicForm/DynamicFormRenderer";
import {
  CardSchema,
  ControlSchema,
  OptionSchema,
  TableColumnSchema,
} from "@/components/dynamicForm/types";
import { getByPath } from "@/components/dynamicForm/utils/path";
import { ENDPOINTS } from "@/config/defaults";
import { EmrDataSourceConfig, resolveHeaderBehavior } from "@/config/emrHeaderBehavior";
import { AuthContext } from "@/context/AuthContext";
import useGlobalApi from "@/hooks/useGlobalApi";
import { SectionAttributeCondition, SectionHeaderMappingRecord } from "@/screens/emrControls/types";
import { groupAttributeConditionRows } from "@/screens/emrControls/utils/attributeConditionParsing";
import { useEmrSectionHistoryStore } from "@/store/useEmrSectionHistoryStore";
import { useQueries, useQuery } from "@tanstack/react-query";
import { CheckCircle2, History, Loader2 } from "lucide-react";
import { useContext, useEffect, useMemo, useRef } from "react";
import { EmrSectionAnswerEntry } from "../types";

interface EmrSectionRendererProps {
  sectionId: number;
  sectionName: string;
  displayName?: string;
  data: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
  onHeadersLoaded?: (headers: SectionHeaderMappingRecord[]) => void;
  doctorId?: number;
  patientId?: number;
  /** opens the shared cross-section History drawer (owned by ConsultationEmrSections),
   * defaulted to this section */
  onOpenHistory?: () => void;
  /** same per-section accent ConsultationEmrSections already assigns its nav pill/rail/card
   * border — passed down so the title marker and progress bar match it exactly */
  accent?: { grad: string; text: string; soft: string };
  /** reports this section's own filled/total field count up to ConsultationEmrSections so the
   * sidebar pill and header "X/Y done" badge use the exact same completion math as this section's
   * own progress bar — this component is the only one that knows the card-group data shape
   * (values live under section_X.group, not one path per header) */
  onProgressChange?: (sectionId: number, filled: number, total: number) => void;
  /** reports this section's actual answered values up to ConsultationEmrSections (for save/print)
   * — for the same reason as onProgressChange above, this is the only component that knows how to
   * read a card-group section's data (an array of rows under section_X.group, keyed by
   * header_<headerId> per column) rather than one value per header path */
  onEntriesChange?: (sectionId: number, entries: EmrSectionAnswerEntry[]) => void;
}

const mapControlType = (controlType: string): string => {
  const key = (controlType || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-_]/g, "");
  if (key.includes("rich")) return "richtext";
  if (key.includes("table")) return "table";
  if (key.includes("textarea")) return "textarea";
  if (key.includes("date")) return "date";
  if (key.includes("number")) return "number";
  if (key.includes("currency")) return "currency";
  if (key.includes("check")) return "switch";
  if (key.includes("dropdown") || key.includes("select") || key.includes("combo"))
    return "dropdown";
  if (key.includes("radio")) return "radio";
  return "text";
};

const needsOptions = (dynamicType: string) => dynamicType === "radio" || dynamicType === "dropdown";
const isFullWidth = (dynamicType: string) => dynamicType === "richtext";
const isTextLikeType = (dynamicType: string) =>
  dynamicType === "text" || dynamicType === "textarea" || dynamicType === "richtext";

// maps a header's dynamicType to the numeric dataTypeId TableColumnSchema/TableFieldInput use,
// so a "card-group" section's columns render with the exact same field components as a table
const dynamicTypeToDataTypeId = (dynamicType: string): number => {
  switch (dynamicType) {
    case "number":
      return 2;
    case "date":
      return 3;
    case "textarea":
      return 4;
    case "dropdown":
    case "radio":
    case "search-dropdown":
      return 5;
    default:
      return 1;
  }
};

const SEVERITY_OPTIONS: OptionSchema[] = ["Mild", "Moderate", "Severe"].map(v => ({
  label: v,
  value: v,
}));

const EmrSectionRenderer = ({
  sectionId,
  sectionName,
  displayName,
  data,
  onDataChange,
  onHeadersLoaded,
  doctorId,
  patientId,
  onOpenHistory,
  accent,
  onProgressChange,
  onEntriesChange,
}: EmrSectionRendererProps) => {
  const sectionAccent = accent ?? {
    grad: "from-[#0B5394] to-[#1C7EC2]",
    text: "text-[#0B5394]",
    soft: "bg-blue-50",
  };
  const { fetchApi } = useGlobalApi();
  const authUser = useContext(AuthContext)?.user;
  const logEdit = useEmrSectionHistoryStore(s => s.logEdit);
  const previousValuesRef = useRef<Record<number, unknown> | null>(null);

  const getSectionHeaderMapping = async (): Promise<SectionHeaderMappingRecord[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_EMR_SECTION_HEADER_MAPPING,
      {},
      { params: { sectionId } },
      { component: "EmrSectionRenderer", silent: true }
    );
    const raw: any[] = resp?.data ?? [];
    return raw
      .map(m => ({
        mappingId: m.MappingId,
        sectionId: m.SectionId,
        headerId: m.HeaderId,
        headerName: m.HeaderName,
        displayName: m.DisplayName,
        controlType: m.ControlType,
        controlTypeId: m.ControlTypeId,
        sequenceNo: m.SequenceNo,
      }))
      .sort((a, b) => a.sequenceNo - b.sequenceNo);
  };

  const { data: headers = [], isLoading: headersLoading } = useQuery<SectionHeaderMappingRecord[]>({
    queryKey: ["emrSectionHeaders", sectionId],
    queryFn: getSectionHeaderMapping,
  });

  useEffect(() => {
    if (headers.length > 0) onHeadersLoaded?.(headers);
  }, [headers]);

  const getConditionalConfig = async (): Promise<SectionAttributeCondition[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_EMR_SECTION_ATTRIBUTE_CONDITION,
      {},
      { params: { sectionId } },
      { component: "EmrSectionRenderer", silent: true }
    );
    const rawRows: any[] = Array.isArray(resp?.data) ? resp.data : [];
    return groupAttributeConditionRows(rawRows);
  };

  const { data: attributeConditions = [] } = useQuery<SectionAttributeCondition[]>({
    queryKey: ["emrSectionConditionalConfig", sectionId],
    queryFn: getConditionalConfig,
  });

  // generic fetch + row-mapping for any header/column wired to a config/emrHeaderBehavior.ts
  // dataSource — replaces what used to be one bespoke fetcher per special-cased header name
  const mapDataSourceRow = (
    dataSource: EmrDataSourceConfig,
    row: Record<string, unknown>
  ): OptionSchema => {
    if (dataSource.mapOption) return dataSource.mapOption(row);
    const valueField = dataSource.valueField ?? "value";
    const labelField = dataSource.labelField ?? "label";
    return { value: row[valueField], label: String(row[labelField] ?? "") };
  };

  const fetchDataSourceOptions = async (
    dataSource: EmrDataSourceConfig,
    query?: string,
    headerId?: number
  ): Promise<OptionSchema[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS[dataSource.endpointKey],
      {},
      {
        params: {
          ...dataSource.params,
          ...(query && dataSource.searchParamKey ? { [dataSource.searchParamKey]: query } : {}),
          ...(headerId && dataSource.headerIdParamKey
            ? { [dataSource.headerIdParamKey]: headerId }
            : {}),
        },
      },
      { component: "EmrSectionRenderer", silent: true }
    );
    const raw: Record<string, unknown>[] = Array.isArray(resp?.data) ? resp.data : [];
    const filtered = dataSource.filterRow ? raw.filter(dataSource.filterRow) : raw;
    return filtered.map(row => mapDataSourceRow(dataSource, row));
  };

  const getHeaderLovs = async (headerId: number): Promise<OptionSchema[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_HEARDER_LOVS,
      {},
      { params: { headerId } },
      { component: "EmrSectionRenderer", silent: true }
    );
    const raw: any[] = Array.isArray(resp?.data) ? resp.data : [];
    return raw.map(item => ({ label: item?.value ?? "", value: item?.value ?? "" }));
  };

  // headers whose behavior rule supplies its own dataSource skip the static-LOV fetch below —
  // they're resolved generically via dataSourceOptionsByHeaderId / asyncSearch instead
  const headerIdsNeedingOptions = useMemo(
    () =>
      headers
        .filter(
          h =>
            needsOptions(mapControlType(h.controlType)) &&
            !resolveHeaderBehavior(h.headerName)?.dataSource
        )
        .map(h => h.headerId),
    [headers]
  );

  const lovsQueries = useQueries({
    queries: headerIdsNeedingOptions.map(headerId => ({
      queryKey: ["emrHeaderLovs", headerId],
      queryFn: () => getHeaderLovs(headerId),
    })),
  });

  const lovsByHeaderId = useMemo(() => {
    const map: Record<number, OptionSchema[]> = {};
    headerIdsNeedingOptions.forEach((headerId, idx) => {
      map[headerId] = lovsQueries[idx]?.data ?? [];
    });
    return map;
  }, [headerIdsNeedingOptions, lovsQueries]);

  const getTableColumns = async (
    headerId: number,
    headerName: string
  ): Promise<TableColumnSchema[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_DOCTOR_HEARDER_LOVS,
      {},
      { params: { headerId } },
      { component: "EmrSectionRenderer", silent: true }
    );
    const raw: any[] = Array.isArray(resp?.data) ? resp.data : [];
    const columns: TableColumnSchema[] = raw.map((item, idx) => {
      const label = item?.headerName ?? "";
      const key = label ? String(label) : `col_${idx}`;

      if (/duration/i.test(label)) return { key, label, dataTypeId: 1 };
      if (/severity/i.test(label)) return { key, label, dataTypeId: 5, options: SEVERITY_OPTIONS };
      if (/date/i.test(label)) return { key, label, dataTypeId: 3 };

      return {
        key,
        label,
        dataTypeId: Number(item?.dataTypeId) || 1,
        options: String(item?.options ?? "")
          .split("##")
          .map((opt: string) => opt.trim())
          .filter(Boolean)
          .map((opt: string) => ({ label: opt, value: opt })),
      };
    });

    // per-column data sources declared on the header's behavior rule (e.g. an async-search
    // "Service Name" column, or a master-list-backed dropdown on the name column)
    const columnDataSources = resolveHeaderBehavior(headerName)?.table?.columnDataSources ?? [];
    for (const rule of columnDataSources) {
      const colIdx = columns.findIndex(c => rule.match(c.label));
      if (colIdx === -1) continue;

      if (rule.dataSource.searchParamKey) {
        columns[colIdx] = {
          ...columns[colIdx],
          asyncSearch: query => fetchDataSourceOptions(rule.dataSource, query, headerId),
        };
      } else {
        const options = await fetchDataSourceOptions(rule.dataSource, undefined, headerId);
        columns[colIdx] = { ...columns[colIdx], dataTypeId: 5, options };
      }
    }

    return columns;
  };

  const tableHeaderIds = useMemo(
    () => headers.filter(h => mapControlType(h.controlType) === "table").map(h => h.headerId),
    [headers]
  );

  const tableColumnsQueries = useQueries({
    queries: tableHeaderIds.map(headerId => ({
      queryKey: ["emrHeaderTableColumns", headerId],
      queryFn: () =>
        getTableColumns(headerId, headers.find(h => h.headerId === headerId)?.headerName ?? ""),
    })),
  });

  const tableColumnsByHeaderId = useMemo(() => {
    const map: Record<number, TableColumnSchema[]> = {};
    tableHeaderIds.forEach((headerId, idx) => {
      map[headerId] = tableColumnsQueries[idx]?.data ?? [];
    });
    return map;
  }, [tableHeaderIds, tableColumnsQueries]);

  // non-table headers whose behavior declares a plain (non-search) dataSource — fetched once,
  // same as static LOVs; a dataSource with searchParamKey becomes an asyncSearch instead (below)
  const dataSourceHeaderIds = useMemo(
    () =>
      headers
        .filter(h => {
          if (mapControlType(h.controlType) === "table") return false;
          const dataSource = resolveHeaderBehavior(h.headerName)?.dataSource;
          return Boolean(dataSource) && !dataSource!.searchParamKey;
        })
        .map(h => h.headerId),
    [headers]
  );

  const dataSourceQueries = useQueries({
    queries: dataSourceHeaderIds.map(headerId => {
      const headerName = headers.find(h => h.headerId === headerId)?.headerName ?? "";
      const dataSource = resolveHeaderBehavior(headerName)?.dataSource;
      return {
        queryKey: ["emrHeaderDataSource", headerId],
        queryFn: () =>
          dataSource
            ? fetchDataSourceOptions(dataSource, undefined, headerId)
            : Promise.resolve([]),
      };
    }),
  });

  const dataSourceOptionsByHeaderId = useMemo(() => {
    const map: Record<number, OptionSchema[]> = {};
    dataSourceHeaderIds.forEach((headerId, idx) => {
      map[headerId] = dataSourceQueries[idx]?.data ?? [];
    });
    return map;
  }, [dataSourceHeaderIds, dataSourceQueries]);

  // several plain (non-table) attributes together describe one repeatable record (e.g. Family
  // History: Condition/Relationship/Sex/...) — render them as one add-a-card-per-entry control
  // instead of N separate always-visible fields. Computed outside cardSchema too since the
  // completion badge below needs to know it reads a different data path for such sections.
  const isCardGroup =
    headers.length > 1 && headers.every(h => mapControlType(h.controlType) !== "table");

  const cardSchema: CardSchema = useMemo(() => {
    const rulesByHeaderId = new Map(attributeConditions.map(a => [a.targetHeaderId, a.conditions]));
    // a section with a single control has nothing to share the row with — always give it the
    // full width instead of whatever width its control type would normally get
    const isOnlyControl = headers.length === 1;

    // shared per-header resolution (type, options, async search) used both when building a
    // standalone control and when building a card-group column for the same header
    const resolveHeaderRender = (h: SectionHeaderMappingRecord) => {
      const behavior = resolveHeaderBehavior(h.headerName);
      const mappedType = mapControlType(h.controlType);
      // a header explicitly configured as "Table" always renders as a table —
      // a behavior rule's controlTypeOverride only applies to non-table headers
      const dynamicType =
        mappedType === "table" ? "table" : (behavior?.controlTypeOverride ?? mappedType);
      const isTable = dynamicType === "table";
      const dataSource = !isTable ? behavior?.dataSource : undefined;
      const hasStaticDataSource = Boolean(dataSource) && !dataSource?.searchParamKey;
      const options = hasStaticDataSource
        ? (dataSourceOptionsByHeaderId[h.headerId] ?? [])
        : needsOptions(dynamicType)
          ? (lovsByHeaderId[h.headerId] ?? [])
          : undefined;
      const asyncSearch = dataSource?.searchParamKey
        ? (query: string) => fetchDataSourceOptions(dataSource, query, h.headerId)
        : undefined;
      return { behavior, dynamicType, isTable, options, asyncSearch };
    };

    let controls: ControlSchema[];

    if (isCardGroup) {
      const columns: TableColumnSchema[] = headers.map(h => {
        const { dynamicType, options, asyncSearch } = resolveHeaderRender(h);
        return {
          key: `header_${h.headerId}`,
          label: h.displayName || h.headerName,
          dataTypeId: dynamicTypeToDataTypeId(dynamicType),
          options,
          asyncSearch,
        };
      });

      controls = [
        {
          key: `section_${sectionId}_group`,
          type: "card-group",
          dataPath: `section_${sectionId}.group`,
          colSpan: 4,
          columns,
          doctorId,
        },
      ];
    } else {
      controls = headers.map(h => {
        const { behavior, dynamicType, isTable, options, asyncSearch } = resolveHeaderRender(h);
        const ownRules = rulesByHeaderId.get(h.headerId);

        const conditionalDisplay: ControlSchema["conditionalDisplay"] = ownRules?.length
          ? ownRules.map(rule => ({
              src: `section_${sectionId}.header_${rule.headerId}`,
              exp: rule.operator,
              target: rule.value,
              connector: rule.connector === "OR" ? ("||" as const) : ("&&" as const),
            }))
          : undefined;

        // a lone text/textarea/richtext control's own label just repeats the section title
        // right above it — drop it so the field isn't captioned twice
        const label =
          isOnlyControl && isTextLikeType(dynamicType) ? undefined : h.displayName || h.headerName;

        return {
          key: `header_${h.headerId}`,
          label,
          type: dynamicType,
          dataPath: `section_${sectionId}.header_${h.headerId}`,
          options,
          colSpan: isOnlyControl
            ? 4
            : isFullWidth(dynamicType)
              ? 4
              : isTable
                ? tableHeaderIds.length <= 1
                  ? 4
                  : 2
                : dynamicType === "radio"
                  ? 2
                  : 1,
          conditionalDisplay,
          asyncSearch,
          columns: isTable ? (tableColumnsByHeaderId[h.headerId] ?? []) : undefined,
          masterEntryConfig: isTable ? behavior?.table?.masterEntry : undefined,
          orderSetConfig: isTable ? behavior?.table?.orderSet : undefined,
          favouritesEnabled: isTable ? (behavior?.table?.favouritesEnabled ?? true) : undefined,
          textFavouritesEnabled: isTextLikeType(dynamicType)
            ? (behavior?.text?.favouritesEnabled ?? false)
            : undefined,
          textLarge: dynamicType === "textarea" ? (behavior?.text?.large ?? false) : undefined,
          doctorId,
        };
      });
    }

    const orderedControls = [
      ...controls.filter(c => c.type === "table"),
      ...controls.filter(c => c.type !== "table"),
    ];

    return {
      key: `section_${sectionId}`,
      type: "Card",
      title: displayName || sectionName,
      controls: orderedControls,
    };
  }, [
    headers,
    isCardGroup,
    lovsByHeaderId,
    dataSourceOptionsByHeaderId,
    tableColumnsByHeaderId,
    tableHeaderIds,
    sectionId,
    sectionName,
    displayName,
    attributeConditions,
    doctorId,
  ]);

  const totalFields = isCardGroup ? 1 : headers.length;
  const filledFields = useMemo(() => {
    if (isCardGroup) {
      const groupValue = getByPath(data, `section_${sectionId}.group`);
      return Array.isArray(groupValue) && groupValue.length > 0 ? 1 : 0;
    }
    return headers.filter(h => {
      const value = getByPath(data, `section_${sectionId}.header_${h.headerId}`);
      return value !== undefined && value !== null && String(value).trim() !== "";
    }).length;
  }, [headers, data, sectionId, isCardGroup]);
  const sectionPercent = totalFields ? Math.round((filledFields / totalFields) * 100) : 0;

  useEffect(() => {
    onProgressChange?.(sectionId, filledFields, totalFields);
  }, [sectionId, filledFields, totalFields, onProgressChange]);

  const reportedEntries = useMemo<EmrSectionAnswerEntry[]>(() => {
    const label = displayName || sectionName;

    if (isCardGroup) {
      const groupValue = getByPath(data, `section_${sectionId}.group`);
      const rows = Array.isArray(groupValue) ? (groupValue as Record<string, unknown>[]) : [];
      if (rows.length === 0) return [];

      const readableRows = rows.map(row => {
        const readable: Record<string, unknown> = {};
        headers.forEach(h => {
          readable[h.displayName || h.headerName] = row[`header_${h.headerId}`];
        });
        return readable;
      });

      return [
        {
          sectionId,
          sectionName: label,
          headerId: 0,
          headerName: label,
          controlType: "card-group",
          value: readableRows,
        },
      ];
    }

    return headers
      .map(h => ({
        headerRecord: h,
        value: getByPath(data, `section_${sectionId}.header_${h.headerId}`),
      }))
      .filter(({ value }) => value !== undefined && value !== null && String(value).trim() !== "")
      .map(({ headerRecord: h, value }) => ({
        sectionId,
        sectionName: label,
        headerId: h.headerId,
        headerName: h.displayName || h.headerName,
        controlType: h.controlType,
        value,
      }));
  }, [isCardGroup, headers, data, sectionId, sectionName, displayName]);

  useEffect(() => {
    onEntriesChange?.(sectionId, reportedEntries);
  }, [sectionId, reportedEntries, onEntriesChange]);

  // edit/change audit trail — diffs this section's header values against their previous values
  // on every data change and logs anything that actually changed (skipped on first mount)
  useEffect(() => {
    if (!patientId || headers.length === 0) return;

    const currentValues: Record<number, unknown> = {};
    headers.forEach(h => {
      currentValues[h.headerId] = getByPath(data, `section_${sectionId}.header_${h.headerId}`);
    });

    const previous = previousValuesRef.current;
    if (previous) {
      headers.forEach(h => {
        const oldValue = previous[h.headerId];
        const newValue = currentValues[h.headerId];
        if (oldValue === newValue) return;
        const bothEmpty =
          (oldValue === undefined || oldValue === null || oldValue === "") &&
          (newValue === undefined || newValue === null || newValue === "");
        if (bothEmpty) return;

        logEdit({
          patientId,
          sectionId,
          headerId: h.headerId,
          headerName: h.displayName || h.headerName,
          oldValue,
          newValue,
          changedBy: authUser?.userId ?? 0,
          changedByName: authUser?.userName ?? "",
          changedOn: new Date().toISOString(),
        });
      });
    }

    previousValuesRef.current = currentValues;
  }, [data, headers, patientId, sectionId, logEdit, authUser]);

  if (headersLoading) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-10">
        <Loader2 size={16} className="animate-spin" />
        Loading section…
      </div>
    );
  }

  if (headers.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-10">This section has no controls mapped</p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-800 truncate min-w-0">
          <span
            className={`w-1.5 h-4 rounded-full shrink-0 bg-gradient-to-b ${sectionAccent.grad}`}
          />
          {displayName || sectionName}
        </h2>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* TODO: re-gate behind canViewEmrSectionHistory (screens/navbar/components/accessControl.ts)
              once the backend's GET_USER_ACCESS_RIGHTS actually returns CanViewEmrSectionHistory */}
          <button
            type="button"
            onClick={() => onOpenHistory?.()}
            title="View section history"
            className="flex items-center justify-center w-5 h-5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <History size={12} />
          </button>

          <span
            className={`flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${
              sectionPercent === 100
                ? "text-emerald-600 bg-emerald-50"
                : "text-slate-500 bg-slate-100"
            }`}
          >
            {sectionPercent === 100 && <CheckCircle2 size={10} />}
            {filledFields}/{totalFields} · {sectionPercent}%
          </span>
        </div>
      </div>

      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            sectionPercent === 100 ? "bg-emerald-400" : `bg-gradient-to-r ${sectionAccent.grad}`
          }`}
          style={{ width: `${sectionPercent}%` }}
        />
      </div>

      <div
        className="[&_.card]:!bg-transparent [&_.card]:!border-0 [&_.card]:!shadow-none [&_.card]:!p-0 [&_.card]:!rounded-none
        [&_.card-title]:hidden
        [&_.input-label]:text-[10.5px] [&_.input-label]:font-semibold [&_.input-label]:text-slate-500 [&_.input-label]:uppercase [&_.input-label]:tracking-wide [&_.input-label]:mb-1
        [&_.input-field]:text-[13.5px] [&_.input-field]:py-2 [&_.input-field]:px-3
        [&_.input-field-error]:text-[11px]
        [&_.dynamic-form-grid]:grid-cols-1 sm:[&_.dynamic-form-grid]:grid-cols-2 md:[&_.dynamic-form-grid]:grid-cols-3 lg:[&_.dynamic-form-grid]:grid-cols-4 [&_.dynamic-form-grid]:gap-x-4 [&_.dynamic-form-grid]:gap-y-3"
      >
        <DynamicFormRenderer blob={[cardSchema]} data={data} onDataChange={onDataChange} />
      </div>
    </div>
  );
};

export default EmrSectionRenderer;
