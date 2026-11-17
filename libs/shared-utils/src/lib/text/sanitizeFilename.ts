const UNSAFE_CHARS = /[/\\:*?"<>|\p{Cc}]/gu;
const TRAILING_DOTS_SPACES = /[.\s]+$/;
const LEADING_DOTS_SPACES = /^[.\s]+/;
const RESERVED_WINDOWS_NAMES = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\.|$)/i;
const MAX_UTF8_BYTES = 200;

export const sanitizeFilename = (name: string, fallback: string): string => {
  let sanitized = name
    .replace(UNSAFE_CHARS, '_')
    .replace(LEADING_DOTS_SPACES, '')
    .replace(TRAILING_DOTS_SPACES, '');

  const encoder = new TextEncoder();
  if (encoder.encode(sanitized).length > MAX_UTF8_BYTES) {
    let truncated = '';
    let byteCount = 0;
    for (const character of sanitized) {
      byteCount += encoder.encode(character).length;
      if (byteCount > MAX_UTF8_BYTES) break;
      truncated += character;
    }
    sanitized = truncated;
  }

  sanitized = sanitized.replace(RESERVED_WINDOWS_NAMES, '$1_$2');

  return sanitized || fallback;
};
