// Lucide icon per category. The unit data keeps its own `ic` emoji field
// (unit data is not edited), but the UI never renders it.
import {
  Ruler, LandPlot, FlaskConical, Weight, Thermometer, Clock, Gauge, Rocket, MoveRight,
  CircleGauge, Zap, BatteryCharging, PlugZap, Magnet, AudioWaveform, HardDrive, ArrowDownUp,
  Triangle, Wrench, Fuel, Layers, ChefHat, Shirt, Orbit, Waves, Lightbulb, Droplet, Type,
  Binary, Cpu, Hash, ChartColumn, Grid3x3, Superscript, GraduationCap, Shapes,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  length: Ruler,
  area: LandPlot,
  volume: FlaskConical,
  mass: Weight,
  temp: Thermometer,
  time: Clock,
  speed: Gauge,
  acceleration: Rocket,
  force: MoveRight,
  pressure: CircleGauge,
  energy: Zap,
  power: BatteryCharging,
  electricity: PlugZap,
  magnetism: Magnet,
  frequency: AudioWaveform,
  data: HardDrive,
  datatransfer: ArrowDownUp,
  angle: Triangle,
  torque: Wrench,
  fuel: Fuel,
  density: Layers,
  cooking: ChefHat,
  textile: Shirt,
  astronomy: Orbit,
  flow: Waves,
  illuminance: Lightbulb,
  viscosity: Droplet,
  typography: Type,
  'number-base': Binary,
  'ieee-754': Cpu,
  'pk-numbering': Hash,
  statistics: ChartColumn,
  'matrix-format': Grid3x3,
  'scientific-notation': Superscript,
  'pk-gpa': GraduationCap,
}

export function categoryIcon(catId: string): LucideIcon {
  return ICONS[catId] ?? Shapes
}
