// Shared with browser-side schemas; never import server mail code into a form.
export function singleLine(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f\u2028\u2029]/g, '').replace(/\s+/g, ' ').trim();
}
