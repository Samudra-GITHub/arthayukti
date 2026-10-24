import type { Plan, SampleDetail } from '../api/types'
import type { Copy } from '../i18n/copy'

/** The household's display name: a translated name for a known sample, else the plan's own name. */
export function householdName(text: Copy, sample: SampleDetail | null, plan: Plan | null): string {
  return (sample && text.households[sample.id]) || plan?.name || ''
}
