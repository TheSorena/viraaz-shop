export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} aria-hidden="true" />
}

export function BookCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[5/7] rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="mt-2 flex justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
    </div>
  )
}

export function ArticleCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
