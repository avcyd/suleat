/**
 * Image helpers for local paths and absolute http(s) URLs.
 */

const REMOTE_URL = /^https?:\/\//i;

export function isRemoteImageSrc(src: string) {
  return REMOTE_URL.test(src.trim());
}

/** True for site paths (`/…`) or absolute http(s) image URLs. */
export function isAllowedImageSrc(src: string) {
  const value = src.trim();
  if (!value) return false;
  if (value.startsWith("/")) return true;
  if (!REMOTE_URL.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const FALLBACK_IMAGE = "/images/landing/offer-latte.png";
