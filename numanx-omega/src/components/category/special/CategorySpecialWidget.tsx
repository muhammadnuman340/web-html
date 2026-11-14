import { lazy, Suspense } from 'react'

const TemperatureVisualizer = lazy(() => import('./TemperatureVisualizer'))
const LengthComparisonBar = lazy(() => import('./LengthComparisonBar'))
const MassWeightReference = lazy(() => import('./MassWeightReference'))
const DataTransferEstimator = lazy(() => import('./DataTransferEstimator'))
const CookingRecipeScaler = lazy(() => import('./CookingRecipeScaler'))
const SpeedVisualizer = lazy(() => import('./SpeedVisualizer'))
const FuelTripCalculator = lazy(() => import('./FuelTripCalculator'))
const AreaVisualizer = lazy(() => import('./AreaVisualizer'))
const VolumeVisualizer = lazy(() => import('./VolumeVisualizer'))
const TimeVisualizer = lazy(() => import('./TimeVisualizer'))
const EnergyVisualizer = lazy(() => import('./EnergyVisualizer'))
const PressureVisualizer = lazy(() => import('./PressureVisualizer'))
const PowerVisualizer = lazy(() => import('./PowerVisualizer'))
const AngleVisualizer = lazy(() => import('./AngleVisualizer'))
const ForceVisualizer = lazy(() => import('./ForceVisualizer'))
const TorqueVisualizer = lazy(() => import('./TorqueVisualizer'))
const FrequencyVisualizer = lazy(() => import('./FrequencyVisualizer'))
const DensityVisualizer = lazy(() => import('./DensityVisualizer'))
const NumberBaseVisualizer = lazy(() => import('./NumberBaseVisualizer'))
const Ieee754Visualizer = lazy(() => import('./Ieee754Visualizer'))
const PkNumberingVisualizer = lazy(() => import('./PkNumberingVisualizer'))

interface Props {
  category: string
}

function renderWidget(category: string) {
  switch (category) {
    case 'temp':
      return <TemperatureVisualizer />
    case 'length':
      return <LengthComparisonBar />
    case 'mass':
      return <MassWeightReference />
    case 'data':
    case 'datatransfer':
      return <DataTransferEstimator />
    case 'cooking':
      return <CookingRecipeScaler />
    case 'speed':
      return <SpeedVisualizer />
    case 'fuel':
      return <FuelTripCalculator />
    case 'area':
      return <AreaVisualizer />
    case 'volume':
      return <VolumeVisualizer />
    case 'time':
      return <TimeVisualizer />
    case 'energy':
      return <EnergyVisualizer />
    case 'pressure':
      return <PressureVisualizer />
    case 'power':
      return <PowerVisualizer />
    case 'angle':
      return <AngleVisualizer />
    case 'force':
      return <ForceVisualizer />
    case 'torque':
      return <TorqueVisualizer />
    case 'frequency':
      return <FrequencyVisualizer />
    case 'density':
      return <DensityVisualizer />
    case 'number-base':
      return <NumberBaseVisualizer />
    case 'ieee-754':
      return <Ieee754Visualizer />
    case 'pk-numbering':
      return <PkNumberingVisualizer />
    default:
      return null
  }
}

export default function CategorySpecialWidget({ category }: Props) {
  const widget = renderWidget(category)
  if (!widget) return null

  return (
    <Suspense fallback={<div className="h-44 glass rounded-2xl animate-pulse flex items-center justify-center text-xs opacity-50">Loading interactive tool...</div>}>
      {widget}
    </Suspense>
  )
}
