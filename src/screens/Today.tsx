import { formatTodayWIB } from '../lib/date'
import { Screen } from './Screen'

export function Today() {
  return (
    <Screen title="Today" eyebrow={formatTodayWIB()}>
      <p className="mt-2 text-[15px] text-ink-soft">Timeline, Top 3 dan semua yang overdue masuk di phase 1.</p>
    </Screen>
  )
}
