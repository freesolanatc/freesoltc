import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/create-token">Create a token</Link>
        </Button>
      </div>
    </div>
  );
}
