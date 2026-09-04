"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Github, Linkedin, Facebook, Copy, Check, AlertTriangle } from "lucide-react";
import { profile } from "@/lib/data";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { sanitizeInput, validateEmail, sanitizeForm } from "@/lib/sanitize";
import { showToast } from "@/lib/toast";

const inputCls =
  "w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-body placeholder-placeholder outline-none transition-all focus:border-primary-light focus:ring-2 focus:ring-primary-light/20";

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [sanitizeErrors, setSanitizeErrors] = useState<Record<string, string[]>>({});
  const [sanitizeWarnings, setSanitizeWarnings] = useState<string[]>([]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      showToast(t("contact.copied"), "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSanitizeErrors({});
    setSanitizeWarnings([]);

    // Validate email first
    const emailCheck = validateEmail(form.email);
    if (!emailCheck.valid) {
      setSanitizeErrors({ email: [emailCheck.error!] });
      setStatus("error");
      return;
    }

    // Sanitize all fields
    const result = sanitizeForm({
      name: form.name,
      email: form.email,
      message: form.message,
    }, {
      name: { maxLength: 100, checkSql: true, checkXss: true, checkProfanity: true },
      email: { maxLength: 254, checkSql: false, checkXss: false, checkProfanity: false },
      message: { maxLength: 5000, checkSql: true, checkXss: true, checkProfanity: true },
    });

    setSanitizeErrors(result.errors);
    const allWarnings: string[] = [];
    for (const warnings of Object.values(result.warnings)) {
      if (warnings) allWarnings.push(...warnings);
    }
    setSanitizeWarnings(allWarnings);

    if (!result.clean) {
      setStatus("error");
      return;
    }

    // Use sanitized values
    const sanitized = result.sanitized;

    // Send via API route (server-side sanitize + real email via Resend)
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitized.name,
          email: sanitized.email,
          message: sanitized.message,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
        showToast(t("contact.formSuccess"), "success");
      } else if (res.status === 501) {
        // Email service chưa được cấu hình → fallback về mailto: vẫn gửi được qua email client
        const subject = encodeURIComponent(`[Portfolio] Message from ${sanitized.name}`);
        const body = encodeURIComponent(`${sanitized.message}\n\n— ${sanitized.name} (${sanitized.email})`);
        window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        const data = await res.json().catch(() => null);
        setStatus("error");
        setSanitizeErrors({ message: [data?.error ?? t("contact.formError")] });
      }
    } catch {
      setStatus("error");
    }

    setTimeout(() => setStatus("idle"), 3500);
  };

  return (
    <section id="contact" className="section-pad border-y border-subtle bg-base-alt">
      <div className="container-port">
        <motion.div
          className="glass mx-auto max-w-[760px] p-8 md:p-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            {t("contact.title")} <span className="grad-text">{t("contact.titleHighlight")}</span>{" "}
            {t("contact.titleEnd")}
          </h2>
          <p className="mx-auto mt-4 mb-8 max-w-[560px] text-muted">
            {t("contact.description")}
          </p>

          {/* Quick action buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`mailto:${profile.email}`} className="btn-primary">
              <Mail size={16} /> {t("contact.email")}
            </a>
            <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="btn-ghost">
              <Phone size={16} /> {t("contact.phone")}
            </a>
            <button onClick={handleCopy} className="btn-ghost" type="button">
              {copied ? <Check size={16} className="text-accent" /> : <Copy size={16} />}
              {copied ? t("contact.copied") : t("contact.copyEmail")}
            </button>
          </div>

          {/* Social links */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={profile.github}
              target="_blank"
              rel="noopener"
              aria-label="GitHub"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-subtle bg-surface text-muted transition-all hover:border-primary-light hover:text-body hover:-translate-y-0.5"
            >
              <Github size={18} />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-subtle bg-surface text-muted transition-all hover:border-primary-light hover:text-body hover:-translate-y-0.5"
            >
              <Linkedin size={18} />
            </a>
            <a
              href={profile.facebook}
              target="_blank"
              rel="noopener"
              aria-label="Facebook"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-subtle bg-surface text-muted transition-all hover:border-primary-light hover:text-body hover:-translate-y-0.5"
            >
              <Facebook size={18} />
            </a>
          </div>

          {/* Contact form */}
          <form onSubmit={handleSubmit} className="mt-8 text-left" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium text-muted">
                  {t("contact.formName")}
                </label>
                <input
                  id="c-name"
                  type="text"
                  required
                  value={form.name}
                  autoComplete="name"
                  aria-invalid={Boolean(sanitizeErrors.name)}
                  aria-describedby={sanitizeErrors.name ? "c-name-error" : undefined}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`${inputCls} ${sanitizeErrors.name ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                  placeholder={t("contact.formName")}
                  maxLength={100}
                />
                {sanitizeErrors.name?.map((err, i) => (
                  <p id={i === 0 ? "c-name-error" : undefined} key={i} role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-400">
                    <AlertTriangle size={12} /> {err}
                  </p>
                ))}
              </div>
              <div>
                <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium text-muted">
                  {t("contact.formEmail")}
                </label>
                <input
                  id="c-email"
                  type="email"
                  required
                  value={form.email}
                  autoComplete="email"
                  aria-invalid={Boolean(sanitizeErrors.email)}
                  aria-describedby={sanitizeErrors.email ? "c-email-error" : undefined}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`${inputCls} ${sanitizeErrors.email ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                  placeholder={t("contact.formEmail")}
                  maxLength={254}
                />
{sanitizeErrors.email?.map((err, i) => (
                  <p id={i === 0 ? "c-email-error" : undefined} key={i} role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-400">
                    <AlertTriangle size={12} /> {err}
                  </p>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="c-msg" className="mb-1.5 block text-sm font-medium text-muted">
                {t("contact.formMessage")}
              </label>
              <textarea
                id="c-msg"
                required
                rows={4}
                value={form.message}
                aria-invalid={Boolean(sanitizeErrors.message)}
                aria-describedby={sanitizeErrors.message ? "c-message-error" : undefined}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`${inputCls} resize-none ${sanitizeErrors.message ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                placeholder={t("contact.formMessage")}
                maxLength={5000}
              />
              {sanitizeErrors.message?.map((err, i) => (
                <p id={i === 0 ? "c-message-error" : undefined} key={i} role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertTriangle size={12} /> {err}
                </p>
              ))}
            </div>

            {/* Warnings */}
            {sanitizeWarnings.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                {sanitizeWarnings.map((w, i) => (
                  <p key={i} className="flex items-center gap-1.5 text-xs text-amber-400">
                    <AlertTriangle size={12} /> {w}
                  </p>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-primary mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending" ? t("contact.formSending") : t("contact.formSend")}
            </button>

            {status === "success" && (
              <p role="status" aria-live="polite" className="mt-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-center text-sm text-accent">
                {t("contact.formSuccess")}
              </p>
            )}
            {status === "error" && !sanitizeErrors.name && !sanitizeErrors.email && !sanitizeErrors.message && (
              <p role="alert" aria-live="assertive" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
                {t("contact.formError")}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
