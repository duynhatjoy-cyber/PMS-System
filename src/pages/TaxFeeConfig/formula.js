function taxLabel(names) {
  return names.length ? names.join(" + ") : "Thuế/Phí";
}

export function buildBranchFormula(sourceLabel, variant, appliedNames) {
  const t = taxLabel(appliedNames);

  return variant === "before"
    ? `${sourceLabel} × (1 − ${t}) − Chiết khấu`
    : `(${sourceLabel} − Chiết khấu) × (1 − ${t})`;
}

export function buildTotalFormula(roomFormula, serviceFormula, totalNames) {
  const base = `${roomFormula} + ${serviceFormula}`;
  return totalNames.length ? `(${base}) × (1 − ${taxLabel(totalNames)})` : base;
}
