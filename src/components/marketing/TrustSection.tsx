import { KeyRound, ShieldCheck, Eye } from "lucide-react";

const points = [
  {
    icon: KeyRound,
    title: "Your keys never leave your wallet",
    description: "We never ask for your seed phrase or private key. Every transaction is built transparently and signed by you, in your own wallet extension.",
  },
  {
    icon: Eye,
    title: "Fully transparent transactions",
    description: "Before you sign, you always see exactly what you're approving — token creation, an authority revocation, or the contract address fee — never bundled or hidden.",
  },
  {
    icon: ShieldCheck,
    title: "No custody, ever",
    description: "Custom contract addresses are generated entirely in your browser. The generated key is used once to build your transaction, then discarded — it is never sent to our servers.",
  },
];

export function TrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Built to be non-custodial
        </h2>
        <p className="mt-4 text-muted-foreground">
          Security isn&apos;t a feature we bolt on &mdash; it&apos;s the foundation of how this
          tool works.
        </p>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {points.map((point) => (
          <div key={point.title} className="text-center sm:text-left">
            <point.icon className="mx-auto h-6 w-6 text-primary sm:mx-0" aria-hidden />
            <h3 className="mt-4 font-semibold">{point.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{point.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
