export const copyToClipboard = (content: {
  html?: string;
  plaintext?: string;
}) => {
  if (content.plaintext) navigator.clipboard.writeText(content.plaintext);
  if (content.html) {
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': content.html,
      }),
    ]);
  }
};
