import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchThemeConfig } from "../api/theme";
import {
  defaultTheme,
  type ThemeOverrides,
  type ThemeShape,
} from "../constants/themeDefaults";

type ThemeContextValue = {
  theme: ThemeShape;
  isLoading: boolean;
  error: Error | null;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  isLoading: false,
  error: null,
});

function mergeTheme(remoteTheme?: ThemeOverrides): ThemeShape {
  if (!remoteTheme) return defaultTheme;

  return {
    ...defaultTheme,
    ...remoteTheme,
    meta: {
      ...defaultTheme.meta,
      ...remoteTheme.meta,
    },
    colors: {
      ...defaultTheme.colors,
      ...remoteTheme.colors,
    },
    fonts: {
      ...defaultTheme.fonts,
      ...remoteTheme.fonts,
    },
    spacing: {
      ...defaultTheme.spacing,
      ...remoteTheme.spacing,
    },
    layout: {
      ...defaultTheme.layout,
      ...remoteTheme.layout,
    },
  };
}

function applyThemeToDocument(theme: ThemeShape) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const { colors, fonts, spacing, layout } = theme;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  Object.entries(fonts).forEach(([key, value]) => {
    root.style.setProperty(`--font-${key}`, value);
  });

  Object.entries(spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });

  Object.entries(layout).forEach(([key, value]) => {
    root.style.setProperty(`--layout-${key}`, value);
  });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeShape>(defaultTheme);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    applyThemeToDocument(defaultTheme);

    async function loadTheme() {
      setIsLoading(true);

      try {
        const remoteTheme = await fetchThemeConfig(abortController.signal);
        if (!isMounted) return;

        const mergedTheme = mergeTheme(remoteTheme);
        setTheme(mergedTheme);
        applyThemeToDocument(mergedTheme);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;

        const normalizedError =
          err instanceof Error
            ? err
            : new Error("Unknown error while loading theme");

        console.warn("Falling back to default theme", normalizedError);
        setTheme(defaultTheme);
        applyThemeToDocument(defaultTheme);
        setError(normalizedError);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTheme();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isLoading,
      error,
    }),
    [theme, isLoading, error]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}