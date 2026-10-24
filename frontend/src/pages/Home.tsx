import { Amphora, ShoppingBasket, Users, Wallet } from 'lucide-react'
import illustration from '../assets/family-illustration.jpg'
import { PageHeading } from '../components/Cards'
import { PrimaryButton } from '../components/Controls'
import { Layout } from '../components/Layout'
import type { PageProps } from './types'
import { useStore } from '../state/useStore'

export function Home({ navigate }: PageProps) {
  const { text } = useStore()
  const { home } = text

  const previews = [
    { icon: Wallet, label: home.stepIn },
    { icon: ShoppingBasket, label: home.stepOut },
    { icon: Amphora, label: home.stepDreams },
  ]

  return (
    <Layout route="home" navigate={navigate} speak={`${home.title} ${home.heroTitle} ${home.heroBody}`}>
      <PageHeading title={home.title} subtitle={home.subtitle} />
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <img
          src={illustration}
          alt=""
          className="h-[260px] w-full rounded-3xl object-cover sm:h-[360px] lg:h-[440px]"
        />
        <div className="flex flex-col gap-6">
          <p className="flex items-center gap-2 text-[20px]">
            <Users size={24} aria-hidden="true" />
            {home.forFamily}
          </p>
          <h2 className="font-display text-[34px] leading-[1.15] font-semibold sm:text-[40px] lg:text-[48px]">
            {home.heroTitle}
          </h2>
          <p>{home.heroBody}</p>
          <PrimaryButton onClick={() => navigate('money-in')}>{home.start}</PrimaryButton>
          <p className="text-muted">{home.steps}</p>
        </div>
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        {previews.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex min-h-[88px] items-start gap-4 rounded-3xl bg-sand p-6 font-semibold"
          >
            <Icon size={24} aria-hidden="true" />
            <span className="flex-1">{label}</span>
          </li>
        ))}
      </ul>
    </Layout>
  )
}
