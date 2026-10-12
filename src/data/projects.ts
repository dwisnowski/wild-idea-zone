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
  {
    slug: "morse-code-trainer",
    title: "Morse Code Trainer",
    tagline: "Learn CW on a PCB-style dichotomous Morse chart: key dits and dahs, drill ham shorthand, and listen to real-world cadences.",
    description: `An interactive take on the Trainer Card Pro: a vector PCB card that lays out every letter, digit, and prosign as a dit/dah decision tree. Hold Space or the on-screen key and the LED path lights up as you send, with a Web Audio CW tone (or mute it for silent practice).

Practice mode turns common CW shorthand (abbreviations, Q-codes, signal reports, and full QSO lines) into Monkeytype-style send drills with WPM, accuracy, and a list of the characters you missed. Listen mode keys phrases for you at 5 to 30 WPM with standard or Farnsworth timing, different fists, and contest or ragchew cadences.

It runs entirely in the browser, works on a phone, and saves settings and personal bests locally.`,
    highlights: [
      {
        title: "Dichotomous chart",
        text: "A canvas PCB card covering A–Z, 0–9, and the AR, BT, KN, and SK prosigns, with the keyed path lit in green dits and red dahs.",
      },
      {
        title: "Free key",
        text: "Hold-to-key or tap Dit / Dah, with timing-based decoding, a live decoded message, and Record / Play to audit your fist.",
      },
      {
        title: "Practice drills",
        text: "Send CW shorthand and QSO phrases by phrase count or time, with stop-on-error, typo feedback, hints, and a WPM-over-time chart.",
      },
      {
        title: "Listen mode",
        text: "Hear and watch phrases keyed with PARIS or Farnsworth timing, iambic, bug, or straight-key fists, and a to-scale rhythm strip.",
      },
      {
        title: "Code chart",
        text: "On wide screens, a live reference chart highlights what you keyed, what is playing, and what to send next. Click any row to hear it.",
      },
    ],
    tags: ["ham-radio", "morse-code", "web-audio", "education"],
    status: "live",
    subdomain: "morse",
    repoUrl: "https://github.com/dwisnowski/morse-code-trainer",
    image: "/projects/morse-code-trainer/free-key.jpg",
    featured: true,
  },
  {
    slug: "boing-boing",
    title: "Boing Boing",
    tagline: "A physics downhill racer: launch a spring-footed robot down jagged mountains and limp across the finish, even as a tin head.",
    description: `A browser game inspired by Kamikaze Robots. Your robot bounces down procedurally generated mountains, and landing feet-down on the slope keeps the momentum going. Holding the brace steadies your spin but bleeds speed, and a well-timed pump right before impact triggers a BOOST BOING.

Bad landings rip off limbs one at a time: arm, arm, leg, leg. With only a torso left, the next slam launches the tin head free, and the run ends when it hits the ground.

Climb the tournament ladder or take a quick race, and spend the microchips you earn on upgrades.`,
    highlights: [
      {
        title: "Spring physics",
        text: "Feet-down landings bounce and build speed, while crashes tumble the robot down the slope.",
      },
      {
        title: "Limb loss",
        text: "Each bad landing sheds an arm or leg, ending in a desperation tin-head launch.",
      },
      {
        title: "Tournament and quick race",
        text: "A ladder of mountain stages with progress saved locally, or a single random mountain.",
      },
      {
        title: "Upgrades",
        text: "Spend microchips on Stamina, Spin, Jump Springs, and Explosion.",
      },
    ],
    tags: ["game", "physics", "canvas"],
    status: "live",
    subdomain: "boing",
    repoUrl: "https://github.com/dwisnowski/boing-boing",
    image: "/projects/boing-boing/race.jpg",
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
