/**
 * Get authorization headers for The Graph API requests
 * @returns headers object with Authorization if API key is configured
 */
export function getGraphAuthHeaders(): Record<string, string> {
  const apiKey = process.env.NEXT_PUBLIC_THEGRAPH_API_KEY;

  if (!apiKey) {
    return {};
  }

  return {
    Authorization: `Bearer ${apiKey}`,
  };
}
