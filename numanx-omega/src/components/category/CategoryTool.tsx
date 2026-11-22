import { lazy, Suspense } from 'react'

// Extra calculators that do something the plain converter can't.
// Decorative per-category visualizers were removed in the NumanX redesign.
const LengthProToolkit = lazy(() => import('./special/LengthProToolkit'))
const DataTransferEstimator = lazy(() => import('./special/DataTransferEstimator'))
const CookingRecipeScaler = lazy(() => import('./special/CookingRecipeScaler'))
const FuelTripCalculator = lazy(() => import('./special/FuelTripCalculator'))

function pick(category: string) {
  switch (category) {
    case 'length': return <LengthProToolkit baseMeters={1.75} />
    case 'data':
    case 'datatransfer': return <DataTransferEstimator />
    case 'cooking': return <CookingRecipeScaler />
    case 'fuel': return <FuelTripCalculator />
    default: return null
  }
}

export default function CategoryTool({ category }: { category: string }) {
  const tool = pick(category)
  if (!tool) return null
  return (
    <div className="min-w-0 max-w-full">
      <Suspense fallback={null}>{tool}</Suspense>
    </div>
  )
}
