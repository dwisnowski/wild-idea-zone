export const SITE_DOMAIN = "wildideazone.com";

export type ProjectStatus = "idea" | "building" | "live";

export interface ProjectHighlight {
  title: string;
  text: string;
}

export interface Project {
  /** Used in the URL: /projects/:slug */
  slug: string;
  title: string;
  tagline: string;
  /** Separate paragraphs with a blank line */
  description: string;
  highlights?: ProjectHighlight[];
  repoUrl?: string;
  /** Lowercase, hyphenated, e.g. "electronics", "3d-printing", "home-lab" */
  tags: string[];
  status: ProjectStatus;
  /** "robots" links to https://robots.wildideazone.com */
  subdomain?: string;
  /** Path under public/ or an absolute URL */
  image?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: "hypersync",
    title: "HyperSync",
    tagline: "High-speed softball motion analysis, base-running timing, and team stats from a Raspberry Pi in the dugout.",
    description: `HyperSync captures short clips at 120 fps from an Arducam OV9281 global-shutter camera, then lets you scrub, annotate, and compare throws, pitches, and swings frame by frame. It runs on a Raspberry Pi 5 that brings its own field Wi-Fi, so any phone or tablet at the park can open the review app.

Every player has a teammate profile that ties their clips, splits, and batting stats together.

The admin side covers access roles (admin, coach, and family viewers or editors, with optional remote access through Cloudflare), full backup and restore, clip export to a phone's photo library, over-the-air firmware updates for the radar nodes, and one-click software updates. A gamepad can also drive capture and review hands-free.`,
    highlights: [
      {
        title: "High-speed capture",
        text: "120 fps monochrome global-shutter video, saved in a frame-accurate format so review never skips a frame.",
      },
      {
        title: "Frame-by-frame review",
        text: "Scrub, annotate, and compare clips side by side, with in-browser pose tracking for pitching and swing mechanics.",
      },
      {
        title: "Base-running timing",
        text: "Battery-powered ESP32-C6 radar nodes on each base time every split and announce personal bests out loud.",
      },
      {
        title: "Instincts simulator",
        text: "An interactive defensive drill for practicing where each fielder should be and how to read live balls, using the team's own roster.",
      },
      {
        title: "In-game stats",
        text: "Batting lineups, pitch-by-pitch at-bats, and quality at-bat tracking across games and tournaments.",
      },
      {
        title: "Built for the field",
        text: "Role-based access, backup and restore, over-the-air firmware updates, and hands-free gamepad control.",
      },
    ],
    tags: ["softball", "computer-vision", "raspberry-pi", "esp32", "radar", "sports-tech"],
    status: "live",
    subdomain: "hypersync",
    repoUrl: "https://github.com/dwisnowski/HyperSync",
    image: "/projects/hypersync/base-timing.png",
    featured: true,
  },
];

export function projectUrl(project: Project): string | undefined {
  return project.subdomain ? `https://${project.subdomain}.${SITE_DOMAIN}` : undefined;
}

export function findProject(slug: string | undefined): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const allTags: string[] = [...new Set(projects.flatMap((p) => p.tags))].sort();
