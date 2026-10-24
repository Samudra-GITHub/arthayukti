import { useEffect, useState, type ReactNode } from 'react'
import { Bell, ChevronDown, ChevronsLeft, ChevronsRight, LogOut, Menu, X } from 'lucide-react'
import { api } from '../api/client'
import type { InsuranceReminderItem } from '../api/types'
import { NAV_AFTER_OUTLOOK, NAV_BEFORE_OUTLOOK, OUTLOOK_ICON, OUTLOOK_ITEMS, titleFor, type NavItem } from '../lib/nav'
import type { Route } from '../lib/route'
import type { Choice } from '../lib/scenarios'
import { useAuth } from '../state/useAuth'
import { useShellCopy } from '../state/useShellCopy'
import { useStore } from '../state/useStore'
import { LanguageControl, ListenButton } from './Controls'
import { Wordmark } from './Wordmark'

interface ShellProps {
  route: Route
  navigate: (route: Route) => void
  speak: string
  children: ReactNode
}

const COLLAPSE_KEY = 'arthayukti.sidebar'

function readCollapsed(): boolean {
  try {
    // The slim icon rail is the default; the person can widen it.
    return window.localStorage.getItem(COLLAPSE_KEY) !== 'open'
  } catch {
    return true
  }
}

/** Quick links in the pill bar at the top. */
const TOP_LINKS: { route: Route; key: 'dashboard' | 'goals' | 'assets' | 'insurance' | 'outlook' }[] = [
  { route: 'dashboard', key: 'dashboard' },
  { route: 'goals', key: 'goals' },
  { route: 'outlook-household', key: 'outlook' },
  { route: 'assets', key: 'assets' },
  { route: 'insurance', key: 'insurance' },
]

const circle = 'flex size-11 shrink-0 items-center justify-center rounded-full transition-colors motion-reduce:transition-none'

/** The signed-in workspace: a floating pill bar, a slim icon rail, and a glass content area. */
export function AppShell({ route, navigate: goTo, speak, children }: ShellProps) {
  const c = useShellCopy()
  const auth = useAuth()
  const { choice, setChoice, dirty, saving, saveError, savePlan, plan } = useStore()
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [drawer, setDrawer] = useState(false)
  const [bell, setBell] = useState(false)
  const [menu, setMenu] = useState(false)
  const [reminders, setReminders] = useState<InsuranceReminderItem[] | null>(null)
  const [outlookOpen, setOutlookOpen] = useState(route.startsWith('outlook-'))

  useEffect(() => {
    const controller = new AbortController()
    api
      .reminders(controller.signal)
      .then(setReminders)
      .catch(() => setReminders(null))
    return () => controller.abort()
  }, [route])

  // Moving to another page also closes the menus.
  const navigate = (next: Route) => {
    setDrawer(false)
    setBell(false)
    setMenu(false)
    goTo(next)
  }

  function toggleCollapse() {
    setCollapsed((current) => {
      try {
        window.localStorage.setItem(COLLAPSE_KEY, current ? 'open' : 'collapsed')
      } catch {
        // the choice still holds for this visit
      }
      return !current
    })
  }

  const open = reminders?.filter((item) => !item.is_acknowledged) ?? []
  const title = titleFor(route, c.nav)
  const first = (auth.user?.full_name?.trim().split(/\s+/)[0] || auth.user?.email.split('@')[0]) ?? ''
  const OutlookIcon = OUTLOOK_ICON
  const outlookActive = route.startsWith('outlook-')

  /** The navigation list, used by the icon rail (compact), the widened rail and the phone drawer. */
  const navList = (compact: boolean) => {
    const link = (item: NavItem) => {
      const active = route === item.route || item.covers.includes(route)
      const Icon = item.icon
      return (
        <li key={item.route}>
          <button
            type="button"
            onClick={() => navigate(item.route)}
            aria-current={active ? 'page' : undefined}
            title={compact ? c.nav[item.key] : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-full text-left text-[15px] transition-colors motion-reduce:transition-none ${
              compact ? 'size-11 justify-center' : 'w-full px-3'
            } ${active ? 'bg-brand font-semibold text-white shadow-[0_8px_18px_-8px_var(--color-brand)]' : 'text-ink hover:bg-white/80'}`}
          >
            <Icon size={20} aria-hidden="true" className="shrink-0" />
            <span className={compact ? 'sr-only' : 'truncate'}>{c.nav[item.key]}</span>
          </button>
        </li>
      )
    }
    return (
      <nav aria-label={c.nav.label}>
        <ul className={`flex flex-col gap-2 ${compact ? 'items-center' : ''}`}>
          {NAV_BEFORE_OUTLOOK.map(link)}
          <li className="relative">
            <button
              type="button"
              onClick={() => setOutlookOpen((value) => !value)}
              aria-expanded={outlookOpen}
              title={compact ? c.nav.outlook : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-full text-left text-[15px] ${compact ? 'size-11 justify-center' : 'w-full px-3'} ${
                outlookActive ? 'bg-brand font-semibold text-white' : 'text-ink hover:bg-white/80'
              }`}
            >
              <OutlookIcon size={20} aria-hidden="true" className="shrink-0" />
              <span className={compact ? 'sr-only' : 'flex-1 truncate'}>{c.nav.outlook}</span>
              {compact ? null : <ChevronDown size={16} aria-hidden="true" className={outlookOpen ? 'rotate-180' : ''} />}
            </button>
            {outlookOpen ? (
              <ul className={compact ? 'surface-solid absolute top-0 left-full z-40 ml-3 flex w-60 flex-col gap-1 rounded-3xl p-2' : 'mt-1 ml-6 flex flex-col gap-1 border-l border-line pl-3'}>
                {OUTLOOK_ITEMS.map((item) => (
                  <li key={item.route}>
                    <button
                      type="button"
                      onClick={() => navigate(item.route)}
                      aria-current={route === item.route ? 'page' : undefined}
                      className={`min-h-10 w-full rounded-full px-4 text-left text-[14px] ${route === item.route ? 'bg-brand font-semibold text-white' : 'text-ink hover:bg-sand'}`}
                    >
                      {c.nav.outlookItems[item.key]}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
          {NAV_AFTER_OUTLOOK.map(link)}
        </ul>
      </nav>
    )
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-3 focus:py-2 focus:text-cream">
        {c.header.skip}
      </a>
      <div className="mx-auto max-w-[1560px] rounded-[36px] border border-white/60 bg-white/25 p-2 shadow-[0_30px_80px_-40px_rgb(14_59_41/0.5)] sm:p-4">
        <header className="glass-bar sticky top-2 z-30 flex items-center gap-3 rounded-full px-3 py-2 sm:px-5">
          <button type="button" onClick={() => setDrawer(true)} aria-label={c.header.menu} className={`${circle} border border-line bg-white/70 lg:hidden`}>
            <Menu size={20} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => navigate('dashboard')} aria-label="ArthaYukti" className="mr-2">
            <Wordmark />
          </button>
          <nav aria-label={c.header.primary} className="mx-auto hidden items-center gap-1 rounded-full bg-white/60 p-1 lg:flex">
            {TOP_LINKS.map((item) => {
              const active = route === item.route || (item.key === 'outlook' && outlookActive) || (item.key === 'goals' && ['dreams', 'plan', 'what-if', 'fixes', 'compare', 'tradeoffs'].includes(route))
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => navigate(item.route)}
                  aria-current={active ? 'page' : undefined}
                  className={`min-h-10 rounded-full px-5 text-[15px] transition-colors motion-reduce:transition-none ${active ? 'bg-white font-semibold shadow-sm' : 'text-muted hover:text-ink'}`}
                >
                  {c.nav[item.key]}
                </button>
              )
            })}
          </nav>
          <span className="flex-1 lg:hidden" />

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setBell((value) => !value)
                setMenu(false)
              }}
              aria-label={`${c.header.notifications}${open.length ? ` (${open.length})` : ''}`}
              aria-expanded={bell}
              className={`${circle} relative bg-white/70 hover:bg-white`}
            >
              <Bell size={20} aria-hidden="true" />
              {open.length ? <span className="absolute top-2 right-2.5 size-2.5 rounded-full bg-late" aria-hidden="true" /> : null}
            </button>
            {bell ? (
              <div className="surface-solid absolute right-0 z-40 mt-3 w-[min(340px,calc(100vw-2rem))] rounded-3xl p-3">
                {open.length === 0 ? (
                  <p className="p-2 text-muted">{c.header.noNotifications}</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {open.slice(0, 5).map((item) => (
                      <li key={item.id} className="rounded-2xl bg-cream p-3 text-[14px]">
                        <p className="font-semibold">{item.due_date}</p>
                        <p>{item.message}</p>
                      </li>
                    ))}
                  </ul>
                )}
                <button type="button" onClick={() => navigate('alerts')} className="mt-2 w-full rounded-lg px-2 py-2 text-left text-[14px] font-semibold underline">
                  {c.nav.alerts}
                </button>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMenu((value) => !value)
                setBell(false)
              }}
              aria-label={c.header.account}
              aria-expanded={menu}
              className={`${circle} bg-brand font-semibold text-white`}
            >
              {(auth.user?.full_name || auth.user?.email || '?').slice(0, 1).toUpperCase()}
            </button>
            {menu ? (
              <div className="surface-solid absolute right-0 z-40 mt-3 w-[min(280px,calc(100vw-2rem))] rounded-3xl p-3">
                <p className="truncate px-2 font-semibold">{auth.user?.full_name || auth.user?.email}</p>
                <p className="truncate px-2 pb-2 text-[14px] text-muted">{auth.user?.email}</p>
                <button type="button" onClick={() => navigate('settings')} className="min-h-10 w-full rounded-lg px-2 text-left hover:bg-sand">
                  {c.header.settings}
                </button>
                <button type="button" onClick={() => void auth.logout()} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left hover:bg-sand">
                  <LogOut size={16} aria-hidden="true" />
                  {c.header.signOut}
                </button>
              </div>
            ) : null}
          </div>
        </header>

        {drawer ? <button type="button" aria-label={c.header.menu} onClick={() => setDrawer(false)} className="fixed inset-0 z-40 bg-night/40 backdrop-blur-sm lg:hidden" /> : null}
        <aside className={`glass-bar fixed inset-y-3 left-3 z-50 w-[280px] overflow-y-auto rounded-[28px] p-4 transition-transform motion-reduce:transition-none lg:hidden ${drawer ? 'translate-x-0' : '-translate-x-[120%]'}`}>
          <div className="mb-3 flex items-center justify-between">
            <Wordmark />
            <button type="button" onClick={() => setDrawer(false)} aria-label={c.header.menu} className={`${circle} bg-white/70`}>
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          {navList(false)}
        </aside>

        <div className="mt-4 flex items-start gap-4 sm:mt-5 sm:gap-5">
          <aside
            className={`glass-bar sticky top-24 hidden shrink-0 flex-col items-center gap-3 rounded-[32px] py-4 lg:flex ${collapsed ? 'w-[68px]' : 'w-[250px] items-stretch px-3'}`}
          >
            {navList(collapsed)}
            <button
              type="button"
              onClick={toggleCollapse}
              aria-label={collapsed ? c.header.expand : c.header.collapse}
              className={`${circle} mt-1 self-center border border-line bg-white/70 hover:bg-white`}
            >
              {collapsed ? <ChevronsRight size={18} aria-hidden="true" /> : <ChevronsLeft size={18} aria-hidden="true" />}
            </button>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-3 px-1">
              <p className="mr-auto min-w-0 font-display text-[28px] leading-tight font-bold tracking-tight sm:text-[34px]">
                {route === 'dashboard' ? (
                  <>
                    {c.header.welcome} <span className="text-muted">{first}</span>
                  </>
                ) : (
                  title
                )}
              </p>

              {plan ? (
                <label className="glass flex items-center gap-2 rounded-full py-1 pr-2 pl-4 text-[14px]">
                  <span className="text-muted">{c.header.scenario}</span>
                  <select
                    value={choice}
                    onChange={(event) => setChoice(event.target.value as Choice)}
                    className="min-h-9 rounded-full bg-white/70 px-3 text-[14px] font-semibold"
                  >
                    {(['normal', 'no_income', 'expense'] as const).map((value) => (
                      <option key={value} value={value}>
                        {c.header.scenarios[value]}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {auth.status === 'authenticated' && plan ? (
                <div className="glass flex items-center gap-2 rounded-full py-1 pr-1 pl-4 text-[14px]" role="status">
                  {saving ? (
                    <span className="text-muted">{c.header.saving}</span>
                  ) : saveError ? (
                    <span className="font-semibold text-late">{c.header.saveFailed}</span>
                  ) : dirty ? (
                    <span className="font-semibold">{c.header.unsaved}</span>
                  ) : (
                    <span className="text-muted">{c.header.saved}</span>
                  )}
                  {dirty ? (
                    <button type="button" disabled={saving} onClick={() => void savePlan()} className="min-h-9 rounded-full bg-brand px-4 font-semibold text-white disabled:opacity-60">
                      {c.header.save}
                    </button>
                  ) : null}
                </div>
              ) : null}

              <LanguageControl />
              <ListenButton speak={speak} />
            </div>

            <main id="main-content" tabIndex={-1} className="outline-none">
              <div className="flex flex-col gap-5">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
