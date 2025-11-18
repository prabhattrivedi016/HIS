export type ThemeShape = {
  meta: {
    version: number;
  };
  colors: {
    background: string;
    surface: string;
    primary: string;
    primaryContrast: string;
    text: string;
    textSubtle: string;
    border: string;
  };
  fonts: {
    base: string;
    heading: string;
    monospace: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  layout: {
    maxWidth: string;
    sidebarWidth: string;
    borderRadius: string;
    navHeight: string;
  };
};

export const defaultTheme: ThemeShape = {
  meta: {
    version: 1,
  },
  colors: {
    background: "#ffffff",
    surface: "#f4f4f5",
    primary: "#1f7ae0",
    primaryContrast: "#ffffff",
    text: "#0f172a",
    textSubtle: "#475569",
    border: "#e2e8f0",
  },
  fonts: {
    base: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    heading: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    monospace: "'JetBrains Mono', 'SFMono-Regular', Menlo, monospace",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  layout: {
    maxWidth: "1200px",
    sidebarWidth: "280px",
    borderRadius: "0.5rem",
    navHeight: "64px",
  },
};

export type ThemeOverrides = DeepPartial<ThemeShape>;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown>
    ? DeepPartial<T[K]>
    : T[K];
};

