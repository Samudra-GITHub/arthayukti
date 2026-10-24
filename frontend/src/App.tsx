import { Layout } from './components/Layout'
import { Card, CardTitle, PageHeading } from './components/Cards'
import { PrimaryButton } from './components/Controls'
import { hasGoals } from './lib/blank'
import { useRoute, type Route } from './lib/route'
import { ComparePage } from './pages/Compare'
import { FixesPage } from './pages/Fixes'
import { Home } from './pages/Home'
import { PlanPage } from './pages/Plan'
import { Dreams, MoneyIn, MoneyOut } from './pages/Setup'
import { WhatIfPage } from './pages/WhatIf'
import { TradeoffsPage } from './pages/Tradeoffs'
import { StoreProvider } from './state/store'
import { useStore } from './state/useStore'

const NEEDS_GOALS: Route[] = ['plan', 'what-if', 'fixes', 'compare', 'tradeoffs']

function Screens() {
  const [route, navigate] = useRoute()
  const { plan, text } = useStore()

  // Nothing is shown until the person starts their own plan or opens the labelled example.
  if (!plan) return <Home navigate={navigate} />

  if (!hasGoals(plan) && NEEDS_GOALS.includes(route)) {
    const copy = text.needGoals
    return (
      <Layout route={route} navigate={navigate} speak={`${copy.title} ${copy.body}`}>
        <PageHeading title={copy.title} />
        <Card>
          <CardTitle>{copy.body}</CardTitle>
          <PrimaryButton onClick={() => navigate('dreams')}>{copy.action}</PrimaryButton>
        </Card>
      </Layout>
    )
  }

  switch (route) {
    case 'money-in':
      return <MoneyIn navigate={navigate} />
    case 'money-out':
      return <MoneyOut navigate={navigate} />
    case 'dreams':
      return <Dreams navigate={navigate} />
    case 'plan':
      return <PlanPage navigate={navigate} />
    case 'what-if':
      return <WhatIfPage navigate={navigate} />
    case 'fixes':
      return <FixesPage navigate={navigate} />
    case 'compare':
      return <ComparePage navigate={navigate} />
    case 'tradeoffs':
      return <TradeoffsPage navigate={navigate} />
    default:
      return <Home navigate={navigate} />
  }
}

export default function App() {
  return (
    <StoreProvider>
      <Screens />
    </StoreProvider>
  )
}
