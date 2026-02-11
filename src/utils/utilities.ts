const stopPropagationHandler = e => e.stopPropagation();

const mapOrNull = (arr, mapper) => {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const out = arr.map(mapper).filter(Boolean);
  return out.length ? out : null;
};

const transformDataWithConfig = (config, apiResponse) => {
  if (!config) return { gridView: [], listView: [] };

  const dataArray = apiResponse?.data || [];

  const GRID_MAP = {
    gridLeftTop: "cardLeftTop",
    gridRightTop: "cardRightTop",
    gridAvatar: "cardAvatar",
    gridId: "cardId",
    gridTitle: "cardTitle",
    gridFooterSection: "cardFooter",
    gridButtonSection: "buttonSection",
  };

  const LIST_MAP = {
    listLeftButton: "listLeftButton",
    columns: "columns",
  };

  const normalizeConfig = (viewConfig, map) => {
    if (!viewConfig) return null;

    const out = {
      type: viewConfig.type,
      cardType: viewConfig.cardType || null,
      cardViewType: viewConfig.cardViewType || null,
      recordIdKey: viewConfig.recordIdKey || null,
    };

    Object.entries(map).forEach(([rawKey, normalizedKey]) => {
      if (viewConfig[rawKey]) out[normalizedKey] = viewConfig[rawKey];
    });

    return out;
  };

  const getFieldValue = (item, field) => {
    if (Array.isArray(field.combine)) {
      return field.combine
        .map(c => (typeof c === "string" ? item[c] ?? "" : item[c.key] ?? c.default ?? ""))
        .join(" ")
        .trim();
    }

    if (field.keyFromApi) {
      return item[field.keyFromApi] ?? field.default ?? null;
    }

    return null;
  };

  const normalizeRecordId = (item, recordIdKey) => {
    if (!recordIdKey) {
      console.error(" recordIdKey missing in config", item);
      return null;
    }

    const rawId = item[recordIdKey];

    if (rawId === undefined || rawId === null) {
      console.error(`Missing recordId "${recordIdKey}" in API item`, item);
      return null;
    }

    if (typeof rawId === "number") return rawId;

    if (typeof rawId === "string") {
      if (rawId.includes(",")) {
        console.warn(` Invalid recordId "${rawId}" detected. Using first value only.`, item);
        return Number(rawId.split(",")[0]);
      }

      return Number(rawId) || rawId;
    }

    return null;
  };

  const buildCard = (item, cfg, isGrid) => {
    const recordId = normalizeRecordId(item, cfg.recordIdKey);

    const out = {
      type: cfg.type,
      cardType: cfg.cardType,
      cardViewType: cfg.cardViewType,
    };

    Object.defineProperty(out, "id", {
      value: recordId,
      writable: false,
      enumerable: true,
    });

    if (isGrid) {
      out.cardLeftTop = mapOrNull(cfg.cardLeftTop, f => ({
        label: f.label,
        value: item[f.keyFromApi] ?? null,
      }));

      out.cardRightTop = cfg.cardRightTop || null;

      out.cardAvatar = cfg.cardAvatar?.length ? item[cfg.cardAvatar[0].keyFromApi] ?? null : null;

      out.cardId = mapOrNull(cfg.cardId, f => ({
        label: f.label,
        value: item[f.keyFromApi] ?? null,
      }));

      out.cardTitle = mapOrNull(cfg.cardTitle, f => ({
        label: f.label,
        value: item[f.keyFromApi] ?? null,
      }));

      out.cardFooter = mapOrNull(cfg.cardFooter, f => ({
        label: f.label,
        value: item[f.keyFromApi] ?? null,
      }));

      out.buttonSection = cfg.buttonSection || null;
    }

    if (!isGrid) {
      out.listLeftButton = cfg.listLeftButton || null;

      out.columns = cfg.columns
        ? cfg.columns.map(col => ({
            ...col,
            value: getFieldValue(item, col),
          }))
        : null;
    }

    return out;
  };

  const gridCfg = normalizeConfig(config.gridCardView, GRID_MAP);
  const listCfg = normalizeConfig(config.listCardView, LIST_MAP);

  return {
    gridView: gridCfg ? dataArray.map(item => buildCard(item, gridCfg, true)) : [],
    listView: listCfg ? dataArray.map(item => buildCard(item, listCfg, false)) : [],
  };
};

export { stopPropagationHandler, transformDataWithConfig };
