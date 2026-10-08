import { useNavigate, useParams } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
        <Typography sx={{ mb: 3, lineHeight: 1.8 }}>{project.description}</Typography>
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mb: url ? 3 : 0 }}>
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
        {url && (
          <Button variant="contained" size="large" href={url} endIcon={<OpenInNewIcon />}>
            Visit {new URL(url).host}
          </Button>
        )}
      </Paper>
    </Stack>
  );
}
