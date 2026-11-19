/**
 * URL slug normaliser shared by pair, category and blog pages.
 *
 * Kept out of src/config/pairEditorial.ts on purpose: pages that only need this
 * helper (CategoryLanding, BlogPost) would otherwise pull the whole pair
 * editorial data chunk (~114 KB uncompressed) into their bundle.
 */
export function cleanSlug(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
