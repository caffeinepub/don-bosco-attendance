import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface Props {
  onComplete: (profile: { name: string; role: string }) => void;
}

export default function SetupPage({ onComplete }: Props) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [role, setRole] = useState("teacher");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !name.trim()) return;
    setLoading(true);
    try {
      await actor.saveCallerUserProfile({ name: name.trim(), role });
      toast.success("Profile saved!");
      onComplete({ name: name.trim(), role });
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl shadow-card p-8">
          <div className="text-center mb-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: "oklch(0.32 0.10 245)" }}
            >
              <span className="text-white font-bold">DB</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Complete Your Profile
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Tell us about yourself to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-ocid="setup.input"
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup
                value={role}
                onValueChange={setRole}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="teacher"
                    id="teacher"
                    data-ocid="setup.radio"
                  />
                  <Label htmlFor="teacher" className="cursor-pointer">
                    Teacher
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="admin"
                    id="admin"
                    data-ocid="setup.radio"
                  />
                  <Label htmlFor="admin" className="cursor-pointer">
                    Admin
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !name.trim()}
              data-ocid="setup.submit_button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Continue"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
