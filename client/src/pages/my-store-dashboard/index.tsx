import { Insights } from './ui/Insights'
import { SummaryStats } from './ui/SummaryStats'
import { TopProducts } from './ui/TopProducts'

export const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-4 w-full">
      <div className="flex-1 rounded-base bg-white shadow-base border border-stroke overflow-hidden divide-y divide-stroke">
        <SummaryStats />
        <TopProducts />
        <Insights />
      </div>
    </div>
  )
}
