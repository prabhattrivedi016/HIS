const stopPropagationHandler = (e) => {
  e.stopPropagation();
};

const transformDataWithConfig = (config, apiResponse) => {
  const dataArray = apiResponse?.data || [];

  return dataArray.map((item) => {
    // --- cardLeftTop (array → label+value pairs) ---
    const cardLeftTopValues = Array.isArray(config.cardLeftTop)
      ? config.cardLeftTop.map((left) => {
          let value = item[left.keyFromApi];
          // Convert 1/0 to Active/Inactive if field is 'isActive'
          if (left.keyFromApi === "isActive") {
            value = value === 1 ? "Active" : "Inactive";
          }
          return {
            label: left.label,
            value,
          };
        })
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

    // --- cardTitle (supports multiple fields like firstName + lastName) ---
    const cardTitleValues = Array.isArray(config.cardTitle)
      ? config.cardTitle.map((titleConfig) => ({
          label: titleConfig.label,
          value: item[titleConfig.keyFromApi || titleConfig.keyFromAPI],
        }))
      : [];

    // Join multiple name fields automatically into a single string (e.g. "Prabhat Trivedi")
    const combinedTitleValue =
      cardTitleValues.length > 1
        ? {
            label: "User Name",
            value: cardTitleValues
              .map((t) => t.value)
              .filter(Boolean)
              .join(" "),
          }
        : cardTitleValues[0] || null;

    // --- cardFooterSection (array → label+value pairs) ---
    const cardFooterValues = Array.isArray(config.cardFooterSection)
      ? config.cardFooterSection.map((footer) => ({
          label: footer.label,
          value: item[footer.keyFromApi],
        }))
      : [];

    // --- buttonSection
    const buttonValues = Array.isArray(config.buttonSection)
      ? config.buttonSection.map((btn) => ({ ...btn }))
      : [];

    // --- gridCardRightTop
    const gridCardRightTopValues = Array.isArray(config.gridCardRightTop)
      ? config.gridCardRightTop.map((f) => ({ ...f }))
      : config.gridCardRightTop
      ? [{ ...config.gridCardRightTop }]
      : null;

    // --- listCardRightTop (array or object) ---
    const listCardRightTopValues = Array.isArray(config.listCardRightTop)
      ? config.listCardRightTop.map((f) => ({ ...f }))
      : config.listCardRightTop
      ? [{ ...config.listCardRightTop }]
      : null;

    // --- Return structured result ---
    return {
      type: config.type,

      cardId:
        cardIdValues?.length === 1 ? cardIdValues[0] : cardIdValues || null,

      cardLeftTop:
        Array.isArray(cardLeftTopValues) && cardLeftTopValues.length === 1
          ? cardLeftTopValues[0]
          : cardLeftTopValues || null,

      gridCardRightTop: gridCardRightTopValues,
      listCardRightTop: listCardRightTopValues,

      cardAvatar: cardAvatarValue,

      cardTitle: combinedTitleValue,

      cardFooterSection: cardFooterValues,

      buttonSection: buttonValues,
    };
  });
};

export { transformDataWithConfig, stopPropagationHandler };
