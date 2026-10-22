"use client";

import { useParams } from "next/navigation";
import { ProjectBoard } from "./project-board";

// Reads the id from the URL. Keyed by it, so switching projects starts from
// a clean board.
export function ProjectBoardRoute() {
  const { id } = useParams<{ id: string }>();
  return <ProjectBoard key={id} projectId={id} />;
}
