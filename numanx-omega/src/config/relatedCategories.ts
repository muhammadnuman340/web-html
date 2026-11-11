/**
 * Topically related categories, used for "Related categories" links on category
 * pages (React and prerendered HTML). Each list is ordered by relevance.
 */
export const RELATED_CATEGORIES: Record<string, string[]> = {
  length: ['area', 'volume', 'speed', 'astronomy', 'angle'],
  area: ['length', 'volume', 'textile', 'pressure'],
  volume: ['length', 'area', 'cooking', 'fuel', 'density'],
  mass: ['density', 'force', 'cooking', 'volume'],
  temp: ['energy', 'pressure', 'cooking'],
  time: ['speed', 'frequency', 'datatransfer'],
  speed: ['length', 'time', 'acceleration', 'fuel'],
  acceleration: ['speed', 'force', 'length'],
  force: ['mass', 'acceleration', 'pressure', 'torque'],
  pressure: ['force', 'area', 'temp'],
  energy: ['power', 'temp', 'electricity'],
  power: ['energy', 'electricity', 'torque'],
  electricity: ['power', 'energy', 'magnetism', 'frequency'],
  magnetism: ['electricity', 'frequency'],
  frequency: ['time', 'electricity', 'datatransfer'],
  data: ['datatransfer', 'frequency'],
  datatransfer: ['data', 'time', 'frequency'],
  angle: ['length', 'torque', 'astronomy'],
  torque: ['force', 'power', 'angle'],
  fuel: ['volume', 'speed', 'length'],
  density: ['mass', 'volume', 'pressure'],
  cooking: ['volume', 'mass', 'temp'],
  textile: ['area', 'mass', 'length'],
  astronomy: ['length', 'mass', 'time'],
  flow: ['volume', 'time', 'pressure', 'speed'],
  illuminance: ['energy', 'power', 'area'],
  viscosity: ['density', 'pressure', 'flow', 'force'],
  typography: ['length', 'area', 'data'],
}

export function getRelatedCategoryIds(catId: string): string[] {
  return RELATED_CATEGORIES[catId] ?? []
}
