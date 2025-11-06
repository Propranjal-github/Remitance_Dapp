import { SiteHeader } from "@/components/SiteHeader";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      <SiteHeader />
      <main className="container max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold mb-4">About</h1>
        <p className="text-muted-foreground">
          Remittance Dapp provides secure, trustless escrow powered by Soroban smart contracts on the Stellar network.
          This project demonstrates a clean integration of on-chain escrow with a modern React frontend.
        </p>
      </main>
    </div>
  );
}
