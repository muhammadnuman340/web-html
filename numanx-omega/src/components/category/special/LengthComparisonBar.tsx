import { useState, useMemo } from 'react'

type VisualTab = 'landmarks' | 'silhouette' | 'tape' | 'fractions' | 'sizing'
type BenchmarkDomain = 'pocket' | 'home' | 'urban' | 'nature'

export default function LengthComparisonBar() {
  const [cm, setCm] = useState<number>(175)
  const [activeTab, setActiveTab] = useState<VisualTab>('landmarks')
  const [activeDomain, setActiveDomain] = useState<BenchmarkDomain>('pocket')

  // Computed feet, inches and fractional breakdown
  const { feet, inches, totalInches, fraction16, fraction32, fraction64 } = useMemo(() => {
    const totalIn = cm / 2.54
    const ft = Math.floor(totalIn / 12)
    const inch = Math.round(totalIn % 12)
    
    // Fractional helper
    const getFraction = (denominator: number) => {
      const remainingInches = totalIn % 12
      const wholeInches = Math.floor(remainingInches)
      const fractionalPart = remainingInches - wholeInches
      const numer = Math.round(fractionalPart * denominator)
      
      if (numer === 0) return { ft, wholeInches, numer: 0, denom: denominator, str: `${ft}′ ${wholeInches}″` }
      if (numer === denominator) return { ft, wholeInches: wholeInches + 1, numer: 0, denom: denominator, str: `${ft}′ ${wholeInches + 1}″` }
      
      // Simplify fraction
      let n = numer
      let d = denominator
      while (n % 2 === 0 && d % 2 === 0) {
        n /= 2
        d /= 2
      }
      return { ft, wholeInches, numer: n, denom: d, str: `${ft}′ ${wholeInches} ${n}/${d}″` }
    }

    return {
      feet: ft,
      inches: inch === 12 ? 0 : inch,
      totalInches: totalIn,
      fraction16: getFraction(16),
      fraction32: getFraction(32),
      fraction64: getFraction(64),
    }
  }, [cm])

  const meters = useMemo(() => (cm / 100).toFixed(2), [cm])

  // Multi-domain calibrated benchmarks
  const benchmarkDomains: Record<BenchmarkDomain, { name: string; items: { label: string; sizeCm: number; icon: string; desc: string }[] }> = {
    pocket: {
      name: 'Everyday & Pocket',
      items: [
        { label: 'Credit Card', sizeCm: 8.5, icon: '💳', desc: 'ISO 7810 standard ID-1 length' },
        { label: 'Smartphone', sizeCm: 14.7, icon: '📱', desc: 'Standard 6.1" display phone' },
        { label: 'Ballpoint Pen', sizeCm: 14.5, icon: '🖊️', desc: 'Typical desktop pen' },
        { label: '12" Ruler', sizeCm: 30.48, icon: '📏', desc: 'Exact 1 foot standard ruler' },
        { label: 'A4 Paper', sizeCm: 29.7, icon: '📄', desc: 'Long edge of ISO 216 paper' },
        { label: 'Acoustic Guitar', sizeCm: 102, icon: '🎸', desc: 'Standard full-size dreadnought' },
      ],
    },
    home: {
      name: 'Human & Interior',
      items: [
        { label: 'Average Person', sizeCm: 175, icon: '🧍', desc: 'Global adult male baseline' },
        { label: 'Twin Mattress', sizeCm: 190, icon: '🛏️', desc: 'Standard single bed length' },
        { label: 'Interior Door', sizeCm: 203, icon: '🚪', desc: 'Standard 6′ 8″ doorway' },
        { label: 'Queen Mattress', sizeCm: 203, icon: '🛌', desc: 'Standard 80" bed length' },
        { label: 'Room Ceiling', sizeCm: 270, icon: '🏠', desc: 'Modern 9 ft residential ceiling' },
        { label: 'Basketball Hoop', sizeCm: 305, icon: '🏀', desc: 'Official 10 ft regulation rim' },
      ],
    },
    urban: {
      name: 'Vehicles & Structures',
      items: [
        { label: 'Compact Sedan', sizeCm: 450, icon: '🚗', desc: 'Average passenger car length' },
        { label: 'City Transit Bus', sizeCm: 1200, icon: '🚌', desc: 'Standard 40 ft urban bus' },
        { label: 'Semi-Truck Trailer', sizeCm: 1615, icon: '🚛', desc: '53 ft North American trailer' },
        { label: 'Olympic Pool', sizeCm: 5000, icon: '🏊', desc: '50-meter international course' },
        { label: 'Boeing 747-8', sizeCm: 7630, icon: '✈️', desc: 'Wide-body commercial airliner' },
        { label: 'Soccer Pitch', sizeCm: 10500, icon: '⚽', desc: 'FIFA standard field length' },
      ],
    },
    nature: {
      name: 'Micro to Macro',
      items: [
        { label: 'Red Blood Cell', sizeCm: 0.0008, icon: '🩸', desc: '8 micrometers diameter' },
        { label: 'Human Hair Width', sizeCm: 0.0075, icon: '✂️', desc: 'Average 75 microns' },
        { label: 'Grain of Rice', sizeCm: 0.7, icon: '🌾', desc: 'Standard medium grain' },
        { label: 'Giraffe Height', sizeCm: 550, icon: '🦒', desc: 'Adult male giraffe' },
        { label: 'Blue Whale', sizeCm: 3000, icon: '🐋', desc: 'Largest animal on Earth' },
        { label: 'Burj Khalifa', sizeCm: 82800, icon: '🏙️', desc: 'Tallest building in the world' },
      ],
    }
  }

  // Global Height Percentiles Reference
  const heightBenchmarks = [
    { label: 'Global Female Avg', cm: 159.5, ftStr: "5' 2.8\"", flag: '🌐' },
    { label: 'Japan Adult Avg', cm: 170.8, ftStr: "5' 7.2\"", flag: '🇯🇵' },
    { label: 'Global Male Avg', cm: 171.0, ftStr: "5' 7.3\"", flag: '🌐' },
    { label: 'USA Adult Avg', cm: 176.9, ftStr: "5' 9.6\"", flag: '🇺🇸' },
    { label: 'Netherlands Avg', cm: 183.8, ftStr: "6' 0.4\"", flag: '🇳🇱' },
    { label: 'NBA Average', cm: 199.0, ftStr: "6' 6.3\"", flag: '🏀' },
  ]

  // Footwear Size Approximation (derived from foot length in cm)
  const shoeSize = useMemo(() => {
    // Estimating foot length: roughly 15% of body height if height given, or direct cm if < 35
    const footCm = cm <= 35 ? cm : cm * 0.153
    const usMen = Math.max(1, Math.round(((footCm / 2.54) * 3 - 22) * 2) / 2)
    const usWomen = usMen + 1.5
    const uk = Math.max(0.5, usMen - 0.5)
    const eu = Math.round((footCm + 1.5) * 1.5)
    const mondopoint = Math.round(footCm * 10)
    return { footCm: footCm.toFixed(1), usMen, usWomen, uk, eu, mondopoint }
  }, [cm])

  const handleFeetInchesChange = (newFt: number, newIn: number) => {
    const totalIn = Math.max(0, newFt) * 12 + Math.max(0, newIn)
    setCm(Math.round(totalIn * 2.54))
  }

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span className="p-1 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]" aria-hidden="true">📏</span>
            <span>Visual Scale & Precision Suite</span>
          </h2>
          <p className="text-xs text-[var(--text2)] mt-0.5">
            Real-world scale comparisons, human height percentiles, tactile ruler, and carpentry fractions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[var(--primary-muted)] text-[var(--primary)] border border-[var(--primary)]/20 shadow-sm">
            {cm} cm = {feet}′ {inches}″ ({meters} m)
          </span>
        </div>
      </div>

      {/* Dual Input Controls & Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--card2)]/50 p-3.5 rounded-xl border border-[var(--border)]">
        {/* Metric Input */}
        <div className="space-y-1.5">
          <label htmlFor="length-cm-input" className="text-xs font-bold text-[var(--text)] flex items-center justify-between">
            <span>Metric (Centimeters / Meters):</span>
            <span className="font-mono text-xs text-[var(--text2)]">{meters} m</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              id="length-cm-input"
              type="number"
              min={1}
              max={100000}
              value={cm}
              onChange={e => setCm(Math.max(1, parseInt(e.target.value) || 1))}
              aria-label="Length in centimeters"
              className="w-32 px-3 py-2 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] text-base font-bold font-mono outline-none focus:border-[var(--primary)] text-[var(--text)] tabular-nums transition-all"
            />
            <span className="text-xs font-bold text-[var(--text2)]">cm</span>
            <div className="flex items-center gap-1 ml-auto">
              <button
                type="button"
                onClick={() => setCm(Math.max(1, cm - 10))}
                className="btn-chip text-xs px-2 py-1"
                aria-label="Decrease by 10 centimeters"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => setCm(cm + 10)}
                className="btn-chip text-xs px-2 py-1"
                aria-label="Increase by 10 centimeters"
              >
                +10
              </button>
            </div>
          </div>
        </div>

        {/* Imperial Input */}
        <div className="space-y-1.5">
          <span id="imperial-label" className="text-xs font-bold text-[var(--text)] block">
            Imperial (Feet & Inches):
          </span>
          <div className="flex items-center gap-2" role="group" aria-labelledby="imperial-label">
            <input
              id="length-feet-input"
              type="number"
              min={0}
              max={3000}
              value={feet}
              onChange={e => handleFeetInchesChange(parseInt(e.target.value) || 0, inches)}
              aria-label="Height in feet"
              className="w-20 px-3 py-2 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] text-base font-bold font-mono outline-none focus:border-[var(--primary)] text-[var(--text)] tabular-nums transition-all"
            />
            <label htmlFor="length-feet-input" className="text-xs font-bold text-[var(--text2)]">ft</label>

            <input
              id="length-inches-input"
              type="number"
              min={0}
              max={11}
              value={inches}
              onChange={e => handleFeetInchesChange(feet, parseInt(e.target.value) || 0)}
              aria-label="Height in inches"
              className="w-20 px-3 py-2 rounded-xl bg-[var(--card)] border-2 border-[var(--border)] text-base font-bold font-mono outline-none focus:border-[var(--primary)] text-[var(--text)] tabular-nums transition-all"
            />
            <label htmlFor="length-inches-input" className="text-xs font-bold text-[var(--text2)]">in</label>

            <span className="text-xs font-mono text-[var(--text2)] ml-auto">
              ({totalInches.toFixed(1)}″ total)
            </span>
          </div>
        </div>

        {/* Quick Height & Everyday Presets */}
        <div className="md:col-span-2 pt-1 border-t border-[var(--border)]/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[var(--text2)] mr-1">Quick Presets:</span>
            {[
              { l: "5'4\" (163 cm)", c: 163 },
              { l: "5'7\" (170 cm)", c: 170 },
              { l: "5'10\" (178 cm)", c: 178 },
              { l: "6'0\" (183 cm)", c: 183 },
              { l: "6'2\" (188 cm)", c: 188 },
              { l: "Door (203 cm)", c: 203 },
              { l: "A4 Paper (29.7 cm)", c: 29.7 },
              { l: "12\" Ruler (30.5 cm)", c: 30.5 },
            ].map(h => (
              <button
                key={h.l}
                type="button"
                onClick={() => setCm(Math.round(h.c))}
                className={`btn-chip text-xs py-1 px-2.5 transition-all ${Math.round(cm) === Math.round(h.c) ? 'active font-bold' : ''}`}
              >
                {h.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-[var(--border)] gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Length visualizer tools">
        {[
          { id: 'landmarks' as const, label: 'Everyday Landmarks', icon: '📏' },
          { id: 'silhouette' as const, label: 'Human Height & Clearance', icon: '🧍' },
          { id: 'tape' as const, label: 'Interactive Tape Measure', icon: '📐' },
          { id: 'fractions' as const, label: 'Carpentry Fractions', icon: '🔨' },
          { id: 'sizing' as const, label: 'Footwear & Apparel Sizing', icon: '👟' },
        ].map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeTab === tab.id
                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                : 'text-[var(--text2)] border-transparent hover:text-[var(--text)] hover:bg-[var(--card2)]'
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: EVERYDAY LANDMARKS (Calibrated & Proportional) */}
      {activeTab === 'landmarks' && (
        <div className="space-y-3 pt-1">
          {/* Domain Selector */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-1" role="group" aria-label="Benchmark domains">
              {(Object.keys(benchmarkDomains) as BenchmarkDomain[]).map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveDomain(key)}
                  className={`btn-chip text-xs px-2.5 py-1 ${activeDomain === key ? 'active' : ''}`}
                >
                  {benchmarkDomains[key].name}
                </button>
              ))}
            </div>
            <span className="text-xs font-mono font-bold text-[var(--primary)]">
              Current Target: {cm} cm ({feet}′ {inches}″)
            </span>
          </div>

          {/* Calibrated Proportional Comparison List */}
          <div className="space-y-2.5 bg-[var(--card2)]/40 p-3.5 rounded-xl border border-[var(--border)]">
            {benchmarkDomains[activeDomain].items.map(item => {
              const ratio = cm / item.sizeCm
              const isTargetLarger = ratio >= 1

              // Proper dual-relative scaling:
              // Whichever is larger gets 100% baseline; the smaller shows exact percentage
              const benchmarkPct = isTargetLarger ? Math.max(4, Math.min(100, (item.sizeCm / cm) * 100)) : 100
              const targetPct = isTargetLarger ? 100 : Math.max(4, Math.min(100, (cm / item.sizeCm) * 100))

              const ratioText = isTargetLarger
                ? `${ratio.toFixed(1)}× larger than ${item.label}`
                : `${(1 / ratio).toFixed(1)}× smaller than ${item.label}`

              return (
                <div key={item.label} className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]/70 space-y-2 hover:border-[var(--primary)]/40 transition-colors">
                  <div className="flex justify-between items-start text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base" aria-hidden="true">{item.icon}</span>
                      <div>
                        <span className="font-bold text-[var(--text)]">{item.label}</span>
                        <span className="text-[var(--text2)] ml-1.5 font-mono">({item.sizeCm} cm)</span>
                        <div className="text-[11px] text-[var(--text2)] opacity-80">{item.desc}</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--primary)] shrink-0 px-2 py-0.5 rounded-md bg-[var(--primary-muted)]">
                      {ratioText}
                    </span>
                  </div>

                  {/* Dual Bar Proportional Comparison */}
                  <div className="space-y-1 pt-1">
                    {/* Target Bar */}
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="w-14 font-semibold text-[var(--text2)]">Target:</span>
                      <div className="flex-1 bg-[var(--border)]/40 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${targetPct}%`,
                            background: 'var(--primary)',
                          }}
                        />
                      </div>
                      <span className="w-14 text-right font-mono font-semibold text-[var(--text)]">{cm} cm</span>
                    </div>

                    {/* Benchmark Bar */}
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="w-14 font-semibold text-[var(--text2)]">Item:</span>
                      <div className="flex-1 bg-[var(--border)]/40 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${benchmarkPct}%`,
                            background: '#10b981',
                          }}
                        />
                      </div>
                      <span className="w-14 text-right font-mono font-semibold text-[var(--text2)]">{item.sizeCm} cm</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 2: HUMAN SILHOUETTE & CLEARANCE */}
      {activeTab === 'silhouette' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Silhouette Visual Scale */}
          <div className="bg-[var(--card2)]/50 p-4 rounded-xl border border-[var(--border)] flex flex-col items-center justify-between min-h-[320px] relative overflow-hidden">
            <div className="w-full flex justify-between text-xs text-[var(--text2)] pb-2 border-b border-[var(--border)]">
              <span className="font-bold text-[var(--text)]">Visual Height Scale</span>
              <span className="font-mono font-semibold text-[var(--primary)]">{cm} cm ({feet}′ {inches}″)</span>
            </div>

            {/* SVG Scale with Human Figure */}
            <div className="relative w-full h-64 flex items-end justify-center py-2">
              {/* Reference clearance horizontal lines */}
              <div className="absolute inset-x-0 bottom-[88%] border-b border-dashed border-red-500/50 flex justify-between px-2 text-[10px] text-red-500 font-semibold">
                <span>Room Ceiling (270 cm)</span>
                <span>270 cm</span>
              </div>
              <div className="absolute inset-x-0 bottom-[66%] border-b border-dashed border-amber-500/60 flex justify-between px-2 text-[10px] text-amber-500 font-semibold">
                <span>Doorway (203 cm / 6′ 8″)</span>
                <span>203 cm</span>
              </div>
              <div className="absolute inset-x-0 bottom-[55%] border-b border-dashed border-blue-500/50 flex justify-between px-2 text-[10px] text-blue-500 font-semibold">
                <span>World Male Avg (171 cm)</span>
                <span>171 cm</span>
              </div>

              {/* Scaled Human Silhouette */}
              <div
                className="transition-all duration-300 flex flex-col items-center relative z-10"
                style={{
                  height: `${Math.min(95, Math.max(15, (cm / 300) * 100))}%`,
                  width: '60px'
                }}
              >
                {/* SVG Silhouette */}
                <svg
                  viewBox="0 0 100 240"
                  className="w-full h-full drop-shadow-md text-[var(--primary)]"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  {/* Head */}
                  <circle cx="50" cy="24" r="18" />
                  {/* Neck */}
                  <rect x="45" y="42" width="10" height="8" rx="2" />
                  {/* Torso */}
                  <path d="M26 50 C26 50, 50 48, 74 50 C80 50, 84 56, 82 66 L74 135 C74 138, 70 142, 66 142 L34 142 C30 142, 26 138, 26 135 L18 66 C16 56, 20 50, 26 50 Z" />
                  {/* Left Arm */}
                  <rect x="10" y="52" width="10" height="75" rx="5" />
                  {/* Right Arm */}
                  <rect x="80" y="52" width="10" height="75" rx="5" />
                  {/* Legs */}
                  <rect x="32" y="142" width="15" height="92" rx="6" />
                  <rect x="53" y="142" width="15" height="92" rx="6" />
                </svg>
                <span className="absolute -top-6 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--primary)] text-white whitespace-nowrap shadow-sm">
                  {cm} cm
                </span>
              </div>
            </div>

            {/* Clearance Indicators */}
            <div className="w-full pt-2 border-t border-[var(--border)] grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                <span className="text-[var(--text2)] block">Doorway Clearance:</span>
                <span className={`font-mono font-bold ${203 - cm >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {203 - cm >= 0 ? `+${203 - cm} cm clearance` : `${cm - 203} cm head obstruction!`}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                <span className="text-[var(--text2)] block">Ceiling Margin:</span>
                <span className="font-mono font-bold text-green-500">
                  +{270 - cm} cm clearance
                </span>
              </div>
            </div>
          </div>

          {/* Global Population Benchmark Table */}
          <div className="bg-[var(--card2)]/50 p-4 rounded-xl border border-[var(--border)] space-y-3">
            <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
              Global Average Comparisons
            </h3>
            <div className="space-y-2">
              {heightBenchmarks.map(item => {
                const diff = cm - item.cm
                const diffStr = diff >= 0 ? `+${diff.toFixed(1)} cm` : `${diff.toFixed(1)} cm`
                return (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs">
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true">{item.flag}</span>
                      <span className="font-medium text-[var(--text)]">{item.label}</span>
                      <span className="text-[var(--text2)] font-mono">({item.cm} cm / {item.ftStr})</span>
                    </div>
                    <span className={`font-mono font-bold ${diff >= 0 ? 'text-[var(--primary)]' : 'text-[var(--text2)]'}`}>
                      {diffStr}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE TAPE MEASURE */}
      {activeTab === 'tape' && (
        <div className="bg-[var(--card2)]/50 p-4 rounded-xl border border-[var(--border)] space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[var(--text)]">Tactile Ruler & Tape Measure</span>
            <span className="font-mono font-bold text-base text-[var(--primary)]">
              {cm} cm = {feet}′ {inches}″
            </span>
          </div>

          {/* Draggable Slider with Tick Marks */}
          <div className="space-y-2 pt-2">
            <div className="relative">
              <input
                type="range"
                min={1}
                max={300}
                value={cm}
                onChange={e => setCm(parseInt(e.target.value) || 1)}
                aria-label="Tactile length slider"
                className="w-full h-4 bg-amber-400/20 rounded-lg appearance-none cursor-ew-resize accent-[var(--primary)] focus:outline-none"
              />
            </div>

            {/* Visual Tape Measure Blade */}
            <div className="w-full h-12 bg-amber-400 rounded-lg border-2 border-amber-600 shadow-inner relative overflow-hidden flex items-center px-2 select-none">
              {/* Millimeter and Centimeter tick marks simulation */}
              <div className="absolute inset-0 flex justify-between items-start pt-1 px-1 opacity-70">
                {Array.from({ length: 31 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-0.5 bg-black ${i % 5 === 0 ? 'h-4' : 'h-2'}`} />
                    {i % 5 === 0 && <span className="text-[8px] font-mono text-black font-bold">{i * 10}</span>}
                  </div>
                ))}
              </div>
              <div className="relative z-10 w-full text-center">
                <span className="text-black font-black font-mono text-sm tracking-wider px-2 py-0.5 bg-amber-300/80 rounded border border-amber-500">
                  {cm} cm | {totalInches.toFixed(2)} in
                </span>
              </div>
            </div>
          </div>

          {/* Steppers */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)] text-xs">
            <span className="text-[var(--text2)] font-semibold">Fine Nudge Controls:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button type="button" onClick={() => setCm(Math.max(1, cm - 1))} className="btn-chip text-xs px-2 py-1">-1 cm</button>
              <button type="button" onClick={() => setCm(cm + 1)} className="btn-chip text-xs px-2 py-1">+1 cm</button>
              <button type="button" onClick={() => setCm(Math.max(1, Math.round(cm - 2.54)))} className="btn-chip text-xs px-2 py-1">-1 inch</button>
              <button type="button" onClick={() => setCm(Math.round(cm + 2.54))} className="btn-chip text-xs px-2 py-1">+1 inch</button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CARPENTRY & WOODWORKING FRACTIONS */}
      {activeTab === 'fractions' && (
        <div className="bg-[var(--card2)]/50 p-4 rounded-xl border border-[var(--border)] space-y-4">
          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-[var(--text)]">Architectural & Carpentry Fractions</span>
              <p className="text-[11px] text-[var(--text2)]">Precision standard for woodworking, metal fabrication, and construction.</p>
            </div>
            <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-[var(--primary-muted)] text-[var(--primary)]">
              {totalInches.toFixed(4)}″ Decimal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1">
              <span className="text-xs text-[var(--text2)] font-semibold">Nearest 1/16″:</span>
              <div className="text-base font-bold font-mono text-[var(--text)]">{fraction16.str}</div>
              <div className="text-[11px] text-[var(--text2)] font-mono">
                {fraction16.wholeInches} in + {fraction16.numer}/{fraction16.denom}″
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1">
              <span className="text-xs text-[var(--text2)] font-semibold">Nearest 1/32″:</span>
              <div className="text-base font-bold font-mono text-[var(--text)]">{fraction32.str}</div>
              <div className="text-[11px] text-[var(--text2)] font-mono">
                {fraction32.wholeInches} in + {fraction32.numer}/{fraction32.denom}″
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1">
              <span className="text-xs text-[var(--text2)] font-semibold">Nearest 1/64″:</span>
              <div className="text-base font-bold font-mono text-[var(--text)]">{fraction64.str}</div>
              <div className="text-[11px] text-[var(--text2)] font-mono">
                {fraction64.wholeInches} in + {fraction64.numer}/{fraction64.denom}″
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FOOTWEAR & SIZING */}
      {activeTab === 'sizing' && (
        <div className="bg-[var(--card2)]/50 p-4 rounded-xl border border-[var(--border)] space-y-4">
          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-[var(--text)]">Footwear & Apparel Sizing Translation</span>
              <p className="text-[11px] text-[var(--text2)]">International shoe sizes derived from foot length ({shoeSize.footCm} cm).</p>
            </div>
            <button
              type="button"
              onClick={() => setCm(27)}
              className="btn-chip text-xs py-0.5 px-2"
            >
              Set to Foot Size (27 cm)
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
              <span className="text-xs text-[var(--text2)] block font-semibold">US Men</span>
              <span className="text-base font-bold font-mono text-[var(--primary)]">{shoeSize.usMen}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
              <span className="text-xs text-[var(--text2)] block font-semibold">US Women</span>
              <span className="text-base font-bold font-mono text-[var(--primary)]">{shoeSize.usWomen}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
              <span className="text-xs text-[var(--text2)] block font-semibold">UK</span>
              <span className="text-base font-bold font-mono text-[var(--primary)]">{shoeSize.uk}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
              <span className="text-xs text-[var(--text2)] block font-semibold">EU</span>
              <span className="text-base font-bold font-mono text-[var(--primary)]">{shoeSize.eu}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] col-span-2 sm:col-span-1">
              <span className="text-xs text-[var(--text2)] block font-semibold">Mondopoint</span>
              <span className="text-base font-bold font-mono text-[var(--primary)]">{shoeSize.mondopoint} mm</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
