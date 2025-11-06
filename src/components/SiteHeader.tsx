import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="container max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-elevated)]">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <span className="font-semibold">Remittance Dapp</span>
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link to="/about" className="hover:underline">About</Link>
        <Link to="/contact" className="hover:underline">Contact</Link>
        <Link to="/signin" className="hover:underline">Sign in</Link>
        <Link to="/signup" className="hover:underline">Sign up</Link>
        <Link to="/app" className="ml-2 rounded-md px-3 py-1.5 text-white bg-primary">Launch App</Link>
      </nav>
    </header>
  );
}
