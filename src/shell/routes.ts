export type IconName =
  | 'today' | 'people' | 'team' | 'content' | 'more'
  | 'calendar' | 'trips' | 'money' | 'word' | 'launcher'

export type Route = {
  path: string
  title: string
  icon: IconName
  note: string
}

export const mainRoutes: Route[] = [
  { path: '/', title: 'Today', icon: 'today', note: '' },
  { path: '/people', title: 'People', icon: 'people', note: 'CRM pindah ke sini di phase 2.' },
  { path: '/team', title: 'Team', icon: 'team', note: 'Monitoring ST masuk di phase 3.' },
  { path: '/content', title: 'Content', icon: 'content', note: 'Pipeline konten masuk di phase 4.' },
]

export const moreRoutes: Route[] = [
  { path: '/calendar', title: 'Calendar', icon: 'calendar', note: 'Week view masuk di phase 1.' },
  { path: '/trips', title: 'Trips', icon: 'trips', note: 'Trip Board pindah ke sini di phase 6.' },
  { path: '/money', title: 'Money', icon: 'money', note: 'Monthly close PT AHU masuk di phase 5.' },
  { path: '/word', title: 'Word', icon: 'word', note: 'Bacaan harian masuk di phase 5.' },
  { path: '/launcher', title: 'Launcher', icon: 'launcher', note: 'Shortcut ke Nu Skin, CapCut, Canva, dll. di phase 5.' },
]

export const moreTab: Route = { path: '/more', title: 'More', icon: 'more', note: '' }

export function findRoute(path: string): Route {
  return [...mainRoutes, ...moreRoutes, moreTab].find((r) => r.path === path) ?? mainRoutes[0]
}

export function isMorePath(path: string) {
  return path === moreTab.path || moreRoutes.some((r) => r.path === path)
}
