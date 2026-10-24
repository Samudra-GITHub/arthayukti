/** The ArthaYukti mark: a lantern glow with ripples spreading from it, and the wordmark. */
export function Wordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const big = size === 'lg'
  return (
    <span className="flex items-center gap-2">
      <RippleMark className={big ? 'size-10' : 'size-7'} />
      <span
        className={`font-display leading-none font-semibold tracking-tight text-ink ${
          big ? 'text-[34px]' : 'text-[24px]'
        }`}
      >
        ArthaYukti
      </span>
    </span>
  )
}

export function RippleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none">
      <circle cx="16" cy="16" r="4.5" fill="var(--color-glow)" />
      <circle cx="16" cy="16" r="9" stroke="var(--color-glow)" strokeOpacity="0.65" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="14" stroke="var(--color-glow)" strokeOpacity="0.3" strokeWidth="1.6" />
    </svg>
  )
}
