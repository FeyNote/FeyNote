export function capitalize(text: string) {
  if (!text) return '';

  return text.charAt(0).toLocaleUpperCase() + text.slice(1).toLocaleLowerCase();
}
