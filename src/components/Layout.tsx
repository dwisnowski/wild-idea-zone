import { useState } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
];

const currentYear = new Date().getFullYear();

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Layout() {
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="Open navigation"
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Link href="/" underline="none" color="inherit" sx={{ display: "flex", alignItems: "center", gap: 1, mr: "auto" }}>
              <Box component="img" src="/favicon.svg" alt="" sx={{ width: 32, height: 32 }} />
              <Typography variant="h6" component="span" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                Wild Idea Zone
              </Typography>
            </Link>
            <Box component="nav" sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}>
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  href={item.href}
                  color={isActive(pathname, item.href) ? "primary" : "inherit"}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
            <ThemeToggle />
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240 }} role="navigation" onClick={() => setDrawerOpen(false)}>
          <Typography variant="h6" sx={{ px: 2, py: 2, fontWeight: 800 }}>
            Wild Idea Zone
          </Typography>
          <List>
            {navItems.map((item) => (
              <ListItemButton key={item.href} href={item.href} selected={isActive(pathname, item.href)}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container component="main" maxWidth="lg" sx={{ flex: 1, py: { xs: 4, md: 6 } }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", py: 3 }}>
        <Container maxWidth="lg" sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Wild Idea Zone
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Built on Cloudflare Workers
          </Typography>
        </Container>
      </Box>
      <ScrollRestoration />
    </Box>
  );
}
