import type { MetadataRoute } from "next";
import { headers } from "next/headers";

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

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await getOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/login",
          "/setup",
          "/dashboard",
          "/links",
          "/profile",
          "/settings",
          "/theme",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
