/** Wrap token for ImageMagick argv when values may contain spaces or quotes. */
export function quoteCliToken(value: string): string {
  const escaped = value.replace(/"/g, '\\"');
  return `"${escaped}"`;
}
