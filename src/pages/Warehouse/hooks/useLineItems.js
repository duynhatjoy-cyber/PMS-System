import { useState } from "react";

export function lineAmount(line) {
  return (Number(line.qty) || 0) * (Number(line.price) || 0);
}

// Shared add/update/remove-row state for the material-line tables across the
// stock in/out/transfer/check modals. `makeLine(id)` builds a blank row —
// its shape differs per modal, so that stays with the caller.
export default function useLineItems(makeLine) {
  const [lines, setLines] = useState([makeLine(1)]);
  const [nextId, setNextId] = useState(2);

  function updateLine(id, patch) {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  function addLine() {
    setLines((prev) => [...prev, makeLine(nextId)]);
    setNextId((n) => n + 1);
  }

  function removeLine(id) {
    setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== id) : prev));
  }

  return { lines, updateLine, addLine, removeLine };
}
