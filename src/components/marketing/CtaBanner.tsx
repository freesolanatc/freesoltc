import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card px-8 py-16 text-center sm:px-16">
        <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to launch your Solana token?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
          It&apos;s free. It only takes a few minutes, and you&apos;re always in control of what
          you sign.
        </p>
        <Button size="lg" className="relative mt-8" asChild>
          <Link href="/create-token">
            Create Your Token
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
