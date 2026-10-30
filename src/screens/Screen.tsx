import type { ReactNode } from 'react'

export function Screen({ title, eyebrow, children }: { title: string; eyebrow?: string; children?: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-10 md:px-10 md:pt-10">
      {eyebrow && <p className="text-sm font-semibold text-ink-faint">{eyebrow}</p>}
      <h1 className="text-[28px] leading-tight font-bold md:text-[32px]">{title}</h1>
      {children}
    </div>
  )
}

export function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <Screen title={title}>
      <p className="mt-2 text-[15px] text-ink-soft">{note}</p>
    </Screen>
  )
}
