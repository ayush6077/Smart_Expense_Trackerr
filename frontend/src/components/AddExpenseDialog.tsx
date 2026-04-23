import { useState } from "react";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CATEGORIES, CURRENCIES } from "@/lib/currency";

export function AddExpenseDialog({
  defaultCurrency,
  onAdded,
}: {
  defaultCurrency: string;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"manual" | "ai">("ai");
  const [loading, setLoading] = useState(false);

  // Manual fields
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [category, setCategory] = useState<string>("Food & Dining");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // AI field
  const [nlText, setNlText] = useState("");

  const reset = () => {
    setAmount("");
    setDescription("");
    setNlText("");
    setCategory("Food & Dining");
    setDate(new Date().toISOString().slice(0, 10));
  };

  const submitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");
      const { error } = await supabase.from("expenses").insert({
        user_id: userData.user.id,
        amount: Number(amount),
        currency,
        category,
        description: description || null,
        expense_date: date,
      });
      if (error) throw error;
      toast.success("Expense added!");
      onAdded();
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setLoading(false);
    }
  };

  const submitAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlText.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("smart-insights", {
        body: { mode: "categorize", text: nlText, currency: defaultCurrency },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");
      const { error: insErr } = await supabase.from("expenses").insert({
        user_id: userData.user.id,
        amount: Number(data.amount),
        currency: data.currency || defaultCurrency,
        category: data.category,
        description: data.description,
        expense_date: new Date().toISOString().slice(0, 10),
      });
      if (insErr) throw insErr;
      toast.success(`Added: ${data.description} (${data.category})`);
      onAdded();
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't parse expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-brand shadow-glow rounded-full px-5 text-white">
          <Plus className="mr-1 h-4 w-4" /> Add expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add an expense</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "manual" | "ai")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI quick add
            </TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="mt-4">
            <form onSubmit={submitAI} className="space-y-3">
              <Label htmlFor="nl">Describe your expense</Label>
              <Input
                id="nl"
                value={nlText}
                onChange={(e) => setNlText(e.target.value)}
                placeholder="e.g. Lunch at Sushi Place 24$"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                AI will detect amount, category, and currency automatically.
              </p>
              <Button
                type="submit"
                disabled={loading || !nlText.trim()}
                className="bg-gradient-brand w-full text-white"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Smart add"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={submitManual} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.symbol} {c.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="bg-gradient-brand w-full text-white">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add expense"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
