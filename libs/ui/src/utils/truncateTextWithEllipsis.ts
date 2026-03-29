export const truncateTextWithEllipsis = (
  text: string,
  maxPreviewLength: number,
) => {
  // We actually always want to show an ellipsis since the text can be of unknown length. We cut off the last character to give us a reason to show a "..."
  const maxLength =
    text.length <= maxPreviewLength ? text.length - 1 : maxPreviewLength;
  return text.slice(0, maxLength) + '\u2026';
};
