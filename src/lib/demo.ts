/**
 * Demo mode guard. When DEMO_MODE=true, all mutations are blocked.
 * Returns an error message string if demo mode is active, null otherwise.
 */
export function demoBlock(): string | null {
  if (process.env.DEMO_MODE === "true") {
    return "This is a read-only demo. Deploy your own instance to make changes.";
  }
  return null;
}

export const isDemoMode = process.env.DEMO_MODE === "true";
