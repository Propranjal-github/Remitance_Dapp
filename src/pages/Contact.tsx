import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      <SiteHeader />
      <main className="container max-w-3xl mx-auto px-4 py-12 space-y-4">
        <h1 className="text-3xl font-semibold">Contact</h1>
        <p className="text-muted-foreground">
          Have questions or feedback? Reach out and we’ll get back to you.
        </p>
        <div className="rounded-lg border border-border/50 bg-card p-6 shadow-[var(--shadow-card)]">
          <p>Email: <a className="text-primary hover:underline" href="mailto:support@example.com">support@example.com</a></p>
          <div className="mt-4">
            <Button disabled>Send message (coming soon)</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
