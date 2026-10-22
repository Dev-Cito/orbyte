import type { TaskStatus } from "@/lib/api";

// The words for each status: column headings and move-button labels.
export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};
