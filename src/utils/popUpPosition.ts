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

export type FixedPopupPosition = { top: number; left: number };

const getAnchoredFixedPopupPosition = (
  anchorRect: DOMRect,
  popupSize: { width: number; height: number },
  offset = 6,
  padding = 8
): FixedPopupPosition => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = anchorRect.left;
  if (left + popupSize.width > viewportWidth - padding) {
    left = anchorRect.right - popupSize.width;
  }
  left = Math.max(padding, Math.min(left, viewportWidth - popupSize.width - padding));

  let top = anchorRect.bottom + offset;
  if (top + popupSize.height > viewportHeight - padding) {
    top = anchorRect.top - popupSize.height - offset;
  }
  top = Math.max(padding, Math.min(top, viewportHeight - popupSize.height - padding));

  return { top, left };
};

export {
  getAnchoredFixedPopupPosition,
  getDownloadPopupPosition,
  getHideShowPopupPosition,
};
