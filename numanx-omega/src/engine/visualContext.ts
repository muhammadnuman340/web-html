export interface VisualRef {
  value: number
  unit: string
  label: string
  emoji: string
}

// Real-world comparisons keyed by category
export const VISUAL_CONTEXT: Record<string, VisualRef[]> = {
  length: [
    { value: 0.001, unit: 'm', label: 'thickness of a credit card', emoji: '💳' },
    { value: 0.01, unit: 'm', label: 'width of a fingernail', emoji: '💅' },
    { value: 0.0254, unit: 'm', label: 'width of a US quarter', emoji: '🪙' },
    { value: 0.1, unit: 'm', label: 'width of a smartphone', emoji: '📱' },
    { value: 0.3, unit: 'm', label: 'length of a ruler (12")', emoji: '📏' },
    { value: 1, unit: 'm', label: 'height of a doorknob from floor', emoji: '🚪' },
    { value: 1.8, unit: 'm', label: 'height of an average person', emoji: '🧍' },
    { value: 2.5, unit: 'm', label: 'height of a giraffe', emoji: '🦒' },
    { value: 5, unit: 'm', label: 'length of a sedan car', emoji: '🚗' },
    { value: 9, unit: 'm', label: 'height of a giraffe (tallest)', emoji: '🦒' },
    { value: 10, unit: 'm', label: 'length of a bus', emoji: '🚌' },
    { value: 20, unit: 'm', label: 'height of a 6-story building', emoji: '🏢' },
    { value: 49, unit: 'm', label: 'height of Niagara Falls', emoji: '🌊' },
    { value: 93, unit: 'm', label: 'height of the Statue of Liberty', emoji: '🗽' },
    { value: 100, unit: 'm', label: 'length of a football field', emoji: '🏈' },
    { value: 300, unit: 'm', label: 'height of the Eiffel Tower', emoji: '🗼' },
    { value: 828, unit: 'm', label: 'height of Burj Khalifa', emoji: '🏗️' },
    { value: 1000, unit: 'm', label: 'length of 10 football fields', emoji: '🏈' },
    { value: 1609, unit: 'm', label: 'length of 1 mile', emoji: '🏃' },
    { value: 8849, unit: 'm', label: 'height of Mount Everest', emoji: '⛰️' },
    { value: 10000, unit: 'm', label: 'cruising altitude of a jet', emoji: '✈️' },
    { value: 100000, unit: 'm', label: 'edge of space (Kármán line)', emoji: '🚀' },
    { value: 384400000, unit: 'm', label: 'distance from Earth to Moon', emoji: '🌙' },
    { value: 1.496e11, unit: 'm', label: 'distance from Earth to Sun (1 AU)', emoji: '☀️' },
  ],
  mass: [
    { value: 0.001, unit: 'kg', label: 'weight of a paperclip', emoji: '📎' },
    { value: 0.002, unit: 'kg', label: 'weight of a US penny', emoji: '🪙' },
    { value: 0.01, unit: 'kg', label: 'weight of a AA battery', emoji: '🔋' },
    { value: 0.03, unit: 'kg', label: 'weight of a mouse', emoji: '🐭' },
    { value: 0.1, unit: 'kg', label: 'weight of a tangerine', emoji: '🍊' },
    { value: 0.5, unit: 'kg', label: 'weight of a loaf of bread', emoji: '🍞' },
    { value: 1, unit: 'kg', label: 'weight of a liter of water', emoji: '💧' },
    { value: 4, unit: 'kg', label: 'weight of a newborn baby', emoji: '👶' },
    { value: 70, unit: 'kg', label: 'weight of an average adult', emoji: '🧑' },
    { value: 200, unit: 'kg', label: 'weight of a grand piano', emoji: '🎹' },
    { value: 1000, unit: 'kg', label: 'weight of a small car', emoji: '🚗' },
    { value: 10000, unit: 'kg', label: 'weight of a city bus', emoji: '🚌' },
    { value: 100000, unit: 'kg', label: 'weight of a blue whale', emoji: '🐋' },
    { value: 1000000, unit: 'kg', label: 'weight of 10 blue whales', emoji: '🐋' },
  ],
  area: [
    { value: 0.01, unit: 'm2', label: 'size of a sheet of paper (A4)', emoji: '📄' },
    { value: 1, unit: 'm2', label: 'size of a yoga mat', emoji: '🧘' },
    { value: 10, unit: 'm2', label: 'size of a parking space', emoji: '🅿️' },
    { value: 100, unit: 'm2', label: 'size of a tennis court', emoji: '🎾' },
    { value: 1000, unit: 'm2', label: 'size of an Olympic pool', emoji: '🏊' },
    { value: 4046, unit: 'm2', label: 'size of 1 acre', emoji: '🌳' },
    { value: 10000, unit: 'm2', label: 'size of 1 hectare', emoji: '🌲' },
    { value: 1e6, unit: 'm2', label: 'size of Monaco', emoji: '🏙️' },
    { value: 1e8, unit: 'm2', label: 'size of Paris', emoji: '🗼' },
  ],
  volume: [
    { value: 0.000001, unit: 'm3', label: 'volume of a sugar cube', emoji: '🍚' },
    { value: 0.00001, unit: 'm3', label: 'volume of a teaspoon', emoji: '🥄' },
    { value: 0.00025, unit: 'm3', label: 'volume of a coffee cup', emoji: '☕' },
    { value: 0.0005, unit: 'm3', label: 'volume of a water bottle', emoji: '🧴' },
    { value: 0.001, unit: 'm3', label: 'volume of 1 liter', emoji: '🥤' },
    { value: 0.01, unit: 'm3', label: 'volume of a bucket', emoji: '🪣' },
    { value: 0.1, unit: 'm3', label: 'volume of a bathtub', emoji: '🛁' },
    { value: 1, unit: 'm3', label: 'volume of a washing machine', emoji: '🧺' },
    { value: 10, unit: 'm3', label: 'volume of a shipping container', emoji: '📦' },
    { value: 1000, unit: 'm3', label: 'volume of an Olympic pool', emoji: '🏊' },
  ],
  temp: [
    { value: -18, unit: 'C', label: 'temperature in a freezer', emoji: '🧊' },
    { value: 0, unit: 'C', label: 'freezing point of water', emoji: '❄️' },
    { value: 10, unit: 'C', label: 'cool autumn day', emoji: '🍂' },
    { value: 20, unit: 'C', label: 'room temperature', emoji: '🏠' },
    { value: 25, unit: 'C', label: 'warm summer day', emoji: '☀️' },
    { value: 30, unit: 'C', label: 'hot day at the beach', emoji: '🏖️' },
    { value: 37, unit: 'C', label: 'human body temperature', emoji: '🌡️' },
    { value: 40, unit: 'C', label: 'extreme heat wave', emoji: '🔥' },
    { value: 100, unit: 'C', label: 'boiling point of water', emoji: '💨' },
    { value: 1000, unit: 'C', label: 'lava temperature', emoji: '🌋' },
    { value: 5500, unit: 'C', label: 'surface temperature of the Sun', emoji: '☀️' },
  ],
  speed: [
    { value: 0.5, unit: 'm/s', label: 'walking speed', emoji: '🚶' },
    { value: 2, unit: 'm/s', label: 'brisk walking', emoji: '🏃' },
    { value: 5, unit: 'm/s', label: 'running speed', emoji: '🏃‍♂️' },
    { value: 10, unit: 'm/s', label: 'sprint speed', emoji: '⚡' },
    { value: 30, unit: 'm/s', label: 'car on highway', emoji: '🚗' },
    { value: 100, unit: 'm/s', label: 'Formula 1 car', emoji: '🏎️' },
    { value: 250, unit: 'm/s', label: 'commercial jet speed', emoji: '✈️' },
    { value: 343, unit: 'm/s', label: 'speed of sound (Mach 1)', emoji: '💥' },
    { value: 300000000, unit: 'm/s', label: 'speed of light', emoji: '💡' },
  ],
}

export function findVisualContext(catId: string, value: number, unitId: string): VisualRef | null {
  const refs = VISUAL_CONTEXT[catId]
  if (!refs) return null

  // Find the closest reference
  let best: VisualRef | null = null
  let bestDiff = Infinity
  for (const ref of refs) {
    const diff = Math.abs(Math.log10(value) - Math.log10(ref.value))
    if (diff < bestDiff) {
      bestDiff = diff
      best = ref
    }
  }
  // Only show if within reasonable range (within 2 orders of magnitude)
  if (bestDiff > 1.5) return null
  return best
}
