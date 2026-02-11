export const extractLineInfo = (stack?: string) => {
  if (!stack) return {};

  const match = stack.match(/:(\d+):(\d+)/);

  if (!match) return {};

  return {
    line: Number(match[1]),
    column: Number(match[2]),
  };
};
