import * as Yup from "yup";

/**
 * parseValidationRegex
 * Accepts:
 *  - RegExp object -> returned as-is
 *  - string in form "/pattern/flags" -> converted to RegExp
 *  - plain string "^[0-9]{10}$" -> converted to RegExp
 */
function parseValidationRegex(val) {
  if (!val) return null;
  if (val instanceof RegExp) return val;

  if (typeof val !== "string") return null;
  const trimmed = val.trim();

  // /pattern/flags
  const slashRegex = /^\/(.+)\/([gimsuy]*)$/;
  const match = trimmed.match(slashRegex);
  if (match) {
    try {
      return new RegExp(match[1], match[2]);
    } catch (e) {
      console.warn("Invalid regex in form config:", val);
      return null;
    }
  }

  // try plain string -> treat as pattern
  try {
    return new RegExp(trimmed);
  } catch (e) {
    console.warn("Invalid regex in form config:", val);
    return null;
  }
}

/**
 * buildYupSchema
 * formConfig: array of field config objects. Important props:
 *  - fieldId (string): key to use in schema / form values
 *  - type (string): "text" | "email" | "password" | "number" | ...
 *  - required (boolean or string)
 *  - validation (string or RegExp): regex pattern or "/.../flags"
 *  - validationMessage (string): optional custom message
 *  - maxLength (number)
 *  - confirmFor (string): if present, this field must equal the named field (use on confirmPassword)
 */
export function buildYupSchema(formConfig = []) {
  const shape = {};

  // first pass: create base rules
  formConfig.forEach(fld => {
    const id = fld.fieldId;
    if (!id) return; // skip fields without id (like headings)

    const type = (fld.type || "text").toLowerCase();
    let schema;

    // base schema by type
    switch (type) {
      case "email":
        schema = Yup.string().trim().email("Enter a valid email");
        break;
      case "number":
        // store as string but validate numeric pattern; if you prefer number type use Yup.number()
        schema = Yup.string()
          .trim()
          .matches(/^\d+$/, fld.validationMessage || "Enter a valid number");
        break;
      case "password":
      case "text":
      default:
        schema = Yup.string().trim();
        break;
    }

    // required
    if (fld.required) {
      const msg =
        typeof fld.required === "string" ? fld.required : `${fld.label || id} is required`;
      schema = schema.required(msg);
    } else {
      // allow empty string -> convert empty string to undefined if you want nullable
      schema = schema.nullable();
    }

    // maxLength
    if (typeof fld.maxLength === "number") {
      schema = schema.max(fld.maxLength, `Maximum ${fld.maxLength} characters allowed`);
    }

    // validation via regex
    if (fld.validation) {
      const regex = parseValidationRegex(fld.validation);
      if (regex) {
        const msg = fld.validationMessage || "Invalid format";
        schema = schema.matches(regex, msg);
      }
    }

    // custom additional constraints (like min / exact length) could be added from config

    shape[id] = schema;
  });

  // second pass for cross-field rules (e.g., confirm password)
  Object.values(formConfig).forEach(fld => {
    const id = fld.fieldId;
    if (!id) return;
    if (fld.confirmFor) {
      // make sure target exists in shape
      if (shape[fld.confirmFor]) {
        shape[id] = shape[id].oneOf(
          [Yup.ref(fld.confirmFor)],
          fld.validationMessage || "Fields do not match"
        );
      } else {
        console.warn(`confirmFor target not found for field ${id}: ${fld.confirmFor}`);
      }
    }
  });

  return Yup.object().shape(shape);
}
