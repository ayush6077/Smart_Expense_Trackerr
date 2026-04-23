import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet,
  LogOut,
  TrendingUp,
  Target,
  Receipt,
  Trash2,
  Sparkles,
} from "lucide-react";
import { format, parseISO, startOfMonth } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { CURRENCIES, formatMoney, CATEGORY_COLORS } from "../lib/currency";
import { ExpenseCharts } from "../components/ExpenseCharts";
import { AIInsightsPanel, AIChatPanel } from "../components/AIInsights";
import { AddExpenseDialog } from "../components/AddExpenseDialog";

export default function Dashboard() {
  const { user, loading: authLoading, signOut, setUser } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [budgetInput, setBudgetInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const expRes = await api.get('/expenses');
      setExpenses(expRes.data);
      setBudgetInput(user.monthly_budget?.toString() ?? "");
    } catch (e) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const currency = user?.preferred_currency ?? "USD";

  const updateCurrency = async (c) => {
    if (!user) return;
    setUser({ ...user, preferred_currency: c });
    try {
      await api.put('/auth/profile', { preferred_currency: c });
      toast.success(`Currency set to ${c}`);
    } catch (e) {
      toast.error("Failed to update currency");
    }
  };

  const updateBudget = async () => {
    if (!user) return;
    const v = budgetInput ? Number(budgetInput) : null;
    setUser({ ...user, monthly_budget: v });
    try {
      await api.put('/auth/profile', { monthly_budget: v });
      toast.success("Budget updated");
    } catch (e) {
      toast.error("Failed to update budget");
    }
  };

  const removeExpense = async (id) => {
    setExpenses((p) => p.filter((e) => e.id !== id));
    try {
      await api.delete(`/expenses/${id}`);
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const stats = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const monthExp = expenses.filter((e) => parseISO(e.expense_date) >= monthStart);
    const total = monthExp.reduce((s, e) => s + Number(e.amount), 0);
    const byCat = {};
    for (const e of monthExp) byCat[e.category] = (byCat[e.category] ?? 0) + Number(e.amount);
    const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    const avgPerDay = total / Math.max(1, new Date().getDate());
    return { total, top, avgPerDay, count: monthExp.length };
  }, [expenses]);

  const budgetLeft = user?.monthly_budget ? user.monthly_budget - stats.total : null;
  const budgetPct =
    user?.monthly_budget && user.monthly_budget > 0
      ? Math.min(100, (stats.total / user.monthly_budget) * 100)
      : 0;

  const downloadReport = () => {
    const monthStart = startOfMonth(new Date());
    const rows = expenses.filter((e) => parseISO(e.expense_date) >= monthStart);
    const header = "Date,Category,Description,Amount,Currency\n";
    const csv =
      header +
      rows
        .map(
          (e) =>
            `${e.expense_date},${e.category},"${(e.description ?? "").replace(/"/g, '""')}",${e.amount},${e.currency}`,
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartcents-${format(new Date(), "yyyy-MM")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-gradient-brand h-12 w-12 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-blob bg-gradient-brand absolute -top-20 left-10 h-72 w-72 rounded-full opacity-20 blur-3xl" />
        <div className="animate-blob bg-gradient-hero absolute top-40 right-10 h-72 w-72 rounded-full opacity-15 blur-3xl" />
      </div>

      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-brand shadow-glow flex h-10 w-10 items-center justify-center rounded-2xl">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">
            Smart<span className="text-gradient-brand">Cents</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Select value={currency} onValueChange={updateCurrency}>
            <SelectTrigger className="w-28 rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={signOut}
            variant="ghost"
            size="icon"
            className="rounded-full"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Hi {user?.full_name?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="text-muted-foreground">Here's how your money's moving this month.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={downloadReport}
              variant="outline"
              className="rounded-full"
            >
              <Receipt className="mr-1.5 h-4 w-4" /> Export CSV
            </Button>
            <AddExpenseDialog defaultCurrency={currency} onAdded={load} />
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Spent this month"
            value={formatMoney(stats.total, currency)}
            sub={`${stats.count} transactions`}
            tone="brand"
          />
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Daily average"
            value={formatMoney(stats.avgPerDay, currency)}
            sub="per day so far"
            tone="violet"
          />
          <StatCard
            icon={<Sparkles className="h-5 w-5" />}
            label="Top category"
            value={stats.top?.[0] ?? "—"}
            sub={stats.top ? formatMoney(stats.top[1], currency) : ""}
            tone="pink"
          />
          <BudgetCard
            currency={currency}
            budget={user?.monthly_budget ?? null}
            left={budgetLeft}
            pct={budgetPct}
            input={budgetInput}
            onInput={setBudgetInput}
            onSave={updateBudget}
          />
        </div>

        <ExpenseCharts expenses={expenses} currency={currency} />

        <div className="grid gap-5 lg:grid-cols-2">
          <AIInsightsPanel
            expenses={expenses}
            currency={currency}
            monthlyBudget={user?.monthly_budget ?? null}
          />
          <AIChatPanel expenses={expenses} currency={currency} />
        </div>

        <div className="glass shadow-card rounded-3xl border border-border p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent expenses</h3>
            <span className="text-xs text-muted-foreground">{expenses.length} total</span>
          </div>
          {expenses.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              No expenses yet — tap "Add expense" to start.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {expenses.slice(0, 15).map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-3">
                  <div
                    className="h-9 w-9 flex-shrink-0 rounded-xl"
                    style={{ background: CATEGORY_COLORS[e.category] ?? "#94a3b8" }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {e.description || e.category}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {e.category} · {format(parseISO(e.expense_date), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatMoney(Number(e.amount), e.currency)}</div>
                  </div>
                  <button
                    onClick={() => removeExpense(e.id)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, sub, tone }) {
  const bg =
    tone === "brand"
      ? "bg-gradient-brand"
      : tone === "violet"
        ? "bg-gradient-to-br from-violet-500 to-indigo-500"
        : "bg-gradient-to-br from-pink-500 to-rose-500";
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass shadow-card rounded-3xl border border-border p-5"
    >
      <div className="flex items-center gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${bg}`}>
          {icon}
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-3 truncate text-2xl font-extrabold">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
    </motion.div>
  );
}

function BudgetCard({ currency, budget, left, pct, input, onInput, onSave }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass shadow-card rounded-3xl border border-border p-5"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
          <Target className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Monthly budget
        </span>
      </div>
      {budget ? (
        <>
          <div className="mt-3 text-2xl font-extrabold">
            {left !== null && left >= 0 ? formatMoney(left, currency) : "Over budget"}
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {Math.round(pct)}% of {formatMoney(budget, currency)}
          </div>
        </>
      ) : (
        <div className="mt-3 flex gap-2">
          <Input
            type="number"
            placeholder="Set budget"
            value={input}
            onChange={(e) => onInput(e.target.value)}
            className="h-9"
          />
          <Button onClick={onSave} size="sm" className="bg-gradient-brand text-white">
            Set
          </Button>
        </div>
      )}
    </motion.div>
  );
}
