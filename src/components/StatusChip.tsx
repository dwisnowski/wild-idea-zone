import Chip, { type ChipProps } from "@mui/material/Chip";
import type { ProjectStatus } from "../data/projects";
import { statusDetails } from "../data/status";

export default function StatusChip({ status, size = "small" }: { status: ProjectStatus; size?: ChipProps["size"] }) {
  const { label, color } = statusDetails[status];
  return <Chip label={label} color={color} size={size} variant={status === "idea" ? "outlined" : "filled"} />;
}
