import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-16 sm:px-6 lg:px-8">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
