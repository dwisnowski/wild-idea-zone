import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MemoryIcon from "@mui/icons-material/Memory";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import DnsIcon from "@mui/icons-material/Dns";

const focusAreas = [
  { icon: <MemoryIcon fontSize="large" color="primary" />, title: "Electronics", text: "Microcontrollers, sensors, and custom PCBs." },
  { icon: <PrecisionManufacturingIcon fontSize="large" color="primary" />, title: "Fabrication", text: "3D printing, CNC, and workshop tooling." },
  { icon: <DnsIcon fontSize="large" color="primary" />, title: "Home lab", text: "Self-hosted services, networking, and automation." },
];

export default function About() {
  return (
    <Stack spacing={5}>
      <Stack spacing={2} sx={{ maxWidth: 720 }}>
        <Typography variant="h2" component="h1" sx={{ fontSize: { xs: "2.25rem", md: "3rem" } }}>
          About the zone
        </Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          Wild Idea Zone is where I document the tech DIY projects that keep me up at night. Some are polished, some are
          half-built, and some are still just ideas. Each project gets its own page here, and the bigger ones live on
          their own subdomain of wildideazone.com with demos, dashboards, and build logs.
        </Typography>
      </Stack>
      <Grid container spacing={3}>
        {focusAreas.map((area) => (
          <Grid key={area.title} size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
              {area.icon}
              <Typography variant="h6" sx={{ mt: 1 }}>
                {area.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {area.text}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
