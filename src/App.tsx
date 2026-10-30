import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Login } from './auth/Login'
import { isConfigured, supabase } from './lib/supabase'
import { navigate, usePath } from './lib/router'
import { Shell } from './shell/Shell'
import { findRoute } from './shell/routes'
import { More } from './screens/More'
import { Placeholder } from './screens/Screen'
import { Today } from './screens/Today'

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const path = usePath()

  useEffect(() => {
    if (!isConfigured) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!isConfigured) return <NotConfigured />
  if (session === undefined) return <div className="min-h-dvh bg-canvas" />
  if (!session) return <Login />

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const route = findRoute(path)
  let screen
  if (route.path === '/') screen = <Today />
  else if (route.path === '/more') screen = <More email={session.user.email} onSignOut={signOut} />
  else screen = <Placeholder title={route.title} note={route.note} />

  return (
    <Shell path={route.path} onSignOut={signOut}>
      {screen}
    </Shell>
  )
}

function NotConfigured() {
  return (
    <div className="pt-safe flex min-h-dvh items-center justify-center bg-canvas px-6">
      <div className="max-w-sm">
        <h1 className="text-xl font-semibold">Supabase belum disambung</h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di environment variables Cloudflare Pages, lalu deploy ulang.
        </p>
      </div>
    </div>
  )
}
