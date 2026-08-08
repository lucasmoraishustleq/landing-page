import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { sections } from '@/content/sections'
import { sectionRegistry } from '@/components/sections/registry'

export default function App() {
  return (
    <>
      <Header />
      <main>
        {sections
          .filter((section) => section.visible)
          .map((section) => {
            const SectionComponent = sectionRegistry[section.id]
            return <SectionComponent key={section.id} />
          })}
      </main>
      <Footer />
    </>
  )
}
