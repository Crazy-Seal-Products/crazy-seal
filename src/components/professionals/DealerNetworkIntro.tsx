import React from 'react'
import { ArrowRight, Phone, Sparkles } from 'lucide-react'
import { LinkButton } from '@/lib/design-system'
import { FormModalButton } from '@/components/forms/FormModalButton'
import { NETWORK_EDGES, NETWORK_HEIGHT, NETWORK_NODES, NETWORK_WIDTH } from './dealerNetwork'

/**
 * Animated intro for the dealer page: the gold-figure network from the
 * dealer map assembles itself — links reveal outward, dealers pop up in a
 * wave while a counter runs to 100+ — then an empty "Your spot" figure
 * invites the visitor in. Pure SVG + CSS (no client JS), so it plays on
 * first paint and stays light on phones. Keyframes live in globals.css
 * under "Dealer network intro".
 */

// Where the wave starts (roughly the middle of the map) and the open slot.
const ORIGIN = { x: 553, y: 340 }
const YOU_NODE = 42
// Figures sit above their node; leave headroom in the viewBox.
const TOP_PAD = 40
const VIEW_H = NETWORK_HEIGHT + TOP_PAD

// Spread-out links that carry the ambient "referral" pulses.
const PULSE_EDGES = [8, 37, 64, 95, 121, 150, 178, 205, 232, 260]
// Dealers that occasionally ping after the intro.
const PING_NODES = [6, 19, 33, 57, 71, 86, 99, 109]

const maxDist = Math.max(...NETWORK_NODES.map(([x, y]) => Math.hypot(x - ORIGIN.x, y - ORIGIN.y)))
const delayFor = (x: number, y: number) => 0.15 + (Math.hypot(x - ORIGIN.x, y - ORIGIN.y) / maxDist) * 1.25

const EDGE_PATH = NETWORK_EDGES.map(([a, b]) => {
  const [x1, y1] = NETWORK_NODES[a]
  const [x2, y2] = NETWORK_NODES[b]
  return `M${x1} ${y1 + TOP_PAD}L${x2} ${y2 + TOP_PAD}`
}).join('')

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`

/** The gold figure, standing on its node at (0, 0). */
function Person() {
  return (
    <>
      <circle cx="0" cy="-27" r="5.4" />
      <path d="M-6.4 -3.5V-12.8Q-6.4 -20.4 0 -20.4Q6.4 -20.4 6.4 -12.8V-3.5Z" />
    </>
  )
}

export function DealerNetworkIntro() {
  const [youX, youY] = NETWORK_NODES[YOU_NODE]

  return (
    <div className="relative section-bleed bg-primary overflow-hidden">
      {/* Deep backdrop glows */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-secondary/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 items-center gap-6 px-5 py-8 sm:px-6 sm:py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:px-12 lg:py-14">
        {/* ── Copy ── */}
        <div className="order-2 text-center lg:order-1 lg:text-left">

          <div className="dn-copy flex items-end justify-center gap-3 lg:justify-start" style={{ '--dn-delay': '0.15s' } as React.CSSProperties}>
            <span className="sr-only">Join 100+ dealers</span>
            <span aria-hidden="true" className="text-sm font-bold uppercase tracking-[0.2em] text-white/60 pb-3">Join</span>
            <span aria-hidden="true" className="flex items-start font-[family-name:var(--font-display)] text-7xl font-extrabold leading-none tracking-tight sm:text-8xl">
              <span className="dn-count inline-block min-w-[3ch] text-right text-shimmer-highlight tabular-nums" />
              <span className="dn-plus text-highlight">+</span>
            </span>
            <span aria-hidden="true" className="pb-3 text-left text-sm font-bold uppercase leading-tight tracking-[0.14em] text-white/60">
              dealers
              <br />
              nationwide
            </span>
          </div>

          <h1 className="dn-copy mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight text-white text-balance sm:text-4xl lg:text-5xl" style={{ '--dn-delay': '1.25s' } as React.CSSProperties}>
            Join the Crazy Seal <span className="text-shimmer-highlight">Dealer Network</span>
          </h1>
          <p className="dn-copy mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg lg:mx-0" style={{ '--dn-delay': '1.4s' } as React.CSSProperties}>
            No franchise fees. No inventory. Customers ask for a pro-installed Crazy Seal roof every day — sell it,
            install it, keep the profit.
          </p>
          <div className="dn-copy mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start" style={{ '--dn-delay': '1.55s' } as React.CSSProperties}>
            <FormModalButton form="professional" sourcePage="professionals" variant="accent" size="lg">
              Become a Dealer
              <ArrowRight className="h-4 w-4" />
            </FormModalButton>
            <LinkButton href="/portal/demo/summit/" variant="white" size="lg">
              <Sparkles className="h-4 w-4" />
              Tour the Pro Portal
            </LinkButton>
          </div>
          <div className="dn-copy mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm lg:justify-start" style={{ '--dn-delay': '1.7s' } as React.CSSProperties}>
            <a href="tel:8009630131" className="flex items-center gap-2 font-semibold text-white/80 transition-colors hover:text-white">
              <Phone className="h-4 w-4 text-accent-light" />
              (800) 963-0131
            </a>
            <a href="/pro" className="text-white/60 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white">
              Already a Pro? Sign in to the Pro Hub
            </a>
          </div>
        </div>

        {/* ── Network ── */}
        <div className="dn-stage relative order-1 lg:order-2">
          <svg
            viewBox={`0 0 ${NETWORK_WIDTH} ${VIEW_H}`}
            className="block h-auto w-full overflow-visible"
            role="img"
            aria-label="Map of Crazy Seal dealers connected across the United States"
          >
            <defs>
              <linearGradient id="dn-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFF1A6" />
                <stop offset="45%" stopColor="#F9D21C" />
                <stop offset="100%" stopColor="#E8A100" />
              </linearGradient>
              <radialGradient id="dn-glow">
                <stop offset="0%" stopColor="#F9EA1C" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#F9EA1C" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="dn-pulse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#B7F36B" />
                <stop offset="100%" stopColor="#6DC015" stopOpacity="0" />
              </radialGradient>
              <mask id="dn-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width={NETWORK_WIDTH} height={VIEW_H}>
                <circle className="dn-reveal" cx={ORIGIN.x} cy={ORIGIN.y + TOP_PAD} r="760" fill="#fff" />
              </mask>
            </defs>

            {/* Opening ripples */}
            <circle className="dn-ripple" cx={ORIGIN.x} cy={ORIGIN.y + TOP_PAD} r="620" />
            <circle className="dn-ripple" style={{ animationDelay: '0.35s' }} cx={ORIGIN.x} cy={ORIGIN.y + TOP_PAD} r="620" />

            {/* Links: a soft glow layer + the dashed line, revealed outward */}
            <g mask="url(#dn-reveal)">
              <path d={EDGE_PATH} fill="none" stroke="rgb(109 192 21 / 0.18)" strokeWidth="5" strokeLinecap="round" />
              <path d={EDGE_PATH} fill="none" stroke="rgb(255 255 255 / 0.42)" strokeWidth="1.6" strokeDasharray="4 5" strokeLinecap="round" />
            </g>

            {/* Referral pulses travelling along the network (after the intro) */}
            <g className="dn-pulses">
              {PULSE_EDGES.map((e, i) => {
                const [a, b] = NETWORK_EDGES[e % NETWORK_EDGES.length]
                const [x1, y1] = NETWORK_NODES[i % 2 ? a : b]
                const [x2, y2] = NETWORK_NODES[i % 2 ? b : a]
                const begin = `${2.4 + i * 0.45}s`
                const dur = `${1.6 + (i % 4) * 0.35}s`
                return (
                  <circle key={e} r="7" fill="url(#dn-pulse)" opacity="0">
                    <animateMotion
                      dur={dur}
                      begin={begin}
                      repeatCount="indefinite"
                      path={`M${x1} ${y1 + TOP_PAD}L${x2} ${y2 + TOP_PAD}`}
                    />
                    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur={dur} begin={begin} repeatCount="indefinite" />
                  </circle>
                )
              })}
            </g>

            {/* Dealers */}
            {NETWORK_NODES.map(([x, y], i) => {
              if (i === YOU_NODE) return null
              const delay = delayFor(x, y)
              const ping = PING_NODES.indexOf(i)
              return (
                <g
                  key={i}
                  transform={`translate(${x} ${y + TOP_PAD})`}
                  style={{ '--dn-delay': `${delay.toFixed(3)}s` } as React.CSSProperties}
                >
                  <ellipse className="dn-base" rx="9" ry="4.6" />
                  <circle className="dn-flash" r="16" />
                  {ping >= 0 && (
                    <circle className="dn-ping" r="14" style={{ animationDelay: `${3.2 + ping * 0.9}s` }} />
                  )}
                  <g className="dn-person" fill="url(#dn-gold)">
                    <Person />
                  </g>
                </g>
              )
            })}

            {/* The open slot */}
            <g transform={`translate(${youX} ${youY + TOP_PAD})`} className="dn-you">
              <circle r="46" fill="url(#dn-glow)" className="dn-you-glow" />
              <circle r="15" className="dn-you-ring" />
              <ellipse rx="9" ry="4.6" fill="rgb(249 234 28 / 0.35)" />
              <g fill="none" stroke="#F9EA1C" strokeWidth="1.8" strokeDasharray="3 2.4">
                <Person />
              </g>
            </g>
          </svg>

          {/* "Your spot" call to action pinned to the open slot */}
          <div
            className="dn-you-cta absolute"
            style={{ left: pct(youX, NETWORK_WIDTH), top: pct(youY + TOP_PAD - 40, VIEW_H) }}
          >
            <FormModalButton
              form="professional"
              sourcePage="professionals-network-map"
              variant="white"
              size="sm"
              className="whitespace-nowrap bg-highlight px-2.5 py-1 text-[11px] font-extrabold text-primary shadow-glow-highlight hover:bg-highlight-light sm:px-3 sm:py-1.5 sm:text-xs"
            >
              Your spot
              <ArrowRight className="h-3.5 w-3.5" />
            </FormModalButton>
          </div>
        </div>
      </div>
    </div>
  )
}
