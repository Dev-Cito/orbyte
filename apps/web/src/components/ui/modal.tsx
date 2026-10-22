"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// A glass dialog (it floats). Built on the native <dialog> + showModal():
// focus is trapped inside, Escape closes it, the page behind is inert, and
// focus returns to the opener on close.
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  dismissible = true,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  // false while an action runs: Escape and backdrop clicks are ignored, so
  // the dialog cannot vanish under a pending request.
  dismissible?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Escape, or close() from code: keep the parent's state in sync.
      onClose={onClose}
      // Escape fires "cancel" first: veto it when not dismissible.
      onCancel={(event) => {
        if (!dismissible) event.preventDefault();
      }}
      // A click on the backdrop lands on the <dialog> element itself.
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "glass-panel m-auto w-[calc(100%-2rem)] max-w-md rounded-panel p-6 text-fg-inverse",
        "backdrop:bg-black/60",
        className,
      )}
    >
      <h2 id={titleId} className="text-lg font-semibold">
        {title}
      </h2>
      {description && (
        <div id={descriptionId} className="mt-1 text-sm text-fg-inverse/70">
          {description}
        </div>
      )}
      <div className="mt-5">{open && children}</div>
    </dialog>
  );
}
