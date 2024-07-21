/**
 * Given a markup string, returns a key/value collection of markup fragments
 * and the associated usernames; these can be used for quick search and replace
 * operations.
 */
export function parseUserTags(html: string) {
  const matches = html.matchAll(/<lj user=['"]?(\w*)['"]?[^>]*>/gi) ?? [];
  return Object.fromEntries([...matches].map(m => [m[0], m[1]]));
}
