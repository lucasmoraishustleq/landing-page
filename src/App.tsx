import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { sections } from '@/content/sections'
import { sectionRegistry } from '@/components/sections/registry'
import { toneColor } from '@/lib/tones'

export default function App() {
  const visible = sections.filter((section) => section.visible)

  return (
    <>
      <Header />
      <main>
        {visible.map((section, index) => {
          const SectionComponent = sectionRegistry[section.id]
          const previous = visible[index - 1]
          const prevColor = previous ? toneColor[previous.tone] : undefined
          return (
            <SectionComponent
              key={section.id}
              tone={section.tone}
              prevColor={prevColor}
            />
          )
        })}
      </main>
      <Footer lastTone={visible[visible.length - 1]?.tone} />
    </>
  )
}
