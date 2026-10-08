export const SITE_DOMAIN = "wildideazone.com";

export type ProjectStatus = "idea" | "building" | "live";

export interface Project {
  /** Used in the URL: /projects/:slug */
  slug: string;
  title: string;
  tagline: string;
  description: string;
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
    slug: "garage-weather-station",
    title: "Garage Weather Station",
    tagline: "ESP32 sensors streaming backyard weather to a live dashboard.",
    description:
      "A solar-powered ESP32 sensor stack measuring temperature, humidity, pressure, wind, and rainfall. Readings are pushed over Wi-Fi to an edge API and charted in real time.",
    tags: ["electronics", "esp32", "iot", "solar"],
    status: "building",
    subdomain: "weather",
    featured: true,
  },
  {
    slug: "desktop-cnc",
    title: "Desktop CNC Router",
    tagline: "A from-scratch 3-axis CNC built from printed parts and aluminum extrusion.",
    description:
      "Design files, wiring diagrams, and firmware notes for a compact CNC router that cuts wood, plastics, and PCBs. Includes the GRBL configuration and lessons learned from the first hundred cuts.",
    tags: ["3d-printing", "cnc", "fabrication"],
    status: "live",
    subdomain: "cnc",
    featured: true,
  },
  {
    slug: "home-lab-rack",
    title: "Home Lab Rack",
    tagline: "A tiny rack of mini PCs running self-hosted everything.",
    description:
      "A 10-inch rack housing mini PCs, a managed switch, and a NAS. Covers the network layout, virtualization setup, backups, and monitoring.",
    tags: ["home-lab", "networking", "self-hosting"],
    status: "live",
    subdomain: "lab",
    featured: true,
  },
  {
    slug: "robot-arm",
    title: "Voice-Controlled Robot Arm",
    tagline: "A servo arm that takes orders from a local speech model.",
    description:
      "An early-stage experiment pairing a 6-DOF servo arm with on-device speech recognition so it can pick and place objects by voice command.",
    tags: ["robotics", "ai", "electronics"],
    status: "idea",
    subdomain: "robots",
  },
];

export function projectUrl(project: Project): string | undefined {
  return project.subdomain ? `https://${project.subdomain}.${SITE_DOMAIN}` : undefined;
}

export function findProject(slug: string | undefined): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const allTags: string[] = [...new Set(projects.flatMap((p) => p.tags))].sort();
