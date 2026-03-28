import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useSimpleAuth } from "../hooks/useSimpleAuth";

export default function LoginPage() {
  const { login } = useSimpleAuth();
  const { actor } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Connecting to server, please wait...");
      return;
    }
    setLoading(true);
    try {
      const result = await actor.login(username.trim(), password);
      // Candid optional ?T becomes [] | [T] in JS
      const profile = Array.isArray(result) ? result[0] : result;
      if (profile?.name && profile.role) {
        login({ name: profile.name, role: profile.role });
      } else {
        toast.error("Invalid username or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md">
        {/* Header */}
        <div
          className="text-white rounded-t-xl p-8 text-center"
          style={{ backgroundColor: "oklch(0.32 0.10 245)" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "oklch(0.73 0.14 78)" }}
          >
            <span className="text-2xl font-bold text-white">DB</span>
          </div>
          <h1 className="text-xl font-bold tracking-wide">
            Don Bosco College of Agriculture
          </h1>
          <p className="text-sm opacity-80 mt-1">
            Attendance Management System
          </p>
        </div>

        {/* Login card */}
        <div className="bg-card border border-border rounded-b-xl p-8 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Sign In
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your username and password to access the system.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="e.g. dbca"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                data-ocid="login.username_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                data-ocid="login.password_input"
              />
            </div>
            <Button
              type="submit"
              className="w-full font-semibold h-11"
              disabled={loading || !username || !password}
              data-ocid="login.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
                  in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Default admin: <strong>dbca</strong> / <strong>dbca123</strong>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()}. Built with{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
