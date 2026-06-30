/**
 * Best-effort ISO-country resolution from request headers.
 *
 * Works behind Vercel / Cloudflare / reverse proxies that stamp a country
 * header. On a bare-IP deploy (no proxy), this returns null — to populate
 * country analytics there, either front the app with a proxy that sets one of
 * the headers below, or plug in a GeoIP database.
 */

// Headers set by common proxies/CDNs, in priority order.
const COUNTRY_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-aws-ip-country",
  "x-cloudfront-country",
  "x-appengine-country",
  "x-geo-country",
  "geoip-country-code",
] as const;

type HeaderLike = { get(name: string): string | null };

export function getCountry(h: HeaderLike): string | null {
  for (const name of COUNTRY_HEADERS) {
    const v = h.get(name);
    const trimmed = v?.trim();
    // "ZZ" is the unknown-country sentinel some providers emit.
    if (trimmed && trimmed !== "ZZ") return trimmed;
  }
  return null;
}
