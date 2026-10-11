import { useNavigate, useParams } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GitHubIcon from "@mui/icons-material/GitHub";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StatusChip from "../components/StatusChip";
import { findProject, projectUrl } from "../data/projects";
import NotFound from "./NotFound";

export default function ProjectDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const project = findProject(slug);

  if (!project) {
    return <NotFound message="That project doesn't exist (yet)." />;
  }

  const url = projectUrl(project);

  return (
    <Stack spacing={4}>
      <Box>
        <Button href="/projects" startIcon={<ArrowBackIcon />} sx={{ ml: -1 }}>
          All projects
        </Button>
      </Box>

      <Box>
        <Stack direction="row" sx={{ alignItems: "center", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <Typography variant="h2" component="h1" sx={{ fontSize: { xs: "2.25rem", md: "3rem" } }}>
            {project.title}
          </Typography>
          <StatusChip status={project.status} size="medium" />
        </Stack>
        <Typography variant="h6" component="p" color="text.secondary" sx={{ fontWeight: 400 }}>
          {project.tagline}
        </Typography>
      </Box>

      {project.image && (
        <Box component="img" src={project.image} alt="" sx={{ width: "100%", borderRadius: 3 }} />
      )}

      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
        {project.description.split(/\n\s*\n/).map((paragraph, i) => (
          <Typography key={i} sx={{ mb: 2, lineHeight: 1.8 }}>
            {paragraph}
          </Typography>
        ))}

        {project.highlights && (
          <Grid container spacing={2} sx={{ my: 3 }}>
            {project.highlights.map((highlight) => (
              <Grid key={highlight.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box sx={{ height: "100%", p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
                  <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {highlight.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {highlight.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: 1, mb: url || project.repoUrl ? 3 : 0 }}>
          {project.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              variant="outlined"
              clickable
              onClick={() => navigate(`/projects?tag=${encodeURIComponent(tag)}`)}
            />
          ))}
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          {url && (
            <Button variant="contained" size="large" href={url} endIcon={<OpenInNewIcon />}>
              Visit {new URL(url).host}
            </Button>
          )}
          {project.repoUrl && (
            <Button variant="outlined" size="large" href={project.repoUrl} startIcon={<GitHubIcon />}>
              View on GitHub
            </Button>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
