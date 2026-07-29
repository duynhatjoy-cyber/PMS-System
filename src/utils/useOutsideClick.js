import { useEffect } from "react";

// Closes on any mousedown outside all given refs. Portal-rendered menus need
// both their trigger ref and their portaled menu ref passed in, since the
// menu lives outside the trigger's DOM subtree.
export default function useOutsideClick(active, refs, onOutside) {
  useEffect(() => {
    if (!active) return;
    function handleClickOutside(e) {
      if (refs.some((ref) => ref.current?.contains(e.target))) return;
      onOutside();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
