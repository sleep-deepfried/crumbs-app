"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastComponent({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle size={20} className="text-[#A8D5BA]" strokeWidth={2} />;
      case "error":
        return <AlertCircle size={20} className="text-[#D9534F]" strokeWidth={2} />;
      case "info":
        return <Info size={20} className="text-[#4A3B32]" strokeWidth={2} />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-[#A8D5BA]/10 border-[#A8D5BA]";
      case "error":
        return "bg-[#D9534F]/10 border-[#D9534F]";
      case "info":
        return "bg-[#E6C288]/10 border-[#E6C288]";
    }
  };

  return (
    <div
      className={`${getBgColor()} border-2 rounded-xl p-4 shadow-lg flex items-start gap-3 min-w-[280px] max-w-[90vw] animate-slide-down`}
      role="alert"
      aria-live={toast.type === "error" ? "assertive" : "polite"}
    >
      <div className="shrink-0 mt-0.5">{getIcon()}</div>
      <p className="flex-1 text-sm font-medium text-[#4A3B32]">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 text-[#4A3B32]/70 hover:text-[#4A3B32] transition-colors"
        aria-label="Close notification"
      >
        <X size={18} strokeWidth={2} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
