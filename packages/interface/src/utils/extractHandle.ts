/**
 * Extracts the handle/username from a Twitter/X or GitHub URL
 * If the input is already a handle (no https://), returns it as-is
 *
 * @param value - The input value (can be a handle or full URL)
 * @param platform - The platform type ('twitter' or 'github')
 * @returns The extracted handle/username
 */
export function extractHandle(value: string, platform: "twitter" | "github"): string {
  if (!value) {
    return value;
  }

  // If it doesn't start with https://, assume it's already a handle
  if (!value.startsWith("https://") && !value.startsWith("http://")) {
    return value;
  }

  try {
    const url = new URL(value);
    const { pathname } = url;

    // Remove leading and trailing slashes
    const cleanPath = pathname.replace(/^\/+|\/+$/g, "");

    if (platform === "twitter") {
      // Handle x.com and twitter.com domains
      if (
        url.hostname === "x.com" ||
        url.hostname === "twitter.com" ||
        url.hostname === "www.x.com" ||
        url.hostname === "www.twitter.com"
      ) {
        // Extract the username (first part of the path)
        const username = cleanPath.split("/")[0];
        return username || value;
      }
    } else if (url.hostname === "github.com" || url.hostname === "www.github.com") {
      // Handle github.com domain - Extract the username (first part of the path)
      const username = cleanPath.split("/")[0];
      return username || value;
    }

    // If URL doesn't match expected patterns, return original value
    return value;
  } catch (error) {
    // If URL parsing fails, return original value
    return value;
  }
}
