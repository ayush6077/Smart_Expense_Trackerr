import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function AuthPage() {
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/dashboard");
  }, [user, authLoading, navigate]);

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, name || email.split("@")[0]);
        toast.success("Welcome to SmartCents! 🎉");
      } else {
        await signIn(email, password);
        toast.success("Welcome back!");
      }
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-blob bg-gradient-brand absolute -top-32 left-1/4 h-96 w-96 rounded-full opacity-25 blur-3xl" />
        <div className="animate-blob bg-gradient-hero absolute bottom-0 right-1/4 h-96 w-96 rounded-full opacity-25 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="bg-gradient-brand shadow-glow flex h-11 w-11 items-center justify-center rounded-2xl">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold">
            Smart<span className="text-gradient-brand">Cents</span>
          </span>
        </Link>

        <div className="glass shadow-soft rounded-3xl border border-border p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to manage your money smarter."
                : "Start tracking expenses with AI in seconds."}
            </p>
          </div>

          <form onSubmit={handleEmail} className="space-y-4 mt-6">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex"
                  className="mt-1.5"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-brand shadow-glow w-full rounded-xl py-6 text-base font-semibold text-white hover:opacity-95"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "signin" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to SmartCents?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
