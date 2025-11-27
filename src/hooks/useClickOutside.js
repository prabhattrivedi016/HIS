import { useEffect } from "react";

export const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handler = event => {
      if (!ref.current) return;

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
};
