/**
 * Convierte hora (puede ser segundos number o string "HH:MM:SS") a "HH:MM"
 */
export function formatHora(hora) {
  if (hora == null) return "";
  if (typeof hora === "number") {
    const h = Math.floor(hora / 3600);
    const m = Math.floor((hora % 3600) / 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  return String(hora).slice(0, 5);
}
