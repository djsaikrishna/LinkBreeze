import { describe, it, expect } from "vitest";
import { buildLinkCardHtml } from "@/components/public/build-link-card";
import type { LinkRow, ProfileRow } from "@/server/queries";

const profile = { displayName: "Ada" } as Pick<ProfileRow, "displayName">;
const baseLink = {
  id: 1,
  title: "My Site",
  description: null,
  url: "https://example.com",
  isHighlighted: false,
} as unknown as LinkRow;

const theme = {
  textColor: "#eceafe",
  primaryColor: "#533fd6",
  linkStyle: "glass",
  animationType: "lift",
};

describe("buildLinkCardHtml", () => {
  it("escapes HTML in title and description", () => {
    const html = buildLinkCardHtml(
      { ...baseLink, title: 'A & B <c>' } as LinkRow,
      profile,
      theme,
      0,
    );
    expect(html).toContain("A &amp; B &lt;c&gt;");
  });

  it("opens http(s) links in a new tab, not mailto/tel", () => {
    expect(buildLinkCardHtml(baseLink, profile, theme, 0)).toContain('target="_blank"');
    const mail = buildLinkCardHtml(
      { ...baseLink, url: "mailto:x@y.z" } as LinkRow,
      profile,
      theme,
      0,
    );
    expect(mail).not.toContain('target="_blank"');
  });

  it("adds the highlight dot + accent border only when highlighted", () => {
    const plain = buildLinkCardHtml(baseLink, profile, theme, 0);
    expect(plain).not.toContain("background:var(--lb-accent);margin-right:8px");
    const hi = buildLinkCardHtml(
      { ...baseLink, isHighlighted: true } as LinkRow,
      profile,
      theme,
      0,
    );
    // Highlight dot uses the accent token
    expect(hi).toContain("background:var(--lb-accent)");
    // Static border for highlighted card uses accent, not card-border
    expect(hi).toContain("solid var(--lb-accent)");
  });

  it("includes a per-card stagger delay", () => {
    const html = buildLinkCardHtml(baseLink, profile, theme, 3, 60);
    expect(html).toContain("animation-delay:180ms"); // 3 * 60ms
  });

  it("omits the reveal animation when animationType is none", () => {
    const html = buildLinkCardHtml(baseLink, profile, { ...theme, animationType: "none" }, 2);
    expect(html).not.toContain("aurora-rise");
  });

  it("uses CSS custom properties instead of hardcoded colors", () => {
    const html = buildLinkCardHtml(baseLink, profile, theme, 0);
    expect(html).toContain("var(--lb-text)");
    expect(html).toContain("var(--lb-accent)");
    expect(html).toContain("var(--lb-card-bg)");
    expect(html).toContain("var(--lb-card-radius)");
  });

  it("applies neon styling when linkStyle is neon", () => {
    const html = buildLinkCardHtml(baseLink, profile, { ...theme, linkStyle: "neon" }, 0);
    expect(html).toContain("var(--lb-accent)");
  });
});
