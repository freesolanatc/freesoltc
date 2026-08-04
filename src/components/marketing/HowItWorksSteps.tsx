const steps = [
  {
    step: "1",
    title: "Connect your wallet",
    description: "Connect Phantom, Solflare, Backpack, Glow, or any Wallet Standard wallet. We never ask for unlimited approvals.",
  },
  {
    step: "2",
    title: "Configure your token",
    description: "Set a name, symbol, decimals, supply, description, image, and optional social links.",
  },
  {
    step: "3",
    title: "Choose your options",
    description: "Optionally revoke mint authority, revoke freeze authority, or claim a custom contract address &mdash; all free except the custom contract address.",
  },
  {
    step: "4",
    title: "Sign and launch",
    description: "Review exactly what you're signing, approve in your wallet, and your token is live on Solana.",
  },
];

export function HowItWorksSteps() {
  return (
    <section id="how-it-works" className="border-y border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-4 text-muted-foreground">
            From zero to a live SPL token in four transparent steps.
          </p>
        </div>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <li key={item.step} className="relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {item.step}
              </span>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
