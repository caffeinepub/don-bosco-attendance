import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md">
        {/* Header */}
        <div
          className="bg-navy text-white rounded-t-xl p-8 text-center"
          style={{ backgroundColor: "oklch(0.32 0.10 245)" }}
        >
          <div
            className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4"
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
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in with your Internet Identity to access the system.
          </p>

          <Button
            className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold h-11"
            onClick={() => login()}
            disabled={isLoggingIn}
            data-ocid="login.primary_button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign In with Internet Identity"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Secure, decentralized authentication powered by the Internet
            Computer.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}. Built with love using{" "}
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
