import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center gap-3 p-3">
          {/* Small square image skeleton */}
          <Skeleton className="w-20 h-20 rounded-lg shrink-0" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-5 w-24" />
          </div>

          {/* Arrow skeleton */}
          <Skeleton className="w-5 h-5 rounded shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ProductSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}
