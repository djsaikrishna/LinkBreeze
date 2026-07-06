import type { LinkRow, ProfileRow } from "@/server/queries";
import type { ThemeInput } from "@/lib/theme-tokens";

export type LinkCardTheme = ThemeInput;

/** Escape attribute/HTML text for safe inline-HTML injection (output encoding). */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Pure builder for a public link card's HTML (zero client JS).
 * All user-controlled fields (title, description, url) pass through esc()
 * before injection; the click beacon is fired from an inline onclick.
 *
 * Styling now consumes CSS custom properties (--lb-*) set by theme-tokens.
 * No hardcoded colors, radii, or shadows.
 */
export function buildLinkCardHtml(
  link: LinkRow,
  _profile: Pick<ProfileRow, "displayName">,
  theme: LinkCardTheme,
  index: number,
  staggerMs = 60,
): string {
  const linkStyle = theme.linkStyle || "glass";
  const hoverEffect = theme.hoverEffect || theme.animationType || "lift";

  // Neon style: glowing border
  const isNeon = linkStyle === "neon";
  const isGlass = linkStyle === "glass";

  const border = link.isHighlighted
    ? `var(--lb-border-width) solid var(--lb-accent)`
    : isNeon
      ? `var(--lb-border-width) solid var(--lb-accent)`
      : `var(--lb-border-width) solid var(--lb-card-border)`;

  const hoverTransform =
    hoverEffect === "scale" ? "scale(1.02)"
    : hoverEffect === "glow" ? "none"
    : hoverEffect === "lift" || hoverEffect === "scale" ? "translateY(-3px)"
    : "none";

  const hoverShadow =
    isNeon || hoverEffect === "glow"
      ? `0 0 24px ${isNeon ? "var(--lb-accent)" : "var(--lb-glow)"}`
      : "var(--lb-shadow)";

  const reveal =
    theme.animationType === "none"
      ? ""
      : `animation: aurora-rise 0.5s cubic-bezier(0.16,1,0.3,1) both; animation-delay:${index * staggerMs}ms;`;

  const highlightDot = link.isHighlighted
    ? `<span aria-hidden="true" style="display:inline-block;width:6px;height:6px;border-radius:9999px;background:var(--lb-accent);margin-right:8px;flex-shrink:0"></span>`
    : "";

  const description = link.description
    ? `<p style="font-size:var(--lb-font-size);opacity:.7;margin:2px 0 0">${esc(link.description)}</p>`
    : "";

  const title = esc(link.title);
  const href = esc(link.url);
  const isExternal = href.startsWith("http://") || href.startsWith("https://");
  const targetAttr = isExternal ? ` target="_blank" rel="noopener noreferrer nofollow"` : "";

  const clickHandler = `navigator.sendBeacon('/api/track', JSON.stringify({type:'click',linkId:${link.id}}))`;

  const imageUrl = link.imageUrl ?? "";
  const hasImage = !!imageUrl;

  // Thumbnail rendered as a full-bleed image at the top of the card.
  // The card's overflow:hidden clips it to the card's border-radius.
  const image = hasImage
    ? `<img src="${esc(imageUrl)}" alt="" loading="lazy" style="display:block;width:100%;height:auto;max-height:220px;object-fit:cover" />`
    : "";

  // Thumbnail cards need overflow:hidden so the image clips to the card radius.
  const overflow = hasImage ? `overflow:hidden;` : "";

  // Backdrop blur only for glass / neon styles
  const backdropBlur = isGlass || isNeon
    ? `backdrop-filter:blur(var(--lb-blur));-webkit-backdrop-filter:blur(var(--lb-blur));`
    : "";

  // Content row (title + description + arrow) — always a flex row.
  const contentRow = `<div style="display:flex;align-items:center;padding:var(--lb-btn-padding-y) var(--lb-btn-padding-x)">
    <span style="display:flex;flex-direction:column;flex:1;min-width:0">
      <span style="display:flex;align-items:center;font-weight:var(--lb-font-weight);font-size:calc(var(--lb-font-size) + 1px);letter-spacing:var(--lb-letter-spacing)">${highlightDot}${title}</span>
      ${description}
    </span>
    <span aria-hidden="true" style="margin-left:10px;opacity:.6;font-size:18px;color:var(--lb-accent)">&#8599;</span>
  </div>`;

  // Layout differs: cards with thumbnail use block layout (image on top,
  // content row below). Cards without thumbnail use flex directly on the <a>.
  if (hasImage) {
    return `<a
  href="${href}"${targetAttr}
  onclick="${clickHandler}"
  style="
    display:block;text-decoration:none;width:100%;box-sizing:border-box;
    margin:0 0 var(--lb-spacing);
    background:var(--lb-card-bg);border:${border};border-radius:var(--lb-card-radius);
    color:var(--lb-text);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;
    ${backdropBlur}${overflow}${reveal}
  "
  onmouseover="this.style.transform='${hoverTransform}';this.style.boxShadow='${hoverShadow}';this.style.borderColor='var(--lb-accent)'"
  onmouseout="this.style.transform='none';this.style.boxShadow='none';this.style.borderColor='${isNeon ? "var(--lb-accent)" : "var(--lb-card-border)"}'"
>
  ${image}
  ${contentRow}
</a>`;
  }

  return `<a
  href="${href}"${targetAttr}
  onclick="${clickHandler}"
  style="
    display:flex;align-items:center;text-decoration:none;width:100%;box-sizing:border-box;
    padding:var(--lb-btn-padding-y) var(--lb-btn-padding-x);margin:0 0 var(--lb-spacing);
    background:var(--lb-card-bg);border:${border};border-radius:var(--lb-card-radius);
    color:var(--lb-text);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;
    ${backdropBlur}${reveal}
  "
  onmouseover="this.style.transform='${hoverTransform}';this.style.boxShadow='${hoverShadow}';this.style.borderColor='var(--lb-accent)'"
  onmouseout="this.style.transform='none';this.style.boxShadow='none';this.style.borderColor='${isNeon ? "var(--lb-accent)" : "var(--lb-card-border)"}'"
>
  <span style="display:flex;flex-direction:column;flex:1;min-width:0">
    <span style="display:flex;align-items:center;font-weight:var(--lb-font-weight);font-size:calc(var(--lb-font-size) + 1px);letter-spacing:var(--lb-letter-spacing)">${highlightDot}${title}</span>
    ${description}
  </span>
  <span aria-hidden="true" style="margin-left:10px;opacity:.6;font-size:18px;color:var(--lb-accent)">&#8599;</span>
</a>`;
}
