export function calculateCapacity({
  availableMinutes = 480,
  fixedMinutes = 0,
  energy = 0.7,
  recoveryReserve = 0.15,
  interruptionReserve = 0.15,
} = {}) {
  const raw = Math.max(0, Number(availableMinutes) - Number(fixedMinutes));
  const energyFactor = Math.min(1, Math.max(0.25, Number(energy) || 0.7));
  const reserve = Math.min(0.6, Math.max(0, recoveryReserve + interruptionReserve));
  const usableMinutes = Math.max(0, Math.round(raw * energyFactor * (1 - reserve)));

  return {
    availableMinutes: Number(availableMinutes),
    fixedMinutes: Number(fixedMinutes),
    rawMinutes: raw,
    usableMinutes,
    energyFactor,
    reserve,
    overloadThreshold: Math.round(usableMinutes * 1.1),
  };
}
