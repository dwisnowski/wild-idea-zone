import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function NotFound({ message = "This page wandered off to a different workbench." }: { message?: string }) {
  return (
    <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center", py: 10 }}>
      <Typography variant="h1" color="primary" sx={{ fontSize: "5rem" }}>
        404
      </Typography>
      <Typography variant="h5">{message}</Typography>
      <Button variant="contained" href="/">
        Back home
      </Button>
    </Stack>
  );
}
