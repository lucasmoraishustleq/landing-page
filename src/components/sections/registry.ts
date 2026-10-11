import type { ComponentType } from 'react'
import type { SectionId } from '@/content/sections'
import type { SectionProps } from '@/lib/tones'
import { Hero } from './Hero'
import { Problem } from './Problem'
import { HowItWorks } from './HowItWorks'
import { PlanMonth } from './PlanMonth'
import { Proof } from './Proof'
import { Analytics } from './Analytics'
import { Faq } from './Faq'
import { Founders } from './Founders'
import { Waitlist } from './Waitlist'
import { Fpp } from './Fpp'

/** Mapeia cada id do registro (content/sections.ts) para seu componente. */
export const sectionRegistry: Record<SectionId, ComponentType<SectionProps>> = {
  hero: Hero,
  problem: Problem,
  howItWorks: HowItWorks,
  planMonth: PlanMonth,
  proof: Proof,
  analytics: Analytics,
  faq: Faq,
  founders: Founders,
  waitlist: Waitlist,
  fpp: Fpp,
}
