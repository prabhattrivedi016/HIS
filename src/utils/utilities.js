const stopPropagationHandler = e => {
  e.stopPropagation();
};

// helper : returns null instead of empty array
const mapOrNull = (arr, mapper) => {
  if (!Array.isArray(arr) || arr.length === 0) return null;

  const mapped = arr.map(mapper).filter(Boolean);
  return mapped.length > 0 ? mapped : null;
};

const transformDataWithConfig = (config, apiResponse) => {
  const dataArray = apiResponse?.data || [];

  if (!config) return { gridView: [], listView: [] };

  const normalizeView = (viewConfig, mode) => {
    if (!viewConfig) return null;

    return {
      type: config.type,

      cardLeftTop: viewConfig[`${mode}LeftTop`] || null,
      cardRightTop: viewConfig[`${mode}RightTop`] || null,
      cardAvatar: viewConfig[`${mode}Avatar`] || null,
      cardId: viewConfig[`${mode}Id`] || null,
      cardTitle: viewConfig[`${mode}Title`] || null,
      cardFooter: viewConfig[`${mode}FooterSection`] || null,
      buttonSection: viewConfig[`${mode}ButtonSection`] || null,

      listLeftButton: viewConfig[`${mode}LeftButton`] || null,
      listStatus: viewConfig[`${mode}Status`] || null, //
      listGroupSection: viewConfig[`${mode}GroupSection`] || null,
    };
  };

  const gridCfg = normalizeView(config.gridCardView, "grid");
  const listCfg = normalizeView(config.listCardView, "list");

  const buildCard = (item, cfg) => {
    if (!cfg) return null;

    const cardLeftTop = mapOrNull(cfg.cardLeftTop, f => ({
      label: f.label,
      value: item[f.keyFromApi] ?? null,
    }));

    const cardAvatar = cfg.cardAvatar?.length ? item[cfg.cardAvatar[0].keyFromApi] || null : null;

    const cardId = mapOrNull(cfg.cardId, f => ({
      label: f.label,
      value: item[f.keyFromApi],
    }));

    const cardTitle = mapOrNull(cfg.cardTitle, t => ({
      label: t.label || "Title",
      value: item[t.keyFromApi] ?? null,
    }));

    const cardFooter = mapOrNull(cfg.cardFooter, f => ({
      label: f.label,
      value: item[f.keyFromApi],
    }));

    const listLeftButton = cfg.listLeftButton || null;

    const listStatus = mapOrNull(cfg.listStatus, s => ({
      label: s.label,
      value: item[s.keyFromApi], // Raw status 1 or 0
    }));

    const listGroupSection = mapOrNull(cfg.listGroupSection, g => ({
      label: g.label,
      value: item[g.keyFromApi],
    }));

    return {
      type: cfg.type,
      id: item.roleId || item.id || null,

      cardLeftTop,
      cardRightTop: cfg.cardRightTop || null,
      cardAvatar,
      cardId,
      cardTitle,
      cardFooter,
      buttonSection: cfg.buttonSection || null,

      listLeftButton,
      listStatus,
      listGroupSection,
    };
  };

  return {
    gridView: gridCfg ? dataArray.map(item => buildCard(item, gridCfg)) : [],
    listView: listCfg ? dataArray.map(item => buildCard(item, listCfg)) : [],
  };
};

export { stopPropagationHandler, transformDataWithConfig };
