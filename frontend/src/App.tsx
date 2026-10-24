import { Layout } from './components/Layout'
import { ErrorNote, LoadingNote } from './components/Status'
import { useRoute } from './lib/route'
import { ComparePage } from './pages/Compare'
import { FixesPage } from './pages/Fixes'
import { Home } from './pages/Home'
import { PlanPage } from './pages/Plan'
import { Dreams, MoneyIn, MoneyOut } from './pages/Setup'
import { WhatIfPage } from './pages/WhatIf'
import { StoreProvider } from './state/store'
import { useStore } from './state/useStore'

function Screens() {
  const [route, navigate] = useRoute()
  const { plan, sampleError, text } = useStore()

  if (!plan) {
    return (
      <Layout route={route} navigate={navigate} speak={text.common.loading}>
        {sampleError ? <ErrorNote /> : <LoadingNote />}
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
