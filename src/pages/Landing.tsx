import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Lock } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      <SiteHeader />

      <main className="container max-w-6xl mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Secure Escrow on Stellar
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Create and manage trustless escrow with Soroban smart contracts.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/app"><Button size="lg">Launch App</Button></Link>
            <Link to="/about"><Button size="lg" variant="outline">Learn more</Button></Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          <div className="p-6 rounded-lg bg-gradient-to-br from-card to-secondary/30 border border-border/50 shadow-[var(--shadow-card)]">
            <Lock className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Trustless</h3>
            <p className="text-sm text-muted-foreground">Smart contract enforced logic</p>
          </div>
          <div className="p-6 rounded-lg bg-gradient-to-br from-card to-secondary/30 border border-border/50 shadow-[var(--shadow-card)]">
            <Shield className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Secure</h3>
            <p className="text-sm text-muted-foreground">Built on Soroban</p>
          </div>
          <div className="p-6 rounded-lg bg-gradient-to-br from-card to-secondary/30 border border-border/50 shadow-[var(--shadow-card)]">
            <Zap className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Fast</h3>
            <p className="text-sm text-muted-foreground">Quick finality on testnet</p>
          </div>
        </section>
      </main>

      <footer className="mt-16 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Remittance Dapp
      </footer>
    </div>
  );
}
