// download popup
const getDownloadPopupPosition = (
  buttonRef: React.RefObject<HTMLElement>,
  offsetTop: number = -12,
  offsetLeft: number = 12
) => {
  if (!buttonRef.current) return null;

  const rect = buttonRef.current.getBoundingClientRect();

  return {
    top: rect.bottom + window.scrollY + offsetTop,
    left: rect.left + window.scrollX + offsetLeft,
  };
};

// hide show popup
const getHideShowPopupPosition = (
  ref: React.RefObject<HTMLElement>,
  offsetTop: number = -10,
  offsetLeft: number = 10
) => {
  if (!ref.current) return null;

  const rect = ref.current.getBoundingClientRect();

  return {
    top: rect.bottom + window.scrollY + offsetTop,
    left: rect.left + window.scrollX + offsetLeft,
  };
};

export { getDownloadPopupPosition, getHideShowPopupPosition };
