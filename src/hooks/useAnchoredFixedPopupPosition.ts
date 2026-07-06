import { useLayoutEffect, useState } from "react";
import { FixedPopupPosition, getAnchoredFixedPopupPosition } from "../utils/popUpPosition";

const useAnchoredFixedPopupPosition = (
  anchorRect: DOMRect | null,
  popupRef: React.RefObject<HTMLDivElement | null>,
  remeasureKey?: unknown
) => {
  const [position, setPosition] = useState<FixedPopupPosition | null>(null);

  useLayoutEffect(() => {
    if (!anchorRect || !popupRef.current) {
      setPosition(null);
      return;
    }

    const { width, height } = popupRef.current.getBoundingClientRect();
    setPosition(getAnchoredFixedPopupPosition(anchorRect, { width, height }));
  }, [anchorRect, popupRef, remeasureKey]);

  return position;
};

export default useAnchoredFixedPopupPosition;
