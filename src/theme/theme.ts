import { createTheme } from "@mui/material/styles";
import type { LinkProps } from "@mui/material/Link";
import LinkBehavior from "./LinkBehavior";

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0066ff" },
        secondary: { main: "#ff3d8b" },
        background: { default: "#f6f7fb", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#4da3ff" },
        secondary: { main: "#ff5fa2" },
        background: { default: "#0b0f17", paper: "#131a26" },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.03em" },
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiLink: {
      defaultProps: { component: LinkBehavior } as LinkProps,
    },
    MuiButtonBase: {
      defaultProps: { LinkComponent: LinkBehavior },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit" },
      styleOverrides: {
        root: ({ theme }) => ({
          backdropFilter: "blur(10px)",
          backgroundColor: `rgba(${theme.vars.palette.background.defaultChannel} / 0.8)`,
          borderBottom: `1px solid ${theme.vars.palette.divider}`,
        }),
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: ({ theme }) => ({
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "transform 150ms ease, border-color 150ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            borderColor: theme.vars.palette.primary.main,
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
  },
});
