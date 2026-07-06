import { describe, it, expect } from "vitest";
import {
  resolveBackground,
  isAnimatedAurora,
  resolveThemeTokens,
  resolveFont,
  buildThemeStyleBlock,
} from "@/lib/theme-tokens";

describe("isAnimatedAurora", () => {
  it("returns true only for the aurora type", () => {
    expect(isAnimatedAurora({ backgroundType: "aurora" })).toBe(true);
    expect(isAnimatedAurora({ backgroundType: "gradient" })).toBe(false);
    expect(isAnimatedAurora({ backgroundType: null })).toBe(false);
    expect(isAnimatedAurora({})).toBe(false);
  });
});

describe("resolveBackground", () => {
  it("renders a solid background", () => {
    expect(
      resolveBackground({ backgroundType: "solid", backgroundValue: "#07060c" }),
    ).toBe("#07060c");
  });

  it("renders a multi-stop gradient", () => {
    const out = resolveBackground({
      backgroundType: "gradient",
      backgroundValue: "#1a1530,#2a2150",
    });
    expect(out).toBe("linear-gradient(160deg, #1a1530, #2a2150)");
  });

  it("renders a single-value gradient as a flat color", () => {
    expect(
      resolveBackground({ backgroundType: "gradient", backgroundValue: "#0a0820" }),
    ).toBe("#0a0820");
  });

  it("defaults to the night base when value is missing", () => {
    expect(resolveBackground({ backgroundType: "gradient" })).toBe("#0a0820");
    expect(resolveBackground({})).toBe("#0a0820");
  });

  it("treats pattern like a flat color", () => {
    expect(
      resolveBackground({ backgroundType: "pattern", backgroundValue: "#111" }),
    ).toBe("#111");
  });

  it("renders a radial gradient", () => {
    const out = resolveBackground({
      backgroundType: "radial",
      backgroundValue: "#533fd6,#0a0820",
    });
    expect(out).toBe("radial-gradient(circle at 50% 30%, #533fd6, #0a0820)");
  });

  it("renders a mesh gradient with multiple layers", () => {
    const out = resolveBackground({
      backgroundType: "mesh",
      backgroundValue: "#533fd6,#a78bfa,#0a0820",
    });
    expect(out).toContain("radial-gradient(at 20%");
    expect(out).toContain("radial-gradient(at 45%");
    expect(out).toContain("#0a0820");
  });

  it("respects a custom background angle", () => {
    const out = resolveBackground({
      backgroundType: "gradient",
      backgroundValue: "#aaa,#bbb",
      backgroundAngle: "90deg",
    });
    expect(out).toBe("linear-gradient(90deg, #aaa, #bbb)");
  });
});

describe("resolveThemeTokens", () => {
  it("produces CSS custom properties", () => {
    const { cssVars } = resolveThemeTokens({
      primaryColor: "#ff0000",
      textColor: "#00ff00",
    });
    expect(cssVars["--lb-accent"]).toBe("#ff0000");
    expect(cssVars["--lb-text"]).toBe("#00ff00");
  });

  it("resolves card radius from linkStyle when radius is auto", () => {
    const { cssVars } = resolveThemeTokens({ linkStyle: "pill" });
    expect(cssVars["--lb-card-radius"]).toBe("9999px");
  });

  it("lets explicit radius override linkStyle default", () => {
    const { cssVars } = resolveThemeTokens({ linkStyle: "pill", radius: "8px" });
    expect(cssVars["--lb-card-radius"]).toBe("8px");
  });

  it("resolves button padding from buttonSize", () => {
    const sm = resolveThemeTokens({ buttonSize: "sm" });
    expect(sm.cssVars["--lb-btn-padding-y"]).toBe("10px");

    const lg = resolveThemeTokens({ buttonSize: "lg" });
    expect(lg.cssVars["--lb-btn-padding-x"]).toBe("24px");
  });

  it("enables glow when glow=true", () => {
    const { cssVars } = resolveThemeTokens({ glow: true, glowColor: "#ff00ff" });
    expect(cssVars["--lb-glow"]).toContain("24px");
    expect(cssVars["--lb-glow"]).toContain("#ff00ff");
  });

  it("produces no glow by default", () => {
    const { cssVars } = resolveThemeTokens({});
    expect(cssVars["--lb-glow"]).toBe("none");
  });

  it("includes gradient-shift keyframes for animated backgrounds", () => {
    const { keyframes } = resolveThemeTokens({ backgroundType: "aurora" });
    expect(keyframes).toContain("lb-gradient-shift");
  });
});

describe("resolveFont", () => {
  it("resolves known font identifiers", () => {
    expect(resolveFont("inter")).toContain("var(--font-sans)");
    expect(resolveFont("poppins")).toContain("var(--lb-font-poppins)");
    expect(resolveFont("jetbrains")).toContain("var(--lb-font-jetbrains)");
  });

  it("falls back to the raw value for unknown fonts", () => {
    expect(resolveFont("var(--font-sans), sans-serif")).toBe(
      "var(--font-sans), sans-serif",
    );
  });

  it("uses default font for empty/null", () => {
    expect(resolveFont(null)).toContain("var(--font-sans)");
    expect(resolveFont("")).toContain("var(--font-sans)");
  });
});

describe("buildThemeStyleBlock", () => {
  it("wraps tokens in a :root block", () => {
    const css = buildThemeStyleBlock({ primaryColor: "#abc" });
    expect(css).toContain(":root {");
    expect(css).toContain("--lb-accent: #abc;");
  });
});
