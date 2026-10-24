import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Volume2, type LucideIcon } from 'lucide-react'
import { useStore } from '../state/useStore'

export function LanguageControl() {
  const { language, setLanguage } = useStore()
  const option = (value: 'en' | 'hi', label: string) => (
    <button
      type="button"
      onClick={() => setLanguage(value)}
      aria-pressed={language === value}
      lang={value}
      className={`min-h-14 rounded-xl px-3 font-semibold ${
        language === value ? 'bg-paper' : 'bg-sand'
      }`}
    >
      {label}
    </button>
  )
  return (
    <div className="flex min-h-16 items-start rounded-2xl bg-sand p-1" role="group">
      {option('en', 'English')}
      {option('hi', 'हिन्दी')}
    </div>
  )
}

export function ListenButton({ speak }: { speak: string }) {
  const { text } = useStore()
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null

  const onClick = () => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(speak)
    utterance.lang = text.speechLang
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-16 items-center gap-2 rounded-2xl border border-line px-3"
    >
      <Volume2 size={24} aria-hidden="true" />
      <span>{text.listen}</span>
    </button>
  )
}

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  icon?: 'forward' | 'back' | LucideIcon
  className?: string
}

function ButtonIcon({ icon, accent }: { icon: ButtonProps['icon']; accent: boolean }) {
  if (!icon) return null
  const Icon = icon === 'forward' ? ArrowRight : icon === 'back' ? ArrowLeft : icon
  return <Icon size={24} aria-hidden="true" className={accent ? 'text-turmeric' : ''} />
}

export function PrimaryButton({ children, onClick, disabled, icon = 'forward', className }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-16 w-full items-center justify-center gap-4 rounded-2xl bg-ink px-6 py-4 text-[20px] font-semibold text-cream disabled:opacity-60 ${className ?? ''}`}
    >
      <span className="flex-1 text-center">{children}</span>
      <ButtonIcon icon={icon} accent />
    </button>
  )
}

export function SecondaryButton({ children, onClick, disabled, icon = 'back', className }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-16 w-full items-center justify-center gap-4 rounded-2xl bg-paper px-6 py-4 text-[20px] font-semibold text-ink disabled:opacity-60 ${className ?? ''}`}
    >
      <span className="flex-1 text-center">{children}</span>
      <ButtonIcon icon={icon} accent={false} />
    </button>
  )
}
