import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { projectUrl, type Project } from "../data/projects";
import StatusChip from "./StatusChip";

export default function ProjectCard({ project }: { project: Project }) {
  const url = projectUrl(project);

  return (
    <Card>
      <CardActionArea href={`/projects/${project.slug}`} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        {project.image ? (
          <CardMedia component="img" height="160" image={project.image} alt="" />
        ) : (
          <Box
            sx={(theme) => ({
              height: 120,
              background: `linear-gradient(135deg, ${(theme.vars ?? theme).palette.primary.main}, ${(theme.vars ?? theme).palette.secondary.main})`,
              opacity: 0.85,
            })}
          />
        )}
        <CardContent sx={{ flex: 1 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 1 }}>
            <Typography variant="h6" component="h3">
              {project.title}
            </Typography>
            <StatusChip status={project.status} />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {project.tagline}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75 }}>
            {project.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        </CardContent>
      </CardActionArea>
      {url && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button size="small" href={url} endIcon={<OpenInNewIcon fontSize="small" />}>
            {new URL(url).host}
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
