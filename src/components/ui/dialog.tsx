"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md animate-scale-in rounded-2xl bg-white p-5 shadow-xl dark:bg-ink-800"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700"
            aria-label="إغلاق"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmButton({
  triggerLabel,
  triggerClassName,
  title,
  description,
  confirmLabel = "تأكيد",
  variant = "danger",
  onConfirm,
  disabled,
}: {
  triggerLabel: ReactNode;
  triggerClassName?: string;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => Promise<{ error?: string } | void>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    const result = await onConfirm();
    setPending(false);
    if (!result || !("error" in result) || !result.error) {
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName
        )}
      >
        {triggerLabel}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        <p className="text-sm text-ink-600 dark:text-ink-300">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            إلغاء
          </Button>
          <Button variant={variant} onClick={handleConfirm} loading={pending}>
            {confirmLabel}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
