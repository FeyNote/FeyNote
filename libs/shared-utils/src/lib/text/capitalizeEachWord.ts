import { capitalize } from './capitalize';

export function capitalizeEachWord(text: string) {
  return text
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}
