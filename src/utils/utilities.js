const stopPropagationHandler = (e) => {
  e.stopPropagation();
};

const transformDataWithConfig = (config, apiResponse) => {
  const dataArray = apiResponse?.data || [];

  return dataArray.map((item) => {
    // cardLeftTop
    const cardLeftTopValue = config.cardLeftTop
      ? item[config.cardLeftTop]
      : null;

    // cardAvatar
    const cardAvatarValue = config.cardAvatar ? item[config.cardAvatar] : null;

    // cardId
    const cardIdValue = config.cardId ? item[config.cardId] : null;

    // cardTitle (array of keys)
    const cardTitleValues = config.cardTitle?.map(
      (titleConfig) => item[titleConfig.keyFromApi || titleConfig.keyFromAPI]
    );

    // cardFooterSection (label + extracted value)
    const cardFooterValues = config.cardFooterSection?.map((footer) => ({
      label: footer.label,
      value: item[footer.keyFromApi],
    }));

    // buttonSection (return UI action info with full row)
    const buttonValues = config.buttonSection?.map((btn) => ({
      ...btn,
    }));

    return {
      type: config.type,
      cardId: cardIdValue,
      cardLeftTop: cardLeftTopValue,
      cardRightTop: config.cardRightTop || null,
      cardAvatar: cardAvatarValue,
      cardTitle: cardTitleValues,
      cardFooterSection: cardFooterValues,
      buttonSection: buttonValues,
    };
  });
};

export { transformDataWithConfig, stopPropagationHandler };
