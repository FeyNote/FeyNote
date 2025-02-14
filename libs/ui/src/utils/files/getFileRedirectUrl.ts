import { getApiUrls } from '../getApiUrls';

export const getFileRedirectUrl = (args: {
  fileId: string;
  sessionToken?: string;
}) => {
  const url = new URL(
    `${getApiUrls().rest}/file/${args.fileId}/redirect`,
    window.location.origin,
  );
  if (args.sessionToken) url.searchParams.append('token', args.sessionToken);

  return url;
};
