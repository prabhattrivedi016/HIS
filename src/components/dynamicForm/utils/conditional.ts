import { ConditionalRule } from "../types";
import { getByPath } from "./path";

const isEmptyValue = (value: unknown): boolean =>
  value === undefined || value === null || value === "";

const toValueList = (target: unknown): string[] =>
  String(target ?? "")
    .split(",")
    .map(v => v.trim())
    .filter(Boolean);

const compareNumeric = (
  actual: unknown,
  target: unknown,
  exp: "<" | "<=" | ">" | ">="
): boolean => {
  const a = Number(actual);
  const b = Number(target);
  if (Number.isNaN(a) || Number.isNaN(b)) return false;

  switch (exp) {
    case "<":
      return a < b;
    case "<=":
      return a <= b;
    case ">":
      return a > b;
    case ">=":
      return a >= b;
  }
};

const singleValue = (v: unknown): unknown =>
  v && typeof v === "object" && "value" in (v as Record<string, unknown>)
    ? (v as Record<string, unknown>).value
    : v;

const evaluateRule = (rule: ConditionalRule, actual: unknown): boolean => {
  if (Array.isArray(actual)) {
    const values = actual.map(singleValue);
    switch (rule.exp) {
      case "==":
        return values.some(v => String(v) === String(rule.target));
      case "!=":
        return !values.some(v => String(v) === String(rule.target));
      case "isnull": {
        const empty = isEmptyValue(actual) || actual.length === 0;
        return String(rule.target) === "True" ? empty : !empty;
      }
      case "in": {
        const list = toValueList(rule.target);
        return values.some(v => list.includes(String(v)));
      }
      case "notin": {
        const list = toValueList(rule.target);
        return !values.some(v => list.includes(String(v)));
      }
      default:
        return true;
    }
  }

  switch (rule.exp) {
    case "==":
      return actual === rule.target;
    case "!=":
      return actual !== rule.target;
    case "isnull": {
      const empty = isEmptyValue(actual);
      return String(rule.target) === "True" ? empty : !empty;
    }
    case "in":
      return toValueList(rule.target).includes(String(actual));
    case "notin":
      return !toValueList(rule.target).includes(String(actual));
    case "<":
    case "<=":
    case ">":
    case ">=":
      return compareNumeric(actual, rule.target, rule.exp);
    default:
      return true;
  }
};

export const evaluateConditionalDisplay = (
  rules: ConditionalRule[] | undefined,
  data: unknown
): boolean => {
  if (!rules || rules.length === 0) return true;

  return rules.reduce((acc, rule, idx) => {
    const actual = getByPath(data, rule.src);
    const passes = evaluateRule(rule, actual);

    if (idx === 0) return passes;
    return rule.connector === "||" ? acc || passes : acc && passes;
  }, true);
};
