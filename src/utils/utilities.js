const stopPropagationHandler = e => {
  e.stopPropagation();
};

const transformDataWithConfig = (config, apiResponse) => {
  const dataArray = apiResponse?.data || [];
  console.log(apiResponse);

  const normalizeView = (viewConfig, mode) => {
    if (!viewConfig) return null;

    return {
      type: config.type,

      leftTop: viewConfig[`${mode}LeftTop`] || [],
      rightTop: viewConfig[`${mode}RightTop`] || [],
      avatar: viewConfig[`${mode}Avatar`] || [],
      idField: viewConfig[`${mode}Id`] || [],
      title: viewConfig[`${mode}Title`] || [],
      footer: viewConfig[`${mode}FooterSection`] || [],
      buttonSection: viewConfig[`${mode}ButtonSection`] || [],

      listLeftButton: viewConfig[`${mode}LeftButton`] || [],
      groupSection: viewConfig[`${mode}GroupSection`] || [],
    };
  };

  const gridCfg = normalizeView(config.gridCardView, "grid");
  const listCfg = normalizeView(config.listCardView, "list");

  const buildCard = (item, cfg, mode) => {
    if (!cfg) return null;

    const leftTop =
      cfg.leftTop?.map(f => ({
        label: f.label,
        value: f.keyFromApi,
      })) || [];

    const avatar = cfg.avatar?.length ? item[cfg.avatar[0].keyFromApi] : null;

    const idField =
      cfg.idField?.map(f => ({
        label: f.label,
        value: item[f.keyFromApi],
      })) || [];

    const titleParts = cfg.title?.map(t => item[t.keyFromApi]) || [];
    const titleValue = titleParts.filter(Boolean).join(" ");

    const title = titleValue ? { label: "Name", value: titleValue } : null;

    const footer =
      cfg.footer?.map(f => ({
        label: f.label,
        value: item[f.keyFromApi],
      })) || [];

    const listLeftButton = cfg.listLeftButton || [];

    const groupSection =
      cfg.groupSection?.map(g => ({
        label: g.label,
        value: item[g.keyFromApi],
      })) || [];

    return {
      type: cfg.type,
      id: item.id,
      leftTop,
      avatar,
      idField,
      title,
      footer,
      buttonSection: cfg.buttonSection,
      rightTop: cfg.rightTop,

      listLeftButton,
      groupSection,
    };
  };

  return {
    gridView: gridCfg ? dataArray.map(item => buildCard(item, gridCfg, "grid")) : [],
    listView: listCfg ? dataArray.map(item => buildCard(item, listCfg, "list")) : [],
  };
};

export { stopPropagationHandler, transformDataWithConfig };
