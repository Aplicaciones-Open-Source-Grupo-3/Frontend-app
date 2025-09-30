export function formatTime(value: string): string {
  return new Date(`1970-01-01T${value}Z`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}
