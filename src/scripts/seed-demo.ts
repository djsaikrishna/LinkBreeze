/**
 * LinkBreeze Demo Seed Script
 * Run with: DEMO_MODE=true npx tsx src/scripts/seed-demo.ts
 * Populates a fresh database with demo data for the read-only demo instance.
 *
 * Showcases ALL v1.1.0 features: 9 theme presets, embed widgets,
 * link thumbnails, email capture, new social icons, full token system.
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "linkbreeze.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log("Seeding demo data (v1.1.0)...\n");

  // ─── Guard: skip if already seeded ──────────────
  const existingCount = db
    .select({ c: sql<number>`count(*)` })
    .from(schema.users)
    .get();
  if ((existingCount?.c ?? 0) > 0) {
    console.log("Database already has data. Skipping seed.");
    process.exit(0);
  }

  // ─── Admin user ─────────────────────────────────
  const passwordHash = bcrypt.hashSync("demo1234", 12);
  db.insert(schema.users).values({
    username: "demo",
    passwordHash,
  }).run();
  console.log("✓ Admin user created (demo / demo1234)");

  // ─── Settings ──────────────────────────────────
  const settings: Record<string, string> = {
    slug: "alex",
    title: "Alex Rivera — Links",
    description: "Content creator · Photographer · Always creating",
    footerText: "© 2026 Alex Rivera · Powered by LinkBreeze",
    emailCapture: "true",
  };
  for (const [key, value] of Object.entries(settings)) {
    db.insert(schema.settings).values({ key, value }).run();
  }
  console.log("✓ Settings created (email capture enabled)");

  // ─── Profile ───────────────────────────────────
  const socialLinks = JSON.stringify([
    { platform: "bluesky", url: "https://bsky.app/profile/alexrivera" },
    { platform: "youtube", url: "https://youtube.com/@alexrivera" },
    { platform: "instagram", url: "https://instagram.com/alexrivera" },
    { platform: "tiktok", url: "https://tiktok.com/@alexrivera" },
    { platform: "threads", url: "https://threads.net/@alexrivera" },
    { platform: "github", url: "https://github.com/alexrivera" },
  ]);

  db.insert(schema.profile).values({
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces",
    displayName: "Alex Rivera",
    bio: "Content creator · Photographer · Always creating · 6 of the 32 supported social platforms",
    badgeText: "Creator",
    socialLinks,
  }).run();
  console.log("✓ Profile created (6 social links — Bluesky, YouTube, Instagram, TikTok, Threads, GitHub)");

  // ─── Links ─────────────────────────────────────
  const links = [
    // Embed widget — YouTube
    {
      title: "Iceland Travel Vlog",
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      description: "4K travel film — embed widget demo",
      type: "embed",
      isHighlighted: false,
      orderIndex: 0,
      imageUrl: null,
    },
    // Highlighted link with thumbnail
    {
      title: "Watch my latest video",
      url: "https://youtube.com/watch?v=demo",
      description: "I traveled to Iceland and this happened...",
      type: "url",
      isHighlighted: true,
      orderIndex: 1,
      imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=400&fit=crop",
    },
    // Link with thumbnail
    {
      title: "My photography portfolio",
      url: "https://alexrivera.photos",
      description: "Landscape & street photography",
      type: "url",
      isHighlighted: false,
      orderIndex: 2,
      imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop",
    },
    // Spotify embed
    {
      title: "My editing playlist",
      url: "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn",
      description: "Lo-fi beats for editing sessions",
      type: "embed",
      isHighlighted: false,
      orderIndex: 3,
      imageUrl: null,
    },
    // Regular links
    {
      title: "Follow me on Instagram",
      url: "https://instagram.com/alexrivera",
      description: "@alexrivera · 125k followers",
      type: "url",
      isHighlighted: false,
      orderIndex: 4,
      imageUrl: null,
    },
    {
      title: "Join my newsletter",
      url: "https://alexrivera.com/newsletter",
      description: "Weekly creative tips — free",
      type: "url",
      isHighlighted: false,
      orderIndex: 5,
      imageUrl: null,
    },
    {
      title: "Shop my camera gear",
      url: "https://amazon.com/shop/alexrivera",
      description: "Everything I use to shoot",
      type: "url",
      isHighlighted: false,
      orderIndex: 6,
      imageUrl: null,
    },
    {
      title: "Contact me",
      url: "mailto:hello@alexrivera.com",
      description: "Business inquiries welcome",
      type: "email",
      isHighlighted: false,
      orderIndex: 7,
      imageUrl: null,
    },
  ];
  for (const link of links) {
    db.insert(schema.links).values({
      ...link,
      isActive: true,
      clicksCount: Math.floor(Math.random() * 500) + 50,
    }).run();
  }
  console.log(`✓ ${links.length} links created (2 embeds, 2 thumbnails, 1 highlighted)`);

  // ─── Themes — seed all 9 presets ────────────────
  // Base shape shared by all presets — sensible token-system defaults.
  const base = {
    isPreset: true as const,
    isActive: false as const,
    mode: "dark" as const,
    backgroundAngle: "160deg",
    overlayColor: "#000000",
    overlayOpacity: "40",
    fontScale: "100",
    fontWeight: "400",
    letterSpacing: "0",
    radius: "12px",
    buttonSize: "md",
    borderWidth: "1px",
    shadowStrength: "soft",
    hoverEffect: "lift",
    animationType: "lift" as const,
    containerWidth: "480px",
    alignment: "center",
    density: "normal",
    glow: "false",
    glowColor: "#533fd6",
    blur: "12px",
    noise: "false",
  };

  const presets = [
    // 1. Aurora — the animated flagship, ACTIVE for demo
    {
      ...base,
      name: "Aurora",
      backgroundType: "aurora",
      backgroundValue: "#0a0820",
      fontFamily: "inter",
      primaryColor: "#533fd6",
      secondaryColor: "#a78bfa",
      textColor: "#eceafe",
      mutedTextColor: "#a39ec9",
      cardBackground: "rgba(20,17,46,0.55)",
      cardBorderColor: "rgba(167,139,250,0.18)",
      linkStyle: "glass",
      animationType: "lift",
      glow: "false",
      blur: "16px",
      isActive: true,
    },
    // 2. Glassmorphism
    {
      ...base,
      name: "Glassmorphism",
      backgroundType: "gradient",
      backgroundValue: "#1e3a8a,#6d28d9,#db2777",
      backgroundAngle: "135deg",
      fontFamily: "sora",
      primaryColor: "#60a5fa",
      secondaryColor: "#c084fc",
      textColor: "#f0f4ff",
      mutedTextColor: "#94a3b8",
      cardBackground: "rgba(255,255,255,0.08)",
      cardBorderColor: "rgba(255,255,255,0.12)",
      linkStyle: "glass",
      blur: "20px",
      shadowStrength: "medium",
    },
    // 3. Neon Cyberpunk
    {
      ...base,
      name: "Neon Cyberpunk",
      backgroundType: "solid",
      backgroundValue: "#0a0a0f",
      fontFamily: "jetbrains",
      primaryColor: "#00f0ff",
      secondaryColor: "#ff0080",
      textColor: "#e0e0ff",
      mutedTextColor: "#6a6a8a",
      cardBackground: "rgba(10,10,20,0.8)",
      cardBorderColor: "rgba(0,240,255,0.3)",
      linkStyle: "neon",
      radius: "4px",
      glow: "true",
      glowColor: "#00f0ff",
      hoverEffect: "glow",
      shadowStrength: "none",
    },
    // 4. Editorial Paper
    {
      ...base,
      name: "Editorial Paper",
      backgroundType: "solid",
      backgroundValue: "#faf8f3",
      mode: "light",
      fontFamily: "playfair",
      primaryColor: "#c2410c",
      secondaryColor: "#92400e",
      textColor: "#1c1917",
      mutedTextColor: "#78716c",
      cardBackground: "#ffffff",
      cardBorderColor: "#e7e5e4",
      linkStyle: "outline",
      radius: "0px",
      borderWidth: "2px",
      shadowStrength: "subtle",
      hoverEffect: "none",
    },
    // 5. Terminal Mono
    {
      ...base,
      name: "Terminal Mono",
      backgroundType: "solid",
      backgroundValue: "#0c0c0c",
      fontFamily: "jetbrains",
      primaryColor: "#00ff41",
      secondaryColor: "#008f11",
      textColor: "#00ff41",
      mutedTextColor: "#008f11",
      cardBackground: "#111111",
      cardBorderColor: "#00ff4133",
      linkStyle: "sharp",
      radius: "0px",
      borderWidth: "1px",
      shadowStrength: "none",
      hoverEffect: "none",
    },
    // 6. Pastel Soft
    {
      ...base,
      name: "Pastel Soft",
      backgroundType: "gradient",
      backgroundValue: "#fce7f3,#ddd6fe,#bfdbfe",
      backgroundAngle: "180deg",
      mode: "light",
      fontFamily: "dm-sans",
      primaryColor: "#c026d3",
      secondaryColor: "#7c3aed",
      textColor: "#3b0764",
      mutedTextColor: "#9333ea",
      cardBackground: "rgba(255,255,255,0.7)",
      cardBorderColor: "rgba(192,38,211,0.15)",
      linkStyle: "pill",
      radius: "9999px",
      shadowStrength: "soft",
    },
    // 7. Brutalist
    {
      ...base,
      name: "Brutalist",
      backgroundType: "solid",
      backgroundValue: "#ffff00",
      mode: "light",
      fontFamily: "space-grotesk",
      primaryColor: "#000000",
      secondaryColor: "#ff0000",
      textColor: "#000000",
      mutedTextColor: "#333333",
      cardBackground: "#ffffff",
      cardBorderColor: "#000000",
      linkStyle: "sharp",
      radius: "0px",
      borderWidth: "3px",
      shadowStrength: "none",
      hoverEffect: "lift",
      letterSpacing: "1",
      fontWeight: "700",
    },
    // 8. Retro Sunset
    {
      ...base,
      name: "Retro Sunset",
      backgroundType: "gradient",
      backgroundValue: "#2d1b69,#ff006e,#ffbe0b",
      backgroundAngle: "160deg",
      fontFamily: "bebas",
      primaryColor: "#ffbe0b",
      secondaryColor: "#fb5607",
      textColor: "#fff8e1",
      mutedTextColor: "#ffd54f",
      cardBackground: "rgba(0,0,0,0.4)",
      cardBorderColor: "rgba(255,190,11,0.3)",
      linkStyle: "rounded",
      radius: "8px",
      glow: "true",
      glowColor: "#ffbe0b",
      letterSpacing: "2",
    },
    // 9. Minimal Light
    {
      ...base,
      name: "Minimal Light",
      backgroundType: "solid",
      backgroundValue: "#ffffff",
      mode: "light",
      fontFamily: "outfit",
      primaryColor: "#6366f1",
      secondaryColor: "#818cf8",
      textColor: "#1e293b",
      mutedTextColor: "#64748b",
      cardBackground: "#ffffff",
      cardBorderColor: "#e2e8f0",
      linkStyle: "rounded",
      radius: "12px",
      borderWidth: "1px",
      shadowStrength: "subtle",
      hoverEffect: "lift",
    },
  ];

  for (const preset of presets) {
    db.insert(schema.themes).values(preset).run();
  }
  console.log(`✓ ${presets.length} theme presets created (Aurora active)`);

  // ─── Fake email subscribers ────────────────────
  const subscriberEmails = [
    "fan1@example.com", "subscriber2@example.com", "creative@example.com",
    "photographer@example.com", "follower@example.com", "newsletter@example.com",
    "artlover@example.com", "wanderlust@example.com",
  ];
  for (const email of subscriberEmails) {
    db.insert(schema.subscribers).values({ email }).run();
  }
  console.log(`✓ ${subscriberEmails.length} email subscribers created`);

  // ─── Fake analytics (last 7 days) ──────────────
  const referrers = [null, "https://instagram.com", "https://tiktok.com", "https://youtube.com", null, "https://google.com", null, "https://bsky.app"];
  const devices = ["mobile", "mobile", "desktop", "mobile", "tablet"];

  for (let day = 6; day >= 0; day--) {
    const viewsCount = Math.floor(Math.random() * 80) + 30;
    for (let v = 0; v < viewsCount; v++) {
      const hash = Math.random().toString(36).substring(2, 18);
      db.insert(schema.analyticsPageviews).values({
        visitorHash: hash,
        referrer: referrers[Math.floor(Math.random() * referrers.length)],
        deviceType: devices[Math.floor(Math.random() * devices.length)],
        country: null,
      }).run();
    }
  }
  console.log("✓ Analytics data generated (7 days)");

  // Clicks on links
  const allLinks = db.select().from(schema.links).all();
  for (let day = 6; day >= 0; day--) {
    for (const link of allLinks) {
      const clickCount = Math.floor(Math.random() * 20) + 2;
      for (let c = 0; c < clickCount; c++) {
        const hash = Math.random().toString(36).substring(2, 18);
        db.insert(schema.analyticsClicks).values({
          linkId: link.id,
          visitorHash: hash,
          referrer: referrers[Math.floor(Math.random() * referrers.length)],
        }).run();
      }
    }
  }
  console.log("✓ Click analytics generated");

  console.log("\n✅ Demo seed complete (v1.1.0)!");
  console.log("   Admin: demo / demo1234");
  console.log("   Public page: /alex");
  console.log("   Features showcased:");
  console.log("     - 9 theme presets (Aurora, Glassmorphism, Neon, Editorial,");
  console.log("       Terminal, Pastel, Brutalist, Retro, Minimal)");
  console.log("     - 2 embed widgets (YouTube, Spotify)");
  console.log("     - 2 link thumbnails (Unsplash images)");
  console.log("     - Email capture enabled (8 subscribers)");
  console.log("     - 6 social links (Bluesky, YouTube, Instagram, TikTok, Threads, GitHub)");
  console.log("     - 8 links (highlighted, regular, email type)");
}

seed().catch(console.error);
