export const TZ = 'Asia/Jakarta'

export function formatTodayWIB(date = new Date()) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}
