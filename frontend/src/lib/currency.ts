export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "Mex$", name: "Mexican Peso" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function formatMoney(amount: number, currency: string = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export const CATEGORIES = [
  "Food & Dining",
  "Groceries",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Health",
  "Travel",
  "Education",
  "Subscriptions",
  "Other",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#ff6b6b",
  Groceries: "#4ecdc4",
  Transport: "#ffd166",
  Shopping: "#f78fb3",
  Entertainment: "#a78bfa",
  "Bills & Utilities": "#06b6d4",
  Health: "#34d399",
  Travel: "#fb923c",
  Education: "#60a5fa",
  Subscriptions: "#c084fc",
  Other: "#94a3b8",
};
