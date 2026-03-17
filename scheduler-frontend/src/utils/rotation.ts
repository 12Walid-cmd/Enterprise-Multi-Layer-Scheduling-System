export function generateRotationCode(name: string, rotationType: string, cadence: string) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  const normalizedName = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  const normalizedType = rotationType.trim().toUpperCase();
  const normalizedCadence = cadence.trim().toUpperCase();

  return `${normalizedName}_${normalizedType}_${normalizedCadence}_${dateStr}`;
}