import { useLayoutEffect, useRef } from "react";

const VIEWPORT_MARGIN = 8;
const GAP = 6;

function useMenuFlip(open, align = "right") {
  const rootRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    const rootEl = rootRef.current;
    const menuEl = menuRef.current;
    if (!open || !rootEl || !menuEl) return;

    function reposition() {
      const rootRect = rootEl.getBoundingClientRect();
      const menuRect = menuEl.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rootRect.bottom - VIEWPORT_MARGIN;
      const spaceAbove = rootRect.top - VIEWPORT_MARGIN;

      const fitsBelow = menuRect.height <= spaceBelow;
      const fitsAbove = menuRect.height <= spaceAbove;

      let openUp = !fitsBelow && fitsAbove;
      menuEl.style.maxHeight = "";
      menuEl.style.overflowY = "";

      if (!fitsBelow && !fitsAbove) {
        // Neither side has room for the full menu: pick the larger side and
        // let the menu scroll internally so every item stays reachable.
        openUp = spaceAbove > spaceBelow;
        menuEl.style.maxHeight = `${Math.max(spaceAbove, spaceBelow, 120)}px`;
        menuEl.style.overflowY = "auto";
      }

      menuEl.style.left = align === "left" ? `${rootRect.left}px` : `${rootRect.right - menuRect.width}px`;
      if (openUp) {
        menuEl.style.top = "";
        menuEl.style.bottom = `${window.innerHeight - rootRect.top + GAP}px`;
      } else {
        menuEl.style.bottom = "";
        menuEl.style.top = `${rootRect.bottom + GAP}px`;
      }
    }

    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, align]);

  return { rootRef, menuRef };
}

export default useMenuFlip;
