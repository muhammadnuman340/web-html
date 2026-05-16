import { getAllCategories, addCustomUnit } from './converter'
import type { CategoryDef, UnitDef } from '../types'

export interface PluginDefinition {
  id: string
  name: string
  icon: string
  color: string
  priority?: number
  description?: string
  version?: string
  init?: () => void
  units?: { catId: string; units: UnitDef[] }[]
  categories?: CategoryDef[]
  commands?: { id: string; label: string; action: () => void }[]
  panels?: { id: string; label: string; icon: string; component?: string }[]
}

const plugins = new Map<string, PluginDefinition>()
const pluginCommands = new Map<string, { id: string; label: string; action: () => void }[]>()
const pluginPanels = new Map<string, { id: string; label: string; icon: string }[]>()

export function registerPlugin(plugin: PluginDefinition) {
  if (plugins.has(plugin.id)) return
  plugins.set(plugin.id, plugin)

  if (plugin.units) {
    plugin.units.forEach(({ catId, units }) => {
      units.forEach(u => addCustomUnit(catId, u.id, u.lb, u.r || 1))
    })
  }

  if (plugin.commands) {
    pluginCommands.set(plugin.id, plugin.commands)
  }

  if (plugin.panels) {
    pluginPanels.set(plugin.id, plugin.panels.map(p => ({ id: p.id, label: p.label, icon: p.icon })))
  }

  if (plugin.init) plugin.init()
}

export function getPlugins(): PluginDefinition[] {
  return Array.from(plugins.values()).sort((a, b) => (b.priority || 0) - (a.priority || 0))
}

export function getPlugin(id: string): PluginDefinition | undefined {
  return plugins.get(id)
}

export function unregisterPlugin(id: string) {
  plugins.delete(id)
  pluginCommands.delete(id)
  pluginPanels.delete(id)
}

export function getAllPluginCommands(): { id: string; label: string; action: () => void }[] {
  const commands: { id: string; label: string; action: () => void }[] = []
  pluginCommands.forEach(c => commands.push(...c))
  return commands
}

export function getAllPluginPanels(): { id: string; label: string; icon: string }[] {
  const panels: { id: string; label: string; icon: string }[] = []
  pluginPanels.forEach(p => panels.push(...p))
  return panels
}

export function loadBuiltinPlugins() {
  registerPlugin({
    id: 'core-currency',
    name: 'Currency Pro',
    icon: '💵',
    color: '#2ecc71',
    priority: 100,
    description: 'Live and offline currency conversion',
    version: '1.0.0',
  })

  registerPlugin({
    id: 'core-crypto',
    name: 'Crypto Tracker',
    icon: '₿',
    color: '#f39c12',
    priority: 90,
    description: 'Real-time cryptocurrency rates',
    version: '1.0.0',
  })

  registerPlugin({
    id: 'core-health',
    name: 'Health Engine',
    icon: '❤️',
    color: '#e74c3c',
    priority: 80,
    description: 'BMI, BMR, body fat calculators',
    version: '1.0.0',
  })

  registerPlugin({
    id: 'core-education',
    name: 'Learning System',
    icon: '🎓',
    color: '#6c63ff',
    priority: 70,
    description: 'Step-by-step explanations and quizzes',
    version: '1.0.0',
  })

  registerPlugin({
    id: 'core-formulas',
    name: 'Formula Explorer',
    icon: '📐',
    color: '#00bcd4',
    priority: 60,
    description: 'Physics, chemistry, engineering formulas',
    version: '1.0.0',
  })

  registerPlugin({
    id: 'core-science',
    name: 'Science Tools',
    icon: '🔬',
    color: '#9b59b6',
    priority: 50,
    description: 'Scientific constants and advanced math',
    version: '1.0.0',
  })
}
