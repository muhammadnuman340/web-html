import TemperatureVisualizer from './TemperatureVisualizer'
import LengthComparisonBar from './LengthComparisonBar'
import MassWeightReference from './MassWeightReference'
import DataTransferEstimator from './DataTransferEstimator'
import CookingRecipeScaler from './CookingRecipeScaler'
import SpeedVisualizer from './SpeedVisualizer'
import FuelTripCalculator from './FuelTripCalculator'
import AreaVisualizer from './AreaVisualizer'
import VolumeVisualizer from './VolumeVisualizer'
import TimeVisualizer from './TimeVisualizer'
import EnergyVisualizer from './EnergyVisualizer'
import PressureVisualizer from './PressureVisualizer'
import PowerVisualizer from './PowerVisualizer'
import AngleVisualizer from './AngleVisualizer'
import ForceVisualizer from './ForceVisualizer'

interface Props {
  category: string
}

export default function CategorySpecialWidget({ category }: Props) {
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
    default:
      return null
  }
}
