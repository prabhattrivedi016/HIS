import { ConditionalRule } from "../types";
import { getByPath } from "./path";

/**
 * evaluates a chain of rules against the data object.
 * each rule's own `connector` says how it joins with whatever came before it
 * (matches the reference schema convention — the first rule's connector is ignored).
 */
export const evaluateConditionalDisplay = (
  rules: ConditionalRule[] | undefined,
  data: unknown
): boolean => {
  if (!rules || rules.length === 0) return true;

  return rules.reduce((acc, rule, idx) => {
    const actual = getByPath(data, rule.src);
    const passes = rule.exp === "==" ? actual === rule.target : actual !== rule.target;

    if (idx === 0) return passes;
    return rule.connector === "||" ? acc || passes : acc && passes;
  }, true);
};
