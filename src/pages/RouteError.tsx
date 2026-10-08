import { isRouteErrorResponse, useRouteError } from "react-router";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Something went wrong.";

  return (
    <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center", py: 10, px: 2 }}>
      <Typography variant="h3" component="h1">
        Short circuit!
      </Typography>
      <Typography color="text.secondary">{message}</Typography>
      <Button variant="contained" href="/">
        Back home
      </Button>
    </Stack>
  );
}
