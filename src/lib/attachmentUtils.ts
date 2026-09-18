export function isImageAttachment(contentType: string): boolean {
  return contentType.startsWith('image/');
}
