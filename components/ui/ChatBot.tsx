"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { sanitizeInput } from "@/lib/sanitize";

type Message = { role: "bot" | "user"; text: string };

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "bot", text: t("chatbot.greeting") }]);
    }
  }, [open, messages.length, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const raw = input.trim();
    if (!raw || sending) return;

    // Sanitize user input before processing
    const sanitized = sanitizeInput(raw, {
      maxLength: 2000,
      checkSql: true,
      checkXss: true,
      checkProfanity: true,
    });

    if (!sanitized.clean && sanitized.errors.length > 0) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: raw },
        { role: "bot", text: "⚠️ " + sanitized.errors.join(". ") + "." },
      ]);
      setInput("");
      return;
    }

    const safeText = sanitized.sanitized;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text: safeText }]);
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })),
            { role: "user", content: safeText }
          ]
        }),
      });

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.message ?? data.error ?? "Sorry, something went wrong." },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Error connecting to AI assistant." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle chatbot"
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white shadow-glow transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-lg"
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-160px)] rounded-2xl border border-subtle bg-base-alt/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-subtle px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-white">
                <Bot size={18} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{t("chatbot.title")}</div>
                <div className="flex items-center gap-1.5 text-xs text-green-500">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Online
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-hover hover:text-body transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      m.role === "bot"
                        ? "bg-gradient-to-br from-primary to-primary-light text-white"
                        : "bg-surface text-muted"
                    }`}
                  >
                    {m.role === "bot" ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "bot"
                        ? "bg-surface border border-subtle text-body"
                        : "bg-gradient-to-br from-primary to-primary-light text-white"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-white">
                    <Bot size={14} />
                  </div>
                  <div className="rounded-2xl bg-surface border border-subtle px-4 py-2.5">
                    <span className="inline-flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-subtle p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={t("chatbot.placeholder")}
                  className="flex-1 rounded-xl border border-subtle bg-surface px-4 py-2.5 text-sm text-body placeholder:text-placeholder outline-none focus:border-primary-light/50 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-white shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
