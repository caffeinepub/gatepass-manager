import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface LoginPageProps {
  onLogin: (secret: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export function LoginPage({ onLogin, isLoading, error }: LoginPageProps) {
  const [secret, setSecret] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) return;
    onLogin(secret.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.22_0.09_255)] via-[oklch(0.28_0.09_255)] to-[oklch(0.22_0.07_240)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-display text-white">
            College Gate Pass
          </h1>
          <p className="text-white/60 mt-2 text-sm">Management System</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Sign In</CardTitle>
            </div>
            <CardDescription>
              Enter your access key to continue. The first user to enter a
              secret key becomes administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="secret">Access Key</Label>
                <Input
                  id="secret"
                  type="password"
                  data-ocid="login.input"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter your access key"
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="login.error_state"
                >
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !secret.trim()}
                data-ocid="login.submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} College Gate Pass System
        </p>
      </motion.div>
    </div>
  );
}
