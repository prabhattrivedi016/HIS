import type { ThemeOverrides } from "../constants/themeDefaults";

const THEME_ENDPOINT = "/api/theme";

export async function fetchThemeConfig(
  signal: AbortSignal
): Promise<ThemeOverrides | undefined> {
  const response = await fetch(THEME_ENDPOINT, { signal });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Theme request failed (${response.status}): ${errorText || "Unknown error"}`
    );
  }

  const data = (await response.json()) as ThemeOverrides | undefined;
  return data;
}

