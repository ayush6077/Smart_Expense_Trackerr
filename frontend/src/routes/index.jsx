import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  PieChart,
  Globe2,
  Wallet,
  TrendingUp,
  Brain,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-blob absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-brand opacity-30 blur-3xl" />
        <div className="animate-blob absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-gradient-hero opacity-25 blur-3xl" />
        <div className="animate-blob absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-accent opacity-40 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Smart<span className="text-gradient-brand">Cents</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#how" className="hover:text-foreground">
            How it works
          </a>
        </nav>
        <Link
          to="/auth"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 text-center sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-white/60 px-4 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-powered • Multi-currency • Free to start
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mx-auto mt-6 max-w-4xl text-5xl font-extrabold leading-[1.05] sm:text-6xl md:text-7xl"
        >
          Spend smarter.
          <br />
          <span className="text-gradient-brand">Save effortlessly.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          SmartCents tracks every expense in any currency, then your AI coach turns the numbers
          into insights, alerts, and a clear plan to reach your goals.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/auth"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-base font-semibold text-white shadow-glow transition hover:scale-[1.02]"
          >
            Get started free
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-7 py-3.5 text-base font-semibold text-foreground backdrop-blur hover:bg-white"
          >
            See features
          </a>
        </motion.div>

        {/* Hero card preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div className="glass shadow-soft rounded-3xl border border-border p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="This month" value="$2,148.30" delta="+8.4%" tone="brand" />
              <StatCard label="Budget left" value="$851.70" delta="29% remaining" tone="ok" />
              <StatCard label="Top category" value="Food & Dining" delta="$612 spent" tone="warn" />
            </div>
            <div className="mt-6 rounded-2xl bg-gradient-soft p-5 text-left">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Brain className="h-4 w-4 text-primary" /> AI Insight
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                You spent <b>23% more on dining</b> this week than last. Cooking at home twice could
                save around <b>$48</b>. Subscriptions look healthy — keep it up!
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-4xl font-bold sm:text-5xl">
            Everything you need to <span className="text-gradient-brand">master your money</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            One place for every receipt, every currency, and every aha-moment.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Brain />}
            title="AI insights"
            text="Get plain-English analysis of your spending, anomaly alerts, and personalized saving tips."
          />
          <FeatureCard
            icon={<PieChart />}
            title="Beautiful charts"
            text="See where your money goes with vibrant pie, bar, and trend charts that update live."
          />
          <FeatureCard
            icon={<Globe2 />}
            title="Any currency"
            text="USD, EUR, INR, JPY and 12 more — track on the road or at home in your favorite currency."
          />
          <FeatureCard
            icon={<TrendingUp />}
            title="Smart reports"
            text="Monthly summaries you can actually understand. Spot trends before they hurt your wallet."
          />
          <FeatureCard
            icon={<Sparkles />}
            title="Natural language entry"
            text="Type 'lunch 12$' and SmartCents auto-categorizes, parses amount, and saves it."
          />
          <FeatureCard
            icon={<Wallet />}
            title="Budget guardrails"
            text="Set a monthly budget. SmartCents tells you exactly how much you can still spend, daily."
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            { n: "01", t: "Sign up free", d: "Email or one-tap with Google. Done in seconds." },
            { n: "02", t: "Log expenses", d: "Tap, type, or describe — AI handles the rest." },
            { n: "03", t: "Get insights", d: "Charts, alerts, and AI tips delivered instantly." },
          ].map((s) => (
            <div key={s.n} className="glass rounded-3xl border border-border p-6 shadow-card">
              <div className="text-gradient-brand text-5xl font-extrabold">{s.n}</div>
              <h3 className="mt-3 text-xl font-bold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="bg-gradient-hero shadow-glow relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to take control?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Join SmartCents today and let AI do the heavy lifting on your finances.
          </p>
          <Link
            to="/auth"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-foreground shadow-card transition hover:scale-[1.02]"
          >
            Start tracking free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SmartCents. Spend smarter, every day.
      </footer>
    </div>
  );
}

function StatCard({ label, value, delta, tone }) {
  const toneClass =
    tone === "brand"
      ? "text-gradient-brand"
      : tone === "ok"
        ? "text-emerald-600"
        : "text-amber-600";
  return (
    <div className="rounded-2xl bg-white p-4 text-left shadow-card">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-extrabold ${toneClass}`}>{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{delta}</div>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass shadow-card hover:shadow-soft rounded-3xl border border-border p-6 transition"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
    </motion.div>
  );
}
