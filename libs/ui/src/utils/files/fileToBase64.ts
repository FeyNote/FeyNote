/**
 * Converts a File to a base64 string.
 * Note: Careful with this. It's only suitable for very small files.
 */
export const fileToBase64 = (file: File) =>
  new Promise<string | undefined>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString());
    reader.onerror = reject;
  });
