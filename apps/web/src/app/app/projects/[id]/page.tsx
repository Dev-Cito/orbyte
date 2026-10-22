import type { Metadata } from "next";
import { ProjectBoardRoute } from "@/components/app/tasks/project-board-route";

export const metadata: Metadata = { title: "Project" };

export default function ProjectPage() {
  return <ProjectBoardRoute />;
}
