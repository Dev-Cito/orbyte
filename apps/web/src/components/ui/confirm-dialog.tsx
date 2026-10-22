"use client";

import type { ReactNode } from "react";
import { ErrorAlert } from "./alert";
import { Button } from "./button";
import { Modal } from "./modal";

// "Are you sure?" for destructive actions. The parent runs the action and
// reports pending/error, so the dialog never closes on a failure silently.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pending,
  error,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pending: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      dismissible={!pending}
      title={title}
      description={description}
    >
      {error && (
        <ErrorAlert tone="dark" className="mb-4">
          {error}
        </ErrorAlert>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" tone="dark" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button variant="danger" tone="dark" onClick={onConfirm} loading={pending}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
