import Link from 'next/link'

const LOGO = 'https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-1000x800-400x320.png'

/**
 * The sign-in pages' frame (login, sign-up, forgot and reset password), in the
 * contractor portal's design: Pro Hub became the portal, and these pages are
 * how people get into it.
 */
export function ProAuthLayout({
  children,
  subtitle,
}: {
  children: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#00152b] px-4 py-10 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-secondary/20 blur-[120px]" />
        <div className="absolute -bottom-48 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-[120px]" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" aria-label="Crazy Seal home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Crazy Seal" className="h-16 w-auto" />
          </Link>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.28em] text-highlight">Crazy Seal</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Pro Portal</h1>
          <p className="mt-2 text-sm text-blue-100/60">{subtitle || 'Projects, quotes, orders, warranties and training in one place.'}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  )
}

export const authInputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent/60 focus:ring-4 focus:ring-accent/15'

export const authPrimaryButtonClass =
  'w-full rounded-full bg-gradient-to-b from-accent-light to-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50'
