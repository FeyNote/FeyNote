import { getApiUrls } from '../getApiUrls';

export const getFileRedirectUrl = (args: {
  fileId: string;
  sessionToken?: string;
}) => {
  const url = new URL(
    `${getApiUrls().rest}/file/${args.fileId}/redirect`,
    window.location.origin,
  );
  // TODO: really don't love appending the token to the url here since the user can right click copy and share it to a friend, but if they do that I guess that's their fault?!
  if (args.sessionToken) url.searchParams.append('token', args.sessionToken);

  return url;
};
