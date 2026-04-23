import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import api from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AIInsightsPanel({
  expenses,
  currency,
  monthlyBudget,
}) {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (expenses.length === 0) {
      toast.info("Add some expenses first to get insights.");
      return;
    }
    setLoading(true);
    setInsights("");
    try {
      const res = await api.post('/ai/insights', {
        mode: "insights",
        expenses: expenses.slice(0, 100),
        currency,
        monthlyBudget,
      });
      setInsights(res.data.insights ?? "No insights returned.");
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to load insights";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass shadow-soft rounded-3xl border border-border p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-brand shadow-glow flex h-9 w-9 items-center justify-center rounded-xl">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-bold">AI insights</h3>
        </div>
        <Button
          onClick={generate}
          disabled={loading}
          className="bg-gradient-brand rounded-full text-white"
          size="sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
        </Button>
      </div>
      {!insights && !loading && (
        <p className="mt-4 text-sm text-muted-foreground">
          Tap <b>Generate</b> to get a personalized summary, anomaly alerts, and saving tips
          tailored to your spending.
        </p>
      )}
      {loading && (
        <div className="mt-6 space-y-2">
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      )}
      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-sm mt-4 max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground"
        >
          <ReactMarkdown>{insights}</ReactMarkdown>
        </motion.div>
      )}
    </div>
  );
}

export function AIChatPanel({
  expenses,
  currency,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const resp = await fetch("http://localhost:5000/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          mode: "chat",
          messages: [...messages, userMsg],
          expenses: expenses.slice(0, 100),
          currency,
        }),
      });

      if (!resp.ok) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      let acc = "";
      setMessages((p) => [...p, { role: "assistant", content: "" }]);

      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setMessages((p) =>
                p.map((m, i) => (i === p.length - 1 ? { ...m, content: acc } : m)),
              );
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      const msg = e.message || "Chat failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass shadow-soft flex h-[500px] flex-col rounded-3xl border border-border">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <div className="bg-gradient-brand flex h-8 w-8 items-center justify-center rounded-lg">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <h3 className="font-bold">Ask SmartCents</h3>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Try asking:</p>
            <button
              onClick={() => setInput("How much did I spend on food this month?")}
              className="block rounded-lg bg-secondary px-3 py-1.5 text-left text-foreground hover:bg-accent"
            >
              How much did I spend on food this month?
            </button>
            <button
              onClick={() => setInput("Where can I cut back to save $100?")}
              className="block rounded-lg bg-secondary px-3 py-1.5 text-left text-foreground hover:bg-accent"
            >
              Where can I cut back to save $100?
            </button>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === "user"
                ? "bg-gradient-brand ml-auto text-white"
                : "bg-secondary text-foreground"
            }`}
          >
            {m.role === "assistant" ? (
              <div className="prose prose-sm max-w-none prose-headings:my-2 prose-p:my-1 prose-ul:my-1">
                <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
              </div>
            ) : (
              m.content
            )}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2 border-t border-border p-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your money…"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-gradient-brand text-white"
          size="icon"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
