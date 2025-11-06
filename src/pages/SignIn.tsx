import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/SiteHeader";
import { toast } from "sonner";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFirebaseSignIn(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      // Dynamically import Firebase only when needed
      const firebaseMod = await import("@/lib/firebase").catch(() => null as any);
      const authMod = await import("firebase/auth").catch(() => null as any);
      if (!firebaseMod || !authMod) {
        toast.error("Firebase not installed/configured. Run 'npm i firebase' and set .env.");
        return;
      }
      await authMod.signInWithEmailAndPassword(firebaseMod.auth, email, password);
      toast.success("Signed in");
      navigate("/app");
    } catch (err: any) {
      toast.error(err?.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    try {
      setLoading(true);
      const firebaseMod = await import("@/lib/firebase").catch(() => null as any);
      const authMod = await import("firebase/auth").catch(() => null as any);
      if (!firebaseMod || !authMod) {
        toast.error("Firebase not installed/configured. Run 'npm i firebase' and set .env.");
        return;
      }
      const provider = new authMod.GoogleAuthProvider();
      try {
        await authMod.signInWithPopup(firebaseMod.auth, provider);
      } catch (popupErr: any) {
        // Fallback to redirect if popup is blocked
        if (popupErr?.code === "auth/popup-blocked" || popupErr?.code === "auth/popup-closed-by-user") {
          await authMod.signInWithRedirect(firebaseMod.auth, provider);
          return;
        }
        if (popupErr?.code === "auth/operation-not-allowed") {
          toast.error("Enable Google provider in Firebase Console (Authentication → Sign-in method). ");
          return;
        }
        throw popupErr;
      }
      toast.success("Signed in with Google");
      navigate("/app");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      <SiteHeader />
      <main className="container max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold mb-6">Sign in</h1>
        <form onSubmit={handleFirebaseSignIn} className="space-y-4">
          <div>
            <label className="text-sm mb-1 block">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm mb-1 block">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="my-6 text-center text-sm text-muted-foreground">or</div>

        <Button variant="outline" className="w-full justify-center gap-2" onClick={handleGoogleAuth}>
          Continue with Google
          <img src="/google.png" alt="Google" className="h-4 w-4" loading="lazy" />
        </Button>

        <p className="mt-6 text-sm text-muted-foreground text-center">
          Don&apos;t have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </main>
    </div>
  );
}
