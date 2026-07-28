function computeNiceMax(maxValue) {
  if (maxValue <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(maxValue));
  const residual = maxValue / magnitude;

  let niceResidual;
  if (residual <= 1) niceResidual = 1;
  else if (residual <= 2) niceResidual = 2;
  else if (residual <= 5) niceResidual = 5;
  else niceResidual = 10;

  return niceResidual * magnitude;
}

export function buildTicks(maxValue, tickCount = 6) {
  const niceMax = computeNiceMax(maxValue);
  const step = niceMax / (tickCount - 1);
  return Array.from({ length: tickCount }, (_, i) => Math.round(step * i));
}
