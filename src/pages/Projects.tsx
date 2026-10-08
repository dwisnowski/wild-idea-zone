import { useSearchParams } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import ProjectCard from "../components/ProjectCard";
import { allTags, projects, type ProjectStatus } from "../data/projects";
import { statusDetails, statuses } from "../data/status";

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTags = searchParams.getAll("tag");
  const statusParam = searchParams.get("status");
  const activeStatus = statuses.includes(statusParam as ProjectStatus) ? (statusParam as ProjectStatus) : null;

  const filtered = projects.filter(
    (p) =>
      (!activeStatus || p.status === activeStatus) && activeTags.every((tag) => p.tags.includes(tag)),
  );

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams);
    mutate(next);
    setSearchParams(next, { replace: true });
  }

  function toggleTag(tag: string) {
    updateParams((params) => {
      const tags = params.getAll("tag");
      params.delete("tag");
      const nextTags = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
      nextTags.forEach((t) => params.append("tag", t));
    });
  }

  function setStatus(status: ProjectStatus | null) {
    updateParams((params) => (status ? params.set("status", status) : params.delete("status")));
  }

  const hasFilters = activeTags.length > 0 || activeStatus !== null;

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h2" component="h1" sx={{ fontSize: { xs: "2.25rem", md: "3rem" }, mb: 1 }}>
          Projects
        </Typography>
        <Typography color="text.secondary">
          Every build in the zone, from napkin sketches to things that actually work.
        </Typography>
      </Box>

      <Stack spacing={2}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={activeStatus}
          onChange={(_, value: ProjectStatus | null) => setStatus(value)}
          aria-label="Filter by status"
        >
          {statuses.map((status) => (
            <ToggleButton key={status} value={status} sx={{ px: 2 }}>
              {statusDetails[status].label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
          {allTags.map((tag) => {
            const selected = activeTags.includes(tag);
            return (
              <Chip
                key={tag}
                label={tag}
                clickable
                color={selected ? "primary" : "default"}
                variant={selected ? "filled" : "outlined"}
                onClick={() => toggleTag(tag)}
              />
            );
          })}
          {hasFilters && (
            <Button size="small" onClick={() => setSearchParams({}, { replace: true })}>
              Clear filters
            </Button>
          )}
        </Stack>
      </Stack>

      {filtered.length > 0 ? (
        <Grid container spacing={3}>
          {filtered.map((project) => (
            <Grid key={project.slug} size={{ xs: 12, sm: 6, md: 4 }}>
              <ProjectCard project={project} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
          No projects match those filters yet.
        </Typography>
      )}
    </Stack>
  );
}
