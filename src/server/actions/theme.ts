"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { demoBlock } from "@/lib/demo";
import { customSchema } from "@/lib/theme-schema";
import {
  setActiveTheme,
  updateTheme,
  getActiveTheme,
  duplicateTheme,
  deleteTheme,
} from "@/server/queries";

export type ActionResult = { success: true } | { success: false; error: string };

export async function activateTheme(id: number): Promise<ActionResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  if (!(await getSession())) return { success: false, error: "Unauthorized" };
  if (typeof id !== "number" || Number.isNaN(id)) {
    return { success: false, error: "Invalid theme id" };
  }
  await setActiveTheme(id);
  revalidatePath("/theme");
  revalidatePath("/");
  return { success: true };
}

export async function customizeActiveTheme(formData: FormData): Promise<ActionResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  if (!(await getSession())) return { success: false, error: "Unauthorized" };

  const parsed = customSchema.safeParse({
    backgroundType: formData.get("backgroundType") || undefined,
    backgroundValue: formData.get("backgroundValue") || undefined,
    backgroundAngle: formData.get("backgroundAngle") || undefined,
    backgroundImageUrl: formData.get("backgroundImageUrl") || undefined,
    overlayColor: formData.get("overlayColor") || undefined,
    overlayOpacity: formData.get("overlayOpacity") || undefined,
    primaryColor: formData.get("primaryColor") || undefined,
    secondaryColor: formData.get("secondaryColor") || undefined,
    cardBackground: formData.get("cardBackground") || undefined,
    cardBorderColor: formData.get("cardBorderColor") || undefined,
    textColor: formData.get("textColor") || undefined,
    mutedTextColor: formData.get("mutedTextColor") || undefined,
    mode: formData.get("mode") || undefined,
    fontFamily: formData.get("fontFamily") || undefined,
    fontScale: formData.get("fontScale") || undefined,
    fontWeight: formData.get("fontWeight") || undefined,
    letterSpacing: formData.get("letterSpacing") || undefined,
    linkStyle: formData.get("linkStyle") || undefined,
    animationType: formData.get("animationType") || undefined,
    radius: formData.get("radius") || undefined,
    buttonSize: formData.get("buttonSize") || undefined,
    borderWidth: formData.get("borderWidth") || undefined,
    shadowStrength: formData.get("shadowStrength") || undefined,
    hoverEffect: formData.get("hoverEffect") || undefined,
    containerWidth: formData.get("containerWidth") || undefined,
    alignment: formData.get("alignment") || undefined,
    density: formData.get("density") || undefined,
    glow: formData.get("glow") || undefined,
    glowColor: formData.get("glowColor") || undefined,
    blur: formData.get("blur") || undefined,
    noise: formData.get("noise") || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const active = await getActiveTheme();
  if (!active) return { success: false, error: "No active theme" };

  const updates: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) updates[key] = value as string;
  }
  if (Object.keys(updates).length > 0) {
    await updateTheme(active.id, updates);
  }

  revalidatePath("/theme");
  revalidatePath("/");
  return { success: true };
}

export async function duplicateActiveTheme(name: string): Promise<ActionResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  if (!(await getSession())) return { success: false, error: "Unauthorized" };

  const active = await getActiveTheme();
  if (!active) return { success: false, error: "No active theme" };

  const trimmed = (name || "").trim().slice(0, 100);
  if (!trimmed) return { success: false, error: "Name is required" };

  const { themeNameExists } = await import("@/server/queries");
  if (await themeNameExists(trimmed)) {
    return { success: false, error: "A theme with this name already exists" };
  }

  await duplicateTheme(active.id, trimmed);
  revalidatePath("/theme");
  return { success: true };
}

export async function deleteCustomTheme(id: number): Promise<ActionResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };
  if (!(await getSession())) return { success: false, error: "Unauthorized" };
  if (typeof id !== "number" || Number.isNaN(id)) {
    return { success: false, error: "Invalid theme id" };
  }

  // Don't allow deleting presets or the active theme
  const active = await getActiveTheme();
  if (active?.id === id) {
    return { success: false, error: "Cannot delete the active theme" };
  }

  await deleteTheme(id);
  revalidatePath("/theme");
  return { success: true };
}
