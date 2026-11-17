/** Formats whole naira for display, e.g. 15000 → "₦15,000". */
export function formatPrice(naira: number): string {
  // Built by hand rather than with Intl currency formatting so the server and
  // the browser always produce exactly the same string.
  const withCommas = Math.round(naira)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `₦${withCommas}`;
}
