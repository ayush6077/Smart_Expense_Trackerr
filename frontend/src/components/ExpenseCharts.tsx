import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { format, parseISO, startOfMonth, subDays } from "date-fns";
import { CATEGORY_COLORS, formatMoney } from "@/lib/currency";

interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description: string | null;
  expense_date: string;
}

export function ExpenseCharts({ expenses, currency }: { expenses: Expense[]; currency: string }) {
  // Pie data — by category, this month
  const monthStart = useMemo(() => startOfMonth(new Date()), []);
  const thisMonth = useMemo(
    () => expenses.filter((e) => parseISO(e.expense_date) >= monthStart),
    [expenses, monthStart],
  );

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of thisMonth) {
      map[e.category] = (map[e.category] ?? 0) + Number(e.amount);
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [thisMonth]);

  // Last 14 days trend
  const trend = useMemo(() => {
    const days: { date: string; total: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, "yyyy-MM-dd");
      const total = expenses
        .filter((e) => e.expense_date === key)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      days.push({ date: format(d, "MMM d"), total: Number(total.toFixed(2)) });
    }
    return days;
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="glass rounded-3xl border border-border p-10 text-center text-muted-foreground">
        Add your first expense to see beautiful charts here ✨
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="glass shadow-card rounded-3xl border border-border p-6">
        <h3 className="text-lg font-bold">By category (this month)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
                stroke="none"
              >
                {byCategory.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={CATEGORY_COLORS[entry.name] ?? "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => formatMoney(Number(v), currency)}
                contentStyle={{ borderRadius: 12, border: "1px solid #eee" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass shadow-card rounded-3xl border border-border p-6">
        <h3 className="text-lg font-bold">Top categories</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory.slice(0, 6)} margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => formatMoney(Number(v), currency)}
                contentStyle={{ borderRadius: 12, border: "1px solid #eee" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {byCategory.slice(0, 6).map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass shadow-card rounded-3xl border border-border p-6 lg:col-span-2">
        <h3 className="text-lg font-bold">Spending trend (last 14 days)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff6b6b" />
                  <stop offset="50%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => formatMoney(Number(v), currency)}
                contentStyle={{ borderRadius: 12, border: "1px solid #eee" }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="url(#lineGrad)"
                strokeWidth={3}
                dot={{ r: 4, fill: "#c084fc" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function useExpenses() {
  return useState<Expense[]>([]);
}
