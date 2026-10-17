import TemperatureVisualizer from './TemperatureVisualizer'
import LengthComparisonBar from './LengthComparisonBar'
import MassWeightReference from './MassWeightReference'
import DataTransferEstimator from './DataTransferEstimator'
import CookingRecipeScaler from './CookingRecipeScaler'
import SpeedVisualizer from './SpeedVisualizer'
import FuelTripCalculator from './FuelTripCalculator'
import AreaVisualizer from './AreaVisualizer'

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
    default:
      return null
  }
}
