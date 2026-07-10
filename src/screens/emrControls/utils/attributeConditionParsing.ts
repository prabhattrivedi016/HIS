import { SectionAttributeCondition, SectionConditionalRule } from "../types";

/**
 * EMR/getEMRSectionAttributeCondition returns one FLAT row per condition (not nested), e.g.
 * { TargetHeaderId, TargetHeaderName, HeaderId, HeaderName, Operator, Value, Connector }.
 * Groups those rows by TargetHeaderId into the nested SectionAttributeCondition[] shape the
 * popup and the EMR page both work with — row order within a group is preserved as-is.
 */
export const groupAttributeConditionRows = (rows: any[]): SectionAttributeCondition[] => {
  const order: number[] = [];
  const byTargetHeaderId = new Map<number, SectionConditionalRule[]>();

  rows.forEach(row => {
    const targetHeaderId = row.TargetHeaderId ?? row.targetHeaderId;
    if (targetHeaderId === undefined || targetHeaderId === null) return;

    const rule: SectionConditionalRule = {
      id: row.Id ?? row.id ?? undefined,
      headerId: row.HeaderId ?? row.headerId ?? null,
      operator: row.Operator ?? row.operator ?? "==",
      value: row.Value ?? row.value ?? "",
      connector: row.Connector ?? row.connector ?? "AND",
    };

    if (!byTargetHeaderId.has(targetHeaderId)) {
      byTargetHeaderId.set(targetHeaderId, []);
      order.push(targetHeaderId);
    }
    byTargetHeaderId.get(targetHeaderId)!.push(rule);
  });

  return order.map(targetHeaderId => ({
    targetHeaderId,
    conditions: byTargetHeaderId.get(targetHeaderId)!,
  }));
};
