import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getSetting } from "@/server/queries";

/** Derive the public origin from request headers (same pattern as the public page). */
async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = (
    h.get("x-forwarded-host") ||
    h.get("host") ||
    "localhost"
  ).toString();
  const proto = (h.get("x-forwarded-proto") || "http").toString();
  return `${proto}://${host}`;
}

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [origin, slug] = await Promise.all([
    getOrigin(),
    getSetting("slug"),
  ]);

  // LinkBreeze is single-user: there is exactly one public page.
  const publicSlug = slug || "u";

  return [
    {
      url: `${origin}/${publicSlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
