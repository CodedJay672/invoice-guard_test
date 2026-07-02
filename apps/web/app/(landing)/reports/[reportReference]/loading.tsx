import { Skeleton } from "@workspace/ui/components/skeleton";

export default function Loading() {
  return (
    <div
      className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading report</span>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
