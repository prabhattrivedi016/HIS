import { RefObject, useEffect } from "react";

export function useClickOutside<T extends HTMLElement>(ref: RefObject<T>, callback: () => void) {
  useEffect(() => {
    const handler = (event: MouseEvent | TouchEvent) => {
      if (!ref.current) return;

      // Type-safe target check
      if (!(event.target instanceof Node)) return;

      if (!ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, callback]);
}
