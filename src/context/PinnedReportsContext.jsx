import { createContext, useContext, useEffect, useState } from "react";

const PinnedReportsContext = createContext(null);
const STORAGE_KEY = "bellhop.pinnedReports";

function readInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function PinnedReportsProvider({ children }) {
  const [pinnedIds, setPinnedIds] = useState(readInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  function togglePin(reportId) {
    setPinnedIds((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    );
  }

  const value = { pinnedIds, isPinned: (id) => pinnedIds.includes(id), togglePin };

  return <PinnedReportsContext.Provider value={value}>{children}</PinnedReportsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook colocated by design
export function usePinnedReports() {
  const ctx = useContext(PinnedReportsContext);
  if (!ctx) throw new Error("usePinnedReports must be used within PinnedReportsProvider");
  return ctx;
}
