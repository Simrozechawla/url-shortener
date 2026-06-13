'use client'

import { useState, FormEvent } from 'react'

type ShortenResult = {
  shortUrl: string
  slug: string
  originalUrl: string
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<ShortenResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)
    setCopied(false)

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-stamp/20 blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-stamp">
          Link Desk
        </p>
        <h1 className="mt-4 text-center font-mono text-4xl font-bold leading-tight sm:text-5xl">
          Turn long links into <span className="text-stamp">short tickets</span>
        </h1>
        <p className="mt-4 max-w-md text-center text-sm text-paper/60">
          Paste any URL and get back a short one that redirects straight to it.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 w-full">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-long-link.com/goes/here"
              className="flex-1 rounded-xl border border-line bg-ink-soft px-4 py-3 font-mono text-sm text-paper placeholder:text-paper/30 outline-none transition focus:border-stamp focus:ring-2 focus:ring-stamp/30"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-stamp px-6 py-3 font-mono text-sm font-bold uppercase tracking-wide text-ink transition hover:bg-stamp/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Printing…' : 'Shorten'}
            </button>
          </div>

          {error && (
            <p className="mt-3 font-mono text-sm text-stamp">
              Error: {error}
            </p>
          )}
        </form>

        {result && (
          <div className="ticket-enter mt-8 grid w-full grid-cols-[1fr_auto] rounded-2xl bg-paper text-ink shadow-2xl shadow-black/40">
            <div className="p-6">
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-ink/40">
                Your short link
              </p>
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all font-mono text-xl font-bold underline-offset-4 hover:underline sm:text-2xl"
              >
                {result.shortUrl.replace(/^https?:\/\//, '')}
              </a>
              <p className="mt-3 truncate text-xs text-ink/45">
                → {result.originalUrl}
              </p>
            </div>
            <div className="tear relative flex items-center px-5">
              <span className="tear-notch tear-notch--top" />
              <span className="tear-notch tear-notch--bottom" />
              <button
                onClick={handleCopy}
                className="font-mono text-xs font-bold uppercase tracking-wide text-ink/70 transition hover:text-stamp"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}