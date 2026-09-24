import { Skeleton } from '#/shared/ui/Skeleton'

export const ProductCardSkeleton = () => {
  return (
    <div className="w-full h-full bg-white rounded-xl shadow-base overflow-hidden flex flex-col">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <div className="flex flex-col gap-2 p-2">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-3 w-24 rounded-full" />
      </div>
    </div>
  )
}
