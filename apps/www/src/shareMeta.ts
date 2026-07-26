const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DESCRIPTION_MAX_LENGTH = 155;

const FALLBACK_DESCRIPTION =
  'User-created TTRPG content on FeyNote. Free note-taking app for D&D and tabletop RPG campaigns with statblocks, spells, and collaboration.';

export function isUuid(value: string | undefined): value is string {
  return !!value && UUID_PATTERN.test(value);
}

export function toExcerpt(text: string | undefined | null): string {
  const collapsed = (text ?? '').replace(/\s+/g, ' ').trim();
  if (!collapsed) return '';
  if (collapsed.length <= DESCRIPTION_MAX_LENGTH) return collapsed;

  const clipped = collapsed.slice(0, DESCRIPTION_MAX_LENGTH);
  const lastSpace = clipped.lastIndexOf(' ');
  const trimmed = lastSpace > 40 ? clipped.slice(0, lastSpace) : clipped;
  return `${trimmed.replace(/[.,;:!?]$/, '')}...`;
}

interface ShareMetaArgs {
  found: boolean;
  linkShared: boolean;
  title?: string | null;
  text?: string | null;
  url: URL;
  site: URL | undefined;
}

interface ShareMeta {
  title: string;
  description: string;
  robots: string;
  canonical: string | null;
}

export function buildShareMeta(args: ShareMetaArgs): ShareMeta {
  if (!args.found) {
    return {
      title: 'Not Found - FeyNote',
      description: 'This content is unavailable or is no longer shared.',
      robots: 'noindex, nofollow',
      canonical: null,
    };
  }

  if (!args.linkShared) {
    return {
      title: 'FeyNote',
      description: FALLBACK_DESCRIPTION,
      robots: 'noindex, nofollow',
      canonical: null,
    };
  }

  const name = args.title?.trim() || 'Untitled';
  const excerpt = toExcerpt(args.text);

  return {
    title: `${name} - FeyNote`,
    description: excerpt || `${name}. ${FALLBACK_DESCRIPTION}`,
    robots: 'index, follow, max-image-preview:large',
    canonical: args.site
      ? new URL(args.url.pathname, args.site).toString()
      : null,
  };
}
