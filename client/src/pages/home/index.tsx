import { Services } from './ui/Services'
import { Banner } from './ui/Banner'
import { Collections } from './ui/Collections'
import { CategoriesSidebar } from '@/widgets/CategoriesSidebar'

export const HomePage = () => {
  return (
    <div className="flex gap-4">
      <CategoriesSidebar />
      <div className="flex-1 flex flex-col gap-6">
        <Banner />
        <Services />
        <Collections />
      </div>
    </div>
  )
}
