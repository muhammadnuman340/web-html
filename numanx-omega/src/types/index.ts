export type UnitSystem = 'M' | 'I' | 'S' | 'O' | 'C'
export const SystemLabels: Record<UnitSystem, string> = { M: 'Metric', I: 'Imperial', S: 'SI Base', O: 'Other', C: 'Custom' }

export interface UnitDef {
  id: string; lb: string; r?: number; s?: UnitSystem; al?: string[]; custom?: boolean
}

export interface CategoryDef {
  id: string; lb: string; ic: string; cl: string; sp?: boolean; curr?: boolean; crypto?: boolean
  al?: string[]; un: UnitDef[]
}

export interface ConversionResult { value: number; unit: string; label: string }

export interface HistoryEntry {
  cat: string; fv: number; fu: string; tv: number; tu: string; t: number
}

export interface FavoriteEntry {
  cat: string; from: string; to: string
}

export interface CustomUnit {
  lb: string; id: string; r: number; cat: string
}

export type ThemeMode = 'amoled' | 'light' | 'cyberpunk' | 'rgb' | 'holographic'

export interface AppState {
  theme: ThemeMode; category: string; precision: number; sci: boolean; frac: boolean
  sidebarOpen: boolean; history: HistoryEntry[]; favorites: FavoriteEntry[]
}

export interface CurrencyRate { [key: string]: number }
