import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { getActiveProfile, getActiveTheme } from "@/server/queries";

export const runtime = "nodejs";
export const alt = "LinkBreeze page";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Branded social preview image for the public page. Next auto-wires the
 * generated file as og:image and twitter:image. Uses the active theme's
 * palette so the preview matches the page.
 */
export default async function Image() {
  const h = await headers();
  const host = (h.get("x-forwarded-host") || h.get("host") || "localhost").toString();
  const proto = (h.get("x-forwarded-proto") || "http").toString();
  const origin = `${proto}://${host}`;

  const profile = await getActiveProfile();
  const theme = await getActiveTheme();

  const name = profile?.displayName || "LinkBreeze";
  const bio = profile?.bio || "All my links in one place";
  const textColor = theme?.textColor || "#eceafe";
  const primary = theme?.primaryColor || "#533fd6";
  const parts = (theme?.backgroundValue || "#0f0c29,#14112e").split(",");
  const bgA = parts[0] || "#0f0c29";
  const bgB = parts[1] || "#14112e";

  const rawAvatar = profile?.avatarUrl || null;
  const avatarSrc = rawAvatar
    ? rawAvatar.startsWith("http")
      ? rawAvatar
      : `${origin}${rawAvatar.startsWith("/") ? "" : "/"}${rawAvatar}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, ${bgA} 0%, ${bgB} 100%)`,
          padding: 80,
        }}
      >
        {avatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarSrc}
            width={140}
            height={140}
            alt=""
            style={{
              display: "flex",
              borderRadius: 9999,
              marginBottom: 44,
              objectFit: "cover",
              border: `4px solid ${primary}`,
            }}
          />
        ) : null}
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            color: textColor,
            letterSpacing: -2,
            lineHeight: 1.05,
            marginBottom: 18,
          }}
        >
          {name}
        </div>
        <div style={{ display: "flex", fontSize: 32, color: textColor, opacity: 0.7 }}>
          {bio}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 52,
            fontSize: 24,
            color: primary,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 56,
              height: 8,
              background: primary,
              borderRadius: 9999,
              marginRight: 16,
            }}
          />
          LinkBreeze
        </div>
      </div>
    ),
    { ...size }
  );
}
