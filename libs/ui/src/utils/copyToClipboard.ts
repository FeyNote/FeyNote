export const copyToClipboard = (content: {
  html?: string;
  plaintext?: string;
}) => {
  const blobs: Record<string, Blob> = {};
  if (content.plaintext) {
    blobs['text/plain'] = new Blob([content.plaintext], {
      type: 'text/plain',
    });
  }
  if (content.html) {
    blobs['text/html'] = new Blob([content.html], { type: 'text/html' });
  }
  if (Object.keys(blobs).length) {
    navigator.clipboard.write([new ClipboardItem(blobs)]);
  }
};
