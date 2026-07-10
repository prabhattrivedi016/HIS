import DynamicFormRenderer from "@/components/dynamicForm/DynamicFormRenderer";
import { CardSchema, ControlSchema, OptionSchema } from "@/components/dynamicForm/types";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { SectionAttributeCondition, SectionHeaderMappingRecord } from "@/screens/emrControls/types";
import { groupAttributeConditionRows } from "@/screens/emrControls/utils/attributeConditionParsing";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";

interface EmrSectionRendererProps {
  sectionId: number;
  sectionName: string;
  displayName?: string;
  data: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
  onHeadersLoaded?: (headers: SectionHeaderMappingRecord[]) => void;
}

/** HeaderMaster's controlType is a free-text picklist value (DoctorHeaderControlType), e.g.
 * "Text Box", "Text Area", "Drop Down", "Radio Button" — normalize away spaces/hyphens before
 * matching so naming variants ("Dropdown" vs "Drop Down") all resolve to the same control,
 * defaulting to a plain text input when nothing matches */
const mapControlType = (controlType: string): string => {
  const key = (controlType || "").trim().toLowerCase().replace(/[\s-_]/g, "");
  if (key.includes("rich")) return "richtext";
  if (key.includes("textarea")) return "textarea";
  if (key.includes("date")) return "date";
  if (key.includes("number")) return "number";
  if (key.includes("currency")) return "currency";
  if (key.includes("check")) return "switch";
  if (key.includes("dropdown") || key.includes("select") || key.includes("combo")) return "dropdown";
  if (key.includes("radio")) return "radio";
  return "text";
};

const needsOptions = (dynamicType: string) => dynamicType === "radio" || dynamicType === "dropdown";
/** only CKEditor needs the full row — its toolbar+editor block doesn't fit a grid cell;
 * plain textareas (e.g. Doctor Progress Note) stay compact, same size as every other field */
const isFullWidth = (dynamicType: string) => dynamicType === "richtext";
/** only a header named EXACTLY "Doctor" renders as a dropdown populated from the real Doctor
 * Master (via EMR/getEMRSectionHeaderDoctorOptions) — an exact match, not a substring, so
 * headers like "Doctor Progress Note" or "Referred Doctor" are left untouched */
const isDoctorHeader = (headerName: string) => (headerName || "").trim().toLowerCase() === "doctor";

/** given a sectionId, fetches every header mapped to that EMR Section (in sequence order),
 * resolves options for Radio/Dropdown controls, and renders all of them via the dynamicForm engine */
const EmrSectionRenderer = ({
  sectionId,
  sectionName,
  displayName,
  data,
  onDataChange,
  onHeadersLoaded,
}: EmrSectionRendererProps) => {
  const { fetchApi } = useGlobalApi();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers]);

  /** each attribute can have its own independent condition chain (Field/Operator/Value rows,
   * AND/OR joined) referencing any other attribute in the section — configured per-attribute
   * via EMR Controls' "Conditional Controls" popup. EMR/getEMRSectionAttributeCondition returns
   * one flat row per condition, grouped here by TargetHeaderId. */
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

  // "Doctor" headers get their options from the real Doctor Master (below), not this generic LOVs list
  const headerIdsNeedingOptions = useMemo(
    () =>
      headers
        .filter(h => needsOptions(mapControlType(h.controlType)) && !isDoctorHeader(h.headerName))
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

  /** the "Doctor" header's dropdown is driven by running its saved query (same mechanism as
   * the "Custom" control type's Query field in Header Master) — headerId is the only param */
  const getDoctorOptionsForHeader = async (headerId: number): Promise<OptionSchema[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_EMR_HEADER_QUERY_RESULT,
      {},
      { params: { headerId } },
      { component: "EmrSectionRenderer", silent: true }
    );
    const raw: any[] = Array.isArray(resp?.data) ? resp.data : [];
    return raw.map(item => ({
      value: item?.DoctorId ?? item?.doctorId ?? item?.Id ?? item?.id ?? item?.Value ?? item?.value,
      label:
        item?.CompleteName ??
        item?.completeName ??
        item?.DoctorName ??
        item?.doctorName ??
        item?.Name ??
        item?.name ??
        item?.Label ??
        item?.label ??
        "",
    }));
  };

  const doctorHeaderIds = useMemo(
    () => headers.filter(h => isDoctorHeader(h.headerName)).map(h => h.headerId),
    [headers]
  );

  const doctorOptionsQueries = useQueries({
    queries: doctorHeaderIds.map(headerId => ({
      queryKey: ["emrHeaderQueryResult", headerId],
      queryFn: () => getDoctorOptionsForHeader(headerId),
    })),
  });

  const doctorOptionsByHeaderId = useMemo(() => {
    const map: Record<number, OptionSchema[]> = {};
    doctorHeaderIds.forEach((headerId, idx) => {
      map[headerId] = doctorOptionsQueries[idx]?.data ?? [];
    });
    return map;
  }, [doctorHeaderIds, doctorOptionsQueries]);

  const cardSchema: CardSchema = useMemo(() => {
    const rulesByHeaderId = new Map(attributeConditions.map(a => [a.targetHeaderId, a.conditions]));

    const controls: ControlSchema[] = headers.map(h => {
      const isDoctor = isDoctorHeader(h.headerName);
      // a "Doctor" header always renders as a dropdown sourced from the real Doctor
      // Master, regardless of whatever controlType was configured for it
      const dynamicType = isDoctor ? "dropdown" : mapControlType(h.controlType);
      const ownRules = rulesByHeaderId.get(h.headerId);

      // translate this attribute's own Field/Operator/Value rows into the dynamicForm
      // engine's ConditionalRule chain — each attribute has a fully independent chain
      const conditionalDisplay: ControlSchema["conditionalDisplay"] = ownRules?.length
        ? ownRules.map(rule => ({
            src: `section_${sectionId}.header_${rule.headerId}`,
            exp: rule.operator,
            target: rule.value,
            connector: rule.connector === "OR" ? ("||" as const) : ("&&" as const),
          }))
        : undefined;

      return {
        key: `header_${h.headerId}`,
        label: h.displayName || h.headerName,
        type: dynamicType,
        dataPath: `section_${sectionId}.header_${h.headerId}`,
        options: isDoctor
          ? (doctorOptionsByHeaderId[h.headerId] ?? [])
          : needsOptions(dynamicType)
            ? (lovsByHeaderId[h.headerId] ?? [])
            : undefined,
        colSpan: isFullWidth(dynamicType) ? 4 : dynamicType === "radio" ? 2 : 1,
        // hidden until this attribute's own condition chain (configured in EMR Controls'
        // "Conditional Controls" popup) resolves true; attributes with no chain always render
        conditionalDisplay,
      };
    });

    return {
      key: `section_${sectionId}`,
      type: "Card",
      title: displayName || sectionName,
      controls,
    };
  }, [
    headers,
    lovsByHeaderId,
    doctorOptionsByHeaderId,
    sectionId,
    sectionName,
    displayName,
    attributeConditions,
  ]);

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
    <div
      className="[&_.card]:border-0 [&_.card]:shadow-none [&_.card]:p-0 [&_.card]:rounded-none
      [&_.card-title]:text-[13px] [&_.card-title]:font-bold [&_.card-title]:text-gray-800 [&_.card-title]:mt-0 [&_.card-title]:mb-2
      [&_.input-label]:text-[11px] [&_.input-label]:font-medium [&_.input-label]:text-gray-500 [&_.input-label]:uppercase [&_.input-label]:tracking-wide
      [&_.input-field]:text-[13px] [&_.input-field]:py-1.5
      [&_.input-field-error]:text-[11px]
      [&_.dynamic-form-grid]:grid-cols-2 sm:[&_.dynamic-form-grid]:grid-cols-3 lg:[&_.dynamic-form-grid]:grid-cols-4 [&_.dynamic-form-grid]:gap-x-4 [&_.dynamic-form-grid]:gap-y-3"
    >
      <DynamicFormRenderer blob={[cardSchema]} data={data} onDataChange={onDataChange} />
    </div>
  );
};

export default EmrSectionRenderer;
