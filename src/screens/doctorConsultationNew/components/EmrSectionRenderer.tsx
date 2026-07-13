import DynamicFormRenderer from "@/components/dynamicForm/DynamicFormRenderer";
import { CardSchema, ControlSchema, OptionSchema } from "@/components/dynamicForm/types";
import { getByPath } from "@/components/dynamicForm/utils/path";
import { ENDPOINTS } from "@/config/defaults";
import useGlobalApi from "@/hooks/useGlobalApi";
import { SectionAttributeCondition, SectionHeaderMappingRecord } from "@/screens/emrControls/types";
import { groupAttributeConditionRows } from "@/screens/emrControls/utils/attributeConditionParsing";
import { useQueries, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";

interface EmrSectionRendererProps {
  sectionId: number;
  sectionName: string;
  displayName?: string;
  data: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
  onHeadersLoaded?: (headers: SectionHeaderMappingRecord[]) => void;
}

const mapControlType = (controlType: string): string => {
  const key = (controlType || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-_]/g, "");
  if (key.includes("rich")) return "richtext";
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
const isDoctorHeader = (headerName: string) => (headerName || "").trim().toLowerCase() === "doctor";
const isMedicineHeader = (headerName: string) =>
  (headerName || "").trim().toLowerCase().includes("medicine");

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

  const headerIdsNeedingOptions = useMemo(
    () =>
      headers
        .filter(
          h =>
            needsOptions(mapControlType(h.controlType)) &&
            !isDoctorHeader(h.headerName) &&
            !isMedicineHeader(h.headerName)
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
      // value: item?.DoctorId ?? item?.doctorId ?? item?.Id ?? item?.id ?? item?.Value ?? item?.value,
      // label:
      //   item?.CompleteName ??
      //   item?.completeName ??
      //   item?.DoctorName ??
      //   item?.doctorName ??
      //   item?.Name ??
      //   item?.name ??
      //   item?.Label ??
      //   item?.label ??
      //   "",
      value: item?.Value,
      label: item?.name,
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

  const getMedicineOptions = async (): Promise<OptionSchema[]> => {
    const resp = await fetchApi(
      "GET",
      ENDPOINTS.GET_SERVICE_ITEM_LIST,
      {},
      { params: { categoryTypeId: 6, serviceName: "medicine", isActive: 1 } },
      { component: "EmrSectionRenderer", silent: true }
    );
    const raw: any[] = Array.isArray(resp?.data) ? resp.data : [];
    return raw.map(item => ({ value: item?.serviceItemId, label: item?.name ?? "" }));
  };

  const medicineHeaderIds = useMemo(
    () => headers.filter(h => isMedicineHeader(h.headerName)).map(h => h.headerId),
    [headers]
  );

  const medicineOptionsQueries = useQueries({
    queries: medicineHeaderIds.map(headerId => ({
      queryKey: ["emrHeaderMedicineOptions", headerId],
      queryFn: getMedicineOptions,
    })),
  });

  const medicineOptionsByHeaderId = useMemo(() => {
    const map: Record<number, OptionSchema[]> = {};
    medicineHeaderIds.forEach((headerId, idx) => {
      map[headerId] = medicineOptionsQueries[idx]?.data ?? [];
    });
    return map;
  }, [medicineHeaderIds, medicineOptionsQueries]);

  const cardSchema: CardSchema = useMemo(() => {
    const rulesByHeaderId = new Map(attributeConditions.map(a => [a.targetHeaderId, a.conditions]));

    const controls: ControlSchema[] = headers.map(h => {
      const isDoctor = isDoctorHeader(h.headerName);
      const isMedicine = isMedicineHeader(h.headerName);
      const dynamicType = isDoctor || isMedicine ? "dropdown" : mapControlType(h.controlType);
      const ownRules = rulesByHeaderId.get(h.headerId);

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
          : isMedicine
            ? (medicineOptionsByHeaderId[h.headerId] ?? [])
            : needsOptions(dynamicType)
              ? (lovsByHeaderId[h.headerId] ?? [])
              : undefined,
        colSpan: isFullWidth(dynamicType) ? 4 : dynamicType === "radio" ? 2 : 1,
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
    medicineOptionsByHeaderId,
    sectionId,
    sectionName,
    displayName,
    attributeConditions,
  ]);

  const totalFields = headers.length;
  const filledFields = useMemo(
    () =>
      headers.filter(h => {
        const value = getByPath(data, `section_${sectionId}.header_${h.headerId}`);
        return value !== undefined && value !== null && String(value).trim() !== "";
      }).length,
    [headers, data, sectionId]
  );
  const sectionPercent = totalFields ? Math.round((filledFields / totalFields) * 100) : 0;

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
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <h2 className="text-[14px] font-semibold text-slate-800 truncate min-w-0">
          {displayName || sectionName}
        </h2>

        <span
          className={`shrink-0 flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${
            sectionPercent === 100
              ? "text-emerald-600 bg-emerald-50"
              : "text-slate-500 bg-slate-100"
          }`}
        >
          {sectionPercent === 100 && <CheckCircle2 size={10} />}
          {filledFields}/{totalFields} · {sectionPercent}%
        </span>
      </div>

      <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            sectionPercent === 100 ? "bg-emerald-400" : "bg-red-300"
          }`}
          style={{ width: `${sectionPercent}%` }}
        />
      </div>

      <div
        className="[&_.card]:!bg-transparent [&_.card]:!border-0 [&_.card]:!shadow-none [&_.card]:!p-0 [&_.card]:!rounded-none
        [&_.card-title]:hidden
        [&_.input-label]:text-[10.5px] [&_.input-label]:font-semibold [&_.input-label]:text-slate-500 [&_.input-label]:uppercase [&_.input-label]:tracking-wide [&_.input-label]:mb-1
        [&_.input-field]:!shadow-none [&_.input-field]:text-[13.5px] [&_.input-field]:py-2 [&_.input-field]:px-3 [&_.input-field]:rounded-lg [&_.input-field]:border-slate-200 [&_.input-field]:bg-white
        [&_.input-field]:transition-colors [&_.input-field]:duration-150
        hover:[&_.input-field]:border-slate-300
        focus-within:[&_.input-field]:!ring-2 focus-within:[&_.input-field]:ring-indigo-100 focus-within:[&_.input-field]:!border-indigo-400
        [&_.input-field-error]:text-[11px]
        [&_.dynamic-form-grid]:grid-cols-2 sm:[&_.dynamic-form-grid]:grid-cols-3 lg:[&_.dynamic-form-grid]:grid-cols-4 [&_.dynamic-form-grid]:gap-x-4 [&_.dynamic-form-grid]:gap-y-4"
      >
        <DynamicFormRenderer blob={[cardSchema]} data={data} onDataChange={onDataChange} />
      </div>
    </div>
  );
};

export default EmrSectionRenderer;
