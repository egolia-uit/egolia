export function formatVnd(value: bigint | number | string | undefined | null) {
  if (value === undefined || value === null || value === '') {
    return 'Free';
  }

  const numericValue =
    typeof value === 'bigint'
      ? Number(value)
      : Number.parseInt(String(value), 10);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return 'Free';
  }

  return new Intl.NumberFormat('vi-VN', {
    currency: 'VND',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(numericValue);
}

export function formatDateTime(value: Date | string | undefined | null) {
  if (!value) {
    return 'N/A';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatDuration(seconds: bigint | number | undefined | null) {
  if (seconds === undefined || seconds === null) {
    return 'N/A';
  }

  const totalSeconds = typeof seconds === 'bigint' ? Number(seconds) : seconds;
  const minutes = Math.floor(totalSeconds / 60);
  const remainder = Math.floor(totalSeconds % 60);

  if (minutes <= 0) {
    return `${remainder}s`;
  }

  return `${minutes}m ${remainder.toString().padStart(2, '0')}s`;
}
