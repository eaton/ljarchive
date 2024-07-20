/**
 * Replace `<lj user="username" />` tags with classed a tags.
 */
function replaceLjUserTags(html: string, replacement?: string) {
  const pattern = /<lj user=['"]?(\w*)['"]?[^>]*>/gi;
  const template = replacement ?? `<a class="lj-user" href="https://livejournal.com/users/$1">$1</a>`;
  return html.replaceAll(pattern, template);
}
