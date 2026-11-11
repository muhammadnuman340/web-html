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
  data: [
    { value: 1, unit: 'B', label: 'single ASCII character', emoji: '🔤' },
    { value: 1024, unit: 'B', label: 'plain text email note (1 KB)', emoji: '📧' },
    { value: 5242880, unit: 'B', label: 'smartphone photo or MP3 song (5 MB)', emoji: '🎵' },
    { value: 1073741824, unit: 'B', label: '1 hour of HD video stream (1 GB)', emoji: '🎬' },
    { value: 4700000000, unit: 'B', label: 'single-layer DVD disc (4.7 GB)', emoji: '📀' },
    { value: 26843545600, unit: 'B', label: 'single-layer Blu-ray disc (25 GB)', emoji: '💿' },
    { value: 1099511627776, unit: 'B', label: 'modern high-capacity NVMe SSD (1 TB)', emoji: '💾' },
  ],
  pressure: [
    { value: 3000, unit: 'Pa', label: 'human lung expiration pressure', emoji: '🫁' },
    { value: 101325, unit: 'Pa', label: 'sea level atmospheric pressure (1 atm)', emoji: '🌐' },
    { value: 220000, unit: 'Pa', label: 'passenger vehicle tire pressure (~32 psi)', emoji: '🚗' },
    { value: 700000, unit: 'Pa', label: 'road bicycle tire pressure (~100 psi)', emoji: '🚲' },
    { value: 15000000, unit: 'Pa', label: 'scuba diving tank pressure (~150 bar)', emoji: '🤿' },
    { value: 110000000, unit: 'Pa', label: 'bottom of Mariana Trench (Challenger Deep)', emoji: '🌊' },
  ],
  time: [
    { value: 0.1, unit: 's', label: 'blink of an eye', emoji: '👁️' },
    { value: 1, unit: 's', label: 'resting human heartbeat', emoji: '💓' },
    { value: 60, unit: 's', label: '1 minute cooking timer', emoji: '⏱️' },
    { value: 3600, unit: 's', label: 'standard university lecture (1 hour)', emoji: '🎓' },
    { value: 86400, unit: 's', label: '1 full solar rotation of Earth (24 hours)', emoji: '🌍' },
    { value: 604800, unit: 's', label: '1 calendar week', emoji: '📅' },
    { value: 31557600, unit: 's', label: '1 planetary orbit around the Sun (1 year)', emoji: '☀️' },
  ],
  energy: [
    { value: 4.184, unit: 'J', label: 'energy to raise 1 g of water by 1°C (1 cal)', emoji: '💧' },
    { value: 1000, unit: 'J', label: 'kinetic energy of a fast-pitch baseball', emoji: '⚾' },
    { value: 104600, unit: 'J', label: 'energy in a snack energy bar (~25 kcal)', emoji: '🍫' },
    { value: 3600000, unit: 'J', label: '1 kilowatt-hour of grid electricity (1 kWh)', emoji: '⚡' },
    { value: 35000000, unit: 'J', label: 'chemical energy in 1 liter of gasoline', emoji: '⛽' },
    { value: 1e9, unit: 'J', label: 'energy released in a cloud lightning strike', emoji: '🌩️' },
  ],
  power: [
    { value: 5, unit: 'W', label: 'smartphone baseline charger', emoji: '📱' },
    { value: 60, unit: 'W', label: 'standard incandescent light bulb', emoji: '💡' },
    { value: 745.7, unit: 'W', label: '1 mechanical horsepower (hp)', emoji: '🐎' },
    { value: 1500, unit: 'W', label: 'hair dryer or electric space heater', emoji: '💨' },
    { value: 150000, unit: 'W', label: 'typical family car engine (~200 hp)', emoji: '🚗' },
    { value: 1000000, unit: 'W', label: 'commercial wind turbine output (1 MW)', emoji: '💨' },
  ],
}

import { convert } from './converter'

const BASE_UNIT_BY_CAT: Record<string, string> = {
  length: 'm',
  mass: 'kg',
  area: 'm2',
  volume: 'm3',
  temp: 'C',
  speed: 'mps',
  data: 'B',
  pressure: 'Pa',
  time: 's',
  energy: 'J',
  power: 'W',
}

export function getVisualAnchors(catId: string, limit = 4): VisualRef[] {
  const refs = VISUAL_CONTEXT[catId]
  if (!refs || refs.length === 0) return []
  if (refs.length <= limit) return refs
  // Sample evenly across the scale
  const step = Math.floor(refs.length / limit)
  const result: VisualRef[] = []
  for (let i = 0; i < limit; i++) {
    const idx = Math.min(i * step, refs.length - 1)
    result.push(refs[idx])
  }
  return result
}

export function getComparativeStatement(catId: string, value: number, unitId: string): { text: string; emoji: string } | null {
  const ref = findVisualContext(catId, value, unitId)
  if (!ref) return null

  const baseUnit = BASE_UNIT_BY_CAT[catId]
  if (!baseUnit) return null

  const baseValue = unitId === baseUnit ? value : convert(value, catId, unitId, baseUnit)
  if (baseValue === null || !Number.isFinite(baseValue)) return null

  if (catId === 'temp') {
    const diff = Math.round(baseValue - ref.value)
    if (Math.abs(diff) <= 2) {
      return { text: `Roughly equivalent to ${ref.label}`, emoji: ref.emoji }
    }
    const dir = diff > 0 ? `${diff}°C warmer than` : `${Math.abs(diff)}°C cooler than`
    return { text: `Approximately ${dir} ${ref.label}`, emoji: ref.emoji }
  }

  if (baseValue <= 0 || ref.value <= 0) {
    return { text: `Benchmark: ${ref.label}`, emoji: ref.emoji }
  }

  const ratio = baseValue / ref.value
  if (ratio >= 0.85 && ratio <= 1.15) {
    return { text: `Roughly equivalent to the ${ref.label}`, emoji: ref.emoji }
  } else if (ratio > 1.15 && ratio < 10) {
    return { text: `Approximately ${ratio.toFixed(1)}× the ${ref.label}`, emoji: ref.emoji }
  } else if (ratio >= 10) {
    return { text: `Approximately ${Math.round(ratio).toLocaleString()}× the ${ref.label}`, emoji: ref.emoji }
  } else {
    const inv = 1 / ratio
    if (inv < 10) {
      return { text: `Approximately ${(1 / inv).toFixed(2)}× (about 1/${Math.round(inv)}) of the ${ref.label}`, emoji: ref.emoji }
    }
    return { text: `Fractional scale (~1/${Math.round(inv).toLocaleString()}) of the ${ref.label}`, emoji: ref.emoji }
  }
}

export function findVisualContext(catId: string, value: number, unitId: string): VisualRef | null {
  const refs = VISUAL_CONTEXT[catId]
  const baseUnit = BASE_UNIT_BY_CAT[catId]
  if (!refs || !baseUnit || !Number.isFinite(value)) return null

  const baseValue = unitId === baseUnit ? value : convert(value, catId, unitId, baseUnit)
  if (baseValue === null || !Number.isFinite(baseValue)) return null

  if (catId === 'temp') {
    let best: VisualRef | null = null
    let bestDiff = Infinity
    for (const ref of refs) {
      const diff = Math.abs(baseValue - ref.value)
      if (diff < bestDiff) {
        bestDiff = diff
        best = ref
      }
    }
    return bestDiff <= 25 ? best : null
  }

  if (baseValue <= 0) return null
  let best: VisualRef | null = null
  let bestDiff = Infinity
  for (const ref of refs) {
    if (ref.value <= 0) continue
    const diff = Math.abs(Math.log10(baseValue) - Math.log10(ref.value))
    if (diff < bestDiff) {
      bestDiff = diff
      best = ref
    }
  }
  if (bestDiff > 1.5) return null
  return best
}
