import { navigate } from '../lib/router'
import { Icon } from '../shell/Icon'
import { moreRoutes } from '../shell/routes'
import { Screen } from './Screen'

export function More({ email, onSignOut }: { email?: string; onSignOut: () => void }) {
  return (
    <Screen title="More">
      <ul className="mt-5 divide-y divide-line overflow-hidden rounded-lg border border-line">
        {moreRoutes.map((r) => (
          <li key={r.path}>
            <button
              type="button"
              onClick={() => navigate(r.path)}
              className="flex min-h-[52px] w-full items-center gap-3 px-4 text-left text-[16px] font-semibold active:bg-sky-50"
            >
              <span className="text-sky-500">
                <Icon name={r.icon} className="size-5" />
              </span>
              <span className="flex-1">{r.title}</span>
              <span aria-hidden="true" className="text-ink-faint">›</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        {email && <p className="mb-2 text-sm text-ink-faint">Masuk sebagai {email}</p>}
        <button
          type="button"
          onClick={onSignOut}
          className="min-h-tap rounded-md border border-line px-4 text-[15px] font-semibold text-danger active:bg-mist"
        >
          Keluar
        </button>
      </div>
    </Screen>
  )
}
