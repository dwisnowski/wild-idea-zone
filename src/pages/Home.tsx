import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ProjectCard from "../components/ProjectCard";
import { projects } from "../data/projects";

export default function Home() {
  const featured = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <Stack spacing={{ xs: 6, md: 10 }}>
      <Box
        component="section"
        sx={(theme) => {
          const palette = (theme.vars ?? theme).palette;
          return {
            borderRadius: 4,
            px: { xs: 3, md: 8 },
            py: { xs: 6, md: 10 },
            border: `1px solid ${palette.divider}`,
            background: `radial-gradient(circle at 15% 20%, ${theme.alpha(palette.primary.main, 0.25)}, transparent 50%),
              radial-gradient(circle at 85% 80%, ${theme.alpha(palette.secondary.main, 0.25)}, transparent 50%),
              ${palette.background.paper}`,
          };
        }}
      >
        <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: "0.2em" }}>
          Tech DIY projects
        </Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: "2.75rem", md: "4.5rem" }, my: 2 }}>
          Wild Idea{" "}
          <Box
            component="span"
            sx={(theme) => ({
              background: `linear-gradient(90deg, ${(theme.vars ?? theme).palette.primary.main}, ${(theme.vars ?? theme).palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            })}
          >
            Zone
          </Box>
        </Typography>
        <Typography variant="h6" component="p" color="text.secondary" sx={{ maxWidth: 640, fontWeight: 400, mb: 4 }}>
          Electronics, fabrication, home labs, and whatever else seemed like a good idea at 2am. Build logs, design
          files, and live demos for every experiment.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button variant="contained" size="large" href="/projects" endIcon={<ArrowForwardIcon />}>
            Explore projects
          </Button>
          <Button variant="outlined" size="large" href="/about">
            About the zone
          </Button>
        </Stack>
      </Box>

      <Box component="section">
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 3 }}>
          <Typography variant="h4" component="h2">
            Featured builds
          </Typography>
          <Button href="/projects" endIcon={<ArrowForwardIcon />}>
            View all
          </Button>
        </Stack>
        <Grid container spacing={3}>
          {featured.map((project) => (
            <Grid key={project.slug} size={{ xs: 12, sm: 6, md: 4 }}>
              <ProjectCard project={project} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
}
