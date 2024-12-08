import { getApiUrls } from '../getApiUrls';

export const getFileRedirectUrl = (args: {
  fileId: string;
  shareToken?: string;
  sessionToken?: string;
}) => {
  const url = new URL(
    `${getApiUrls().rest}/file/${args.fileId}/redirect`,
    window.location.origin,
  );
  if (args.shareToken) url.searchParams.append('shareToken', args.shareToken);
  if (args.sessionToken) url.searchParams.append('token', args.sessionToken);

  return url;
};
