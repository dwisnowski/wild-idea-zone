import type { ChipProps } from "@mui/material/Chip";
import type { ProjectStatus } from "./projects";

export const statusDetails: Record<ProjectStatus, { label: string; color: ChipProps["color"] }> = {
  idea: { label: "Idea", color: "default" },
  building: { label: "Building", color: "warning" },
  live: { label: "Live", color: "success" },
};

export const statuses = Object.keys(statusDetails) as ProjectStatus[];
