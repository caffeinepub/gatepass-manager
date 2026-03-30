import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2, ShieldCheck, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface LoginPageProps {
  onLogin: (
    secret: string,
    role: "student" | "admin",
    name?: string,
  ) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

type Role = "student" | "admin";

export function LoginPage({ onLogin, isLoading, error }: LoginPageProps) {
  const [role, setRole] = useState<Role>("student");
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onLogin(value.trim(), role, role === "student" ? value.trim() : undefined);
  };

  const isStudent = role === "student";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.22_0.09_255)] via-[oklch(0.28_0.09_255)] to-[oklch(0.22_0.07_240)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            College Gate Pass
          </h1>
          <p className="text-white/60 mt-1 text-sm">Welcome! Who are you?</p>
        </div>

        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                data-ocid="login.student.toggle"
                onClick={() => {
                  setRole("student");
                  setValue("");
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  isStudent
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                <User className="h-6 w-6" />
                <span className="text-sm font-semibold">I am Student</span>
              </button>
              <button
                type="button"
                data-ocid="login.admin.toggle"
                onClick={() => {
                  setRole("admin");
                  setValue("");
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  !isStudent
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                <ShieldCheck className="h-6 w-6" />
                <span className="text-sm font-semibold">I am Admin</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={role}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="entry-input" className="text-sm font-medium">
                    {isStudent ? "Your Name" : "Admin Password"}
                  </Label>
                  <Input
                    id="entry-input"
                    data-ocid="login.input"
                    type={isStudent ? "text" : "password"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={
                      isStudent
                        ? "Enter your full name"
                        : "Enter admin password"
                    }
                    autoComplete={isStudent ? "name" : "current-password"}
                    autoFocus
                    className="h-11 text-base"
                    required
                  />
                  <p className="text-xs text-muted-foreground pt-0.5">
                    {isStudent
                      ? "Enter your name to access the gate pass system."
                      : "First time? Any password you set becomes the admin key."}
                  </p>
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
                  className="w-full h-11 text-base font-semibold"
                  disabled={isLoading || !value.trim()}
                  data-ocid="login.submit_button"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    "Continue →"
                  )}
                </Button>
              </motion.form>
            </AnimatePresence>
          </CardContent>
        </Card>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} College Gate Pass System
        </p>
      </motion.div>
    </div>
  );
}
