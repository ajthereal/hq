import type { ReactNode } from 'react'
import { navigate } from '../lib/router'
import { Icon } from './Icon'
import { isMorePath, mainRoutes, moreRoutes, moreTab, type Route } from './routes'

type Props = { path: string; onSignOut: () => void; children: ReactNode }

export function Shell({ path, onSignOut, children }: Props) {
  return (
    <div className="min-h-dvh md:flex">
      <Sidebar path={path} onSignOut={onSignOut} />
      <main className="pt-safe pr-safe pl-safe flex-1 pb-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom))] md:pb-safe md:pl-0">
        {children}
      </main>
      <TabBar path={path} />
    </div>
  )
}

function TabBar({ path }: { path: string }) {
  const tabs = [...mainRoutes, moreTab]
  return (
    <nav
      aria-label="Menu utama"
      className="pb-safe pl-safe pr-safe fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas/95 backdrop-blur md:hidden"
    >
      <ul className="flex h-tabbar">
        {tabs.map((r) => {
          const active = r === moreTab ? isMorePath(path) : r.path === path
          return (
            <li key={r.path} className="flex-1">
              <button
                type="button"
                onClick={() => navigate(r.path)}
                aria-current={active ? 'page' : undefined}
                className={`flex h-full w-full min-h-tap flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
                  active ? 'text-sky-600' : 'text-ink-faint'
                }`}
              >
                <Icon name={r.icon} />
                {r.title}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function Sidebar({ path, onSignOut }: { path: string; onSignOut: () => void }) {
  return (
    <aside className="pt-safe pb-safe pl-safe sticky top-0 hidden h-dvh w-sidebar shrink-0 flex-col border-r border-line bg-mist md:flex">
      <div className="px-5 pt-6 pb-5 font-display text-xl font-bold">
        HQ<span className="text-ember-500">.</span>
      </div>
      <nav aria-label="Menu utama" className="flex-1 overflow-y-auto px-3">
        <SideGroup routes={mainRoutes} path={path} />
        <p className="px-3 pt-5 pb-1 text-xs font-semibold tracking-wide text-ink-faint uppercase">Lainnya</p>
        <SideGroup routes={moreRoutes} path={path} />
      </nav>
      <div className="px-3 pb-4">
        <button
          type="button"
          onClick={onSignOut}
          className="min-h-tap w-full rounded-md px-3 text-left text-sm font-semibold text-ink-soft hover:bg-sky-50"
        >
          Keluar
        </button>
      </div>
    </aside>
  )
}

function SideGroup({ routes, path }: { routes: Route[]; path: string }) {
  return (
    <ul className="space-y-0.5">
      {routes.map((r) => {
        const active = r.path === path
        return (
          <li key={r.path}>
            <button
              type="button"
              onClick={() => navigate(r.path)}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-tap w-full items-center gap-3 rounded-md px-3 text-[15px] font-semibold ${
                active ? 'bg-canvas text-sky-600 shadow-[0_1px_0_var(--color-line)]' : 'text-ink-soft hover:bg-sky-50'
              }`}
            >
              <Icon name={r.icon} className="size-5" />
              {r.title}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
