/**
 * Converte horas em formato mais legível
 * @param hours - Número de horas
 * @returns String formatada (ex: "2d 4.5h" ou "18h")
 */
export function formatHours(hours: number): string {
  if (hours <= 24) {
    return `${hours.toFixed(1)}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours === 0) {
    return `${days}d`;
  }
  
  return `${days}d ${remainingHours.toFixed(1)}h`;
}

/**
 * Converte duração em milissegundos para formato legível
 * @param durationMs - Duração em milissegundos
 * @returns String formatada
 */
export function formatDuration(durationMs: number): string {
  const hours = durationMs / (1000 * 60 * 60);
  return formatHours(hours);
}

/**
 * Calcula e formata a diferença entre duas datas
 * @param startDate - Data de início
 * @param endDate - Data de fim (opcional, padrão é agora)
 * @returns String formatada da duração
 */
export function formatTimeDifference(startDate: Date | string, endDate?: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : new Date();
  
  const durationMs = end.getTime() - start.getTime();
  return formatDuration(durationMs);
}