"use client";

import { useState, type FormEvent } from "react";
import { ErrorAlert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PlanLimitError, projectsApi } from "@/lib/api";
import { errorMessage } from "@/lib/error-message";
import { PlanLimitNotice } from "../plan-limit-notice";

export function CreateProjectDialog({
  open,
  onClose,
  onCreated,
  onLimitReached,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  // The API refused because of the plan: this page's view was stale, so it
  // re-reads projects and usage (the "New project" button turns disabled).
  onLimitReached: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitError, setLimitError] = useState<PlanLimitError | null>(null);

  function close() {
    setError(null);
    setLimitError(null);
    onClose();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name")).trim();
    if (!name) {
      setError("Give the project a name.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await projectsApi.create(name);
      close();
      onCreated();
    } catch (err) {
      // The API is the authority on limits: even if the button was enabled
      // (stale usage, another tab, a forced click), its 403 lands here.
      if (err instanceof PlanLimitError) {
        setLimitError(err);
        onLimitReached();
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      dismissible={!pending}
      title={limitError ? "Project limit reached" : "New project"}
    >
      {limitError ? (
        <div className="flex flex-col gap-4">
          <PlanLimitNotice role="alert" title="This project was not created">
            {limitError.message}
          </PlanLimitNotice>
          <div className="flex justify-end">
            <Button variant="secondary" tone="dark" onClick={close}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {error && <ErrorAlert tone="dark">{error}</ErrorAlert>}
          <Input
            tone="dark"
            label="Project name"
            name="name"
            required
            maxLength={200}
            autoFocus
            autoComplete="off"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" tone="dark" onClick={close} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" tone="dark" loading={pending}>
              Create project
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
