export const extractLineInfo = (stack?: string) => {
  if (!stack) return {};

  const match = stack.match(/:(\d+):(\d+)/);

  if (!match) return {};

  return {
    line: Number(match[1]),
    column: Number(match[2]),
  };
};

type ApiValidationErrorResponse = {
  title?: string;
  message?: string;
  errors?: Record<string, string[] | string>;
};

export const getApiValidationFieldErrors = (
  response: unknown
): Record<string, string[]> => {
  if (!response || typeof response !== "object") return {};

  const errors = (response as ApiValidationErrorResponse).errors;
  if (!errors || typeof errors !== "object") return {};

  return Object.entries(errors).reduce<Record<string, string[]>>((acc, [field, messages]) => {
    if (Array.isArray(messages)) {
      acc[field] = messages.map(message => String(message));
      return acc;
    }

    if (messages !== undefined && messages !== null) {
      acc[field] = [String(messages)];
    }

    return acc;
  }, {});
};

export const formatApiValidationMessage = (response: unknown, fallback = "Validation failed"): string => {
  const fieldErrors = getApiValidationFieldErrors(response);
  const messages = Object.entries(fieldErrors).flatMap(([field, fieldMessages]) =>
    fieldMessages.map(message => `${field}: ${message}`)
  );

  if (messages.length > 0) {
    return messages.join("\n");
  }

  if (response && typeof response === "object") {
    const payload = response as ApiValidationErrorResponse;
    return payload.message || payload.title || fallback;
  }

  return fallback;
};
