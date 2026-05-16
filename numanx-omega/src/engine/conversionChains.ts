import { convert } from './converter'
import { getCategory } from './converter'

export interface ChainLink {
  catId: string
  fromUnit: string
  toUnit: string
  label: string
}

export interface ChainResult {
  links: { label: string; value: number; unit: string }[]
  total: number
  finalUnit: string
}

const CHAINS: { id: string; label: string; icon: string; links: ChainLink[] }[] = [
  {
    id: 'energy-cost',
    label: 'Energy → Cost',
    icon: '⚡',
    links: [
      { catId: 'energy', fromUnit: 'kWh', toUnit: 'kWh', label: 'Energy (kWh)' },
      { catId: 'power', fromUnit: 'kW', toUnit: 'W', label: 'Power (W)' },
      { catId: 'time', fromUnit: 'hr', toUnit: 's', label: 'Time (hours)' },
    ]
  },
  {
    id: 'speed-distance',
    label: 'Speed → Distance',
    icon: '🚀',
    links: [
      { catId: 'speed', fromUnit: 'kmh', toUnit: 'mps', label: 'Speed (m/s)' },
      { catId: 'time', fromUnit: 'hr', toUnit: 's', label: 'Time (s)' },
    ]
  },
  {
    id: 'fuel-cost',
    label: 'Fuel → Cost',
    icon: '⛽',
    links: [
      { catId: 'fuel', fromUnit: 'L100km', toUnit: 'kmL', label: 'Fuel Economy' },
      { catId: 'volume', fromUnit: 'L', toUnit: 'gal', label: 'Fuel Volume' },
    ]
  },
  {
    id: 'pressure-force',
    label: 'Pressure → Force',
    icon: '🔵',
    links: [
      { catId: 'pressure', fromUnit: 'Pa', toUnit: 'bar', label: 'Pressure' },
      { catId: 'area', fromUnit: 'm2', toUnit: 'cm2', label: 'Area' },
      { catId: 'force', fromUnit: 'N', toUnit: 'lbf', label: 'Force' },
    ]
  },
  {
    id: 'data-time',
    label: 'Data → Transfer Time',
    icon: '💾',
    links: [
      { catId: 'data', fromUnit: 'GB', toUnit: 'MB', label: 'Data Size' },
      { catId: 'datatransfer', fromUnit: 'Mbps', toUnit: 'bps', label: 'Transfer Speed' },
      { catId: 'time', fromUnit: 's', toUnit: 'min', label: 'Time' },
    ]
  },
]

export function getAllChains() {
  return CHAINS
}

export function getChain(id: string) {
  return CHAINS.find(c => c.id === id)
}

export function executeChain(chainId: string, value: number, fromUnit?: string): ChainResult | null {
  const chain = getChain(chainId)
  if (!chain) return null

  const links: { label: string; value: number; unit: string }[] = []
  let currentVal = value
  let currentUnit = fromUnit || chain.links[0]?.fromUnit || ''

  for (const link of chain.links) {
    const cat = getCategory(link.catId)
    if (!cat) continue

    if (link.fromUnit !== link.toUnit) {
      const result = convert(currentVal, link.catId, currentUnit || link.fromUnit, link.toUnit)
      if (result === null) continue
      currentVal = result
    }

    currentUnit = link.toUnit
    links.push({
      label: link.label,
      value: currentVal,
      unit: link.toUnit
    })
  }

  return {
    links,
    total: currentVal,
    finalUnit: currentUnit
  }
}

export function suggestChain(fromCat: string, toHint?: string): string | null {
  if (fromCat === 'energy' && toHint === 'cost') return 'energy-cost'
  if (fromCat === 'speed') return 'speed-distance'
  if (fromCat === 'fuel') return 'fuel-cost'
  if (fromCat === 'data') return 'data-time'
  if (fromCat === 'pressure') return 'pressure-force'
  return null
}
