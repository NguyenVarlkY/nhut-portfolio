"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import type { ToastType } from "@/lib/toast";

interface ToastData {
  message: string;
  type: ToastType;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-green-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-primary-light" />,
};

export default function Toast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent).detail as ToastData;
      setToast({ message: detail.message, type: detail.type || "info" });
    };
    window.addEventListener("ny:toast", onToast);
    return () => window.removeEventListener("ny:toast", onToast);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key="toast"
          className="fixed bottom-24 right-6 z-[400] flex items-center gap-3 rounded-xl border border-subtle bg-base-alt/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ duration: 0.22 }}
          role="status"
        >
          {ICONS[toast.type]}
          <span className="max-w-[260px] text-sm text-body">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            aria-label="Dismiss"
            className="text-muted transition-colors hover:text-body"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

