import { describe, it, expect } from "vitest";
import { resolveBackground } from "@/lib/theme-tokens";

/**
 * Image-background overlay path. Zero coverage today; the audit found a
 * render bug in the alpha-hex construction (line 448-453 of theme-tokens).
 *
 * Desired behavior: an image background WITH an overlay should render as a
 * translucent color layer composited ON TOP of the image. That means a
 * 2-stop linear-gradient where BOTH stops are the overlay color at the
 * requested alpha, followed by the url().
 *
 *   linear-gradient(#0000007f, #0000007f), url('https://x/bg.jpg')
 *                ^^ alpha-encoded overlay color repeated ^^
 */
describe("resolveBackground — image with overlay", () => {
  it("renders an overlay as a uniform translucent layer over the image", () => {
    const out = resolveBackground({
      backgroundType: "image",
      backgroundImageUrl: "https://example.com/bg.jpg",
      overlayColor: "#000000",
      overlayOpacity: "0.5",
    });
    // Overlay color with 50% alpha: 0.5 * 255 = 127.5 → rounds to 128 = 0x80
    const overlayAlpha = "#00000080";
    expect(out).toBe(
      `linear-gradient(${overlayAlpha}, ${overlayAlpha}), url('https://example.com/bg.jpg')`,
    );
  });

  it("renders a 100% opacity overlay as a fully opaque layer", () => {
    const out = resolveBackground({
      backgroundType: "image",
      backgroundImageUrl: "https://example.com/bg.jpg",
      overlayColor: "#1a1a2e",
      overlayOpacity: "1",
    });
    // 1 * 255 = 255 = 0xff
    expect(out).toBe(
      `linear-gradient(#1a1a2eff, #1a1a2eff), url('https://example.com/bg.jpg')`,
    );
  });

  it("renders no overlay when opacity is 0", () => {
    const out = resolveBackground({
      backgroundType: "image",
      backgroundImageUrl: "https://example.com/bg.jpg",
      overlayColor: "#000000",
      overlayOpacity: "0",
    });
    // 0 opacity = no overlay layer, just the image
    expect(out).toBe(`url('https://example.com/bg.jpg')`);
  });

  it("falls back to backgroundValue when no image URL is set", () => {
    const out = resolveBackground({
      backgroundType: "image",
      backgroundValue: "#1a1a2e",
      overlayColor: "#000000",
      overlayOpacity: "0.5",
    });
    expect(out).toBe("#1a1a2e");
  });
});
