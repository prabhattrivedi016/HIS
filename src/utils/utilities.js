const stopPropagationHandler = (e) => {
  e.stopPropagation();
};

const transformDataWithConfig = (config, apiResponse) => {
  const dataArray = apiResponse?.data || [];

  return dataArray.map((item) => {
    // --- cardLeftTop (array → label+value pairs) ---
    const cardLeftTopValues = Array.isArray(config.cardLeftTop)
      ? config.cardLeftTop.map((leftTopConfig) => ({
          label: leftTopConfig.label,
          value: item[leftTopConfig.keyFromApi],
        }))
      : config.cardLeftTop
      ? item[config.cardLeftTop]
      : null;

    // --- cardAvatar (array or string key) ---
    const cardAvatarValue = Array.isArray(config.cardAvatar)
      ? config.cardAvatar.map((f) => item[f.keyFromApi])[0]
      : config.cardAvatar
      ? item[config.cardAvatar]
      : null;

    // --- cardId (array → label+value pairs) ---
    const cardIdValues = Array.isArray(config.cardId)
      ? config.cardId.map((idConfig) => ({
          label: idConfig.label,
          value: item[idConfig.keyFromApi],
        }))
      : [];

    // --- cardTitle (array → label+value pairs) ---
    const cardTitleValues = Array.isArray(config.cardTitle)
      ? config.cardTitle.map((titleConfig) => ({
          label: titleConfig.label,
          value: item[titleConfig.keyFromApi || titleConfig.keyFromAPI],
        }))
      : [];

    // --- cardFooterSection (array → label+value pairs) ---
    const cardFooterValues = Array.isArray(config.cardFooterSection)
      ? config.cardFooterSection.map((footer) => ({
          label: footer.label,
          value: item[footer.keyFromApi],
        }))
      : [];

    // --- buttonSection (array → shallow copy) ---
    const buttonValues = Array.isArray(config.buttonSection)
      ? config.buttonSection.map((btn) => ({ ...btn }))
      : [];

    // --- Return structured result ---
    return {
      type: config.type,
      cardId: cardIdValues?.length === 1 ? cardIdValues[0] : cardIdValues,
      cardLeftTop:
        Array.isArray(cardLeftTopValues) && cardLeftTopValues.length === 1
          ? cardLeftTopValues[0]
          : cardLeftTopValues,
      cardRightTop: config.cardRightTop || null,
      cardAvatar: cardAvatarValue,
      cardTitle:
        cardTitleValues?.length === 1 ? cardTitleValues[0] : cardTitleValues,
      cardFooterSection: cardFooterValues,
      buttonSection: buttonValues,
    };
  });
};

export { transformDataWithConfig, stopPropagationHandler };
