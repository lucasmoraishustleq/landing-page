import type { ComponentType } from 'react'
import type { SectionId } from '@/content/sections'
import { Hero } from './Hero'
import { Problem } from './Problem'
import { HowItWorks } from './HowItWorks'
import { Proof } from './Proof'
import { Faq } from './Faq'
import { Waitlist } from './Waitlist'
import { Fpp } from './Fpp'

/** Mapeia cada id do registro (content/sections.ts) para seu componente. */
export const sectionRegistry: Record<SectionId, ComponentType> = {
  hero: Hero,
  problem: Problem,
  howItWorks: HowItWorks,
  proof: Proof,
  faq: Faq,
  waitlist: Waitlist,
  fpp: Fpp,
}
