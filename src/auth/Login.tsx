import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Step = 'email' | 'code'

function toMessage(error: { message: string; status?: number }) {
  const m = error.message.toLowerCase()
  if (error.status === 429 || m.includes('security purposes') || m.includes('rate limit'))
    return 'Terlalu sering minta kode. Tunggu sebentar, lalu coba lagi.'
  if (m.includes('expired') || m.includes('invalid')) return 'Kodenya salah atau sudah kadaluarsa. Minta kode baru aja.'
  if (m.includes('signups not allowed')) return 'Email ini belum terdaftar di HQ.'
  if (m.includes('fetch')) return 'Nggak bisa nyambung ke server. Cek sinyal dulu ya.'
  return error.message
}

export function Login() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)

  async function sendCode() {
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setBusy(false)
    if (error) {
      setError(toMessage(error))
      return false
    }
    return true
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault()
    if (await sendCode()) {
      setCode('')
      setStep('code')
    }
  }

  async function onCode(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: 'email' })
    setBusy(false)
    if (error) setError(toMessage(error))
  }

  async function onResend() {
    setResent(false)
    if (await sendCode()) setResent(true)
  }

  return (
    <div className="pt-safe pb-safe pl-safe pr-safe flex min-h-dvh flex-col bg-canvas">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-10">
        <div className="mb-10 font-display text-[34px] font-bold">
          HQ<span className="text-ember-500">.</span>
        </div>

        {step === 'email' ? (
          <form onSubmit={onEmail} noValidate>
            <h1 className="text-xl font-semibold">Masuk</h1>
            <p className="mt-1 text-[15px] text-ink-soft">Aku kirim kode 6 digit ke email kamu.</p>
            <label htmlFor="email" className="mt-6 block text-sm font-semibold text-ink-soft">
              Email
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 h-12 w-full rounded-md border border-line bg-canvas px-3.5 text-[17px] outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
            {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={busy || !email.includes('@')}
              className="mt-5 h-12 w-full rounded-md bg-sky-500 text-[16px] font-semibold text-white active:bg-sky-600 disabled:opacity-50"
            >
              {busy ? 'Mengirim…' : 'Kirim kode'}
            </button>
          </form>
        ) : (
          <form onSubmit={onCode} noValidate>
            <h1 className="text-xl font-semibold">Cek email kamu</h1>
            <p className="mt-1 text-[15px] text-ink-soft">
              Kode sudah dikirim ke <span className="font-semibold text-ink">{email.trim()}</span>.
            </p>
            <label htmlFor="code" className="mt-6 block text-sm font-semibold text-ink-soft">
              Kode 6 digit
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={10}
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="mt-1.5 h-14 w-full rounded-md border border-line bg-canvas px-3.5 text-center font-display text-[26px] tracking-[0.35em] outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
            <p className="mt-2 text-sm text-ink-faint">Atau ketuk link di email</p>
            {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
            {resent && !error && <p className="mt-3 text-sm text-sky-600">Kode baru sudah dikirim.</p>}
            <button
              type="submit"
              disabled={busy || code.length < 6}
              className="mt-5 h-12 w-full rounded-md bg-sky-500 text-[16px] font-semibold text-white active:bg-sky-600 disabled:opacity-50"
            >
              {busy ? 'Masuk…' : 'Masuk'}
            </button>
            <div className="mt-3 flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setError(null)
                  setResent(false)
                }}
                className="min-h-tap px-1 text-sm font-semibold text-ink-soft"
              >
                Ganti email
              </button>
              <button
                type="button"
                onClick={onResend}
                disabled={busy}
                className="min-h-tap px-1 text-sm font-semibold text-sky-600 disabled:opacity-50"
              >
                Kirim ulang kode
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
