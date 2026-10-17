import { useState, useMemo } from 'react'

export default function DataTransferEstimator() {
  const [fileSize, setFileSize] = useState<number>(25)
  const [sizeUnit, setSizeUnit] = useState<'MB' | 'GB' | 'TB'>('GB')
  const [speedMbps, setSpeedMbps] = useState<number>(100)

  // Convert file size to Megabytes
  const totalMB = useMemo(() => {
    if (sizeUnit === 'MB') return fileSize
    if (sizeUnit === 'GB') return fileSize * 1024
    if (sizeUnit === 'TB') return fileSize * 1024 * 1024
    return fileSize
  }, [fileSize, sizeUnit])

  // Speed in MegaBytes per second: 1 Byte = 8 bits
  const speedMBps = useMemo(() => speedMbps / 8, [speedMbps])

  // Total seconds needed
  const totalSeconds = useMemo(() => {
    if (speedMBps <= 0) return 0
    return totalMB / speedMBps
  }, [totalMB, speedMBps])

  // Formatted duration string
  const duration = useMemo(() => {
    const s = Math.round(totalSeconds)
    const hours = Math.floor(s / 3600)
    const minutes = Math.floor((s % 3600) / 60)
    const seconds = s % 60

    if (hours > 24) {
      const days = (hours / 24).toFixed(1)
      return `${days} days (${hours}h ${minutes}m)`
    }
    if (hours > 0) return `${hours} hr ${minutes} min ${seconds} sec`
    if (minutes > 0) return `${minutes} min ${seconds} sec`
    return `${seconds} seconds`
  }, [totalSeconds])

  const filePresets = [
    { label: 'OS Update (5 GB)', size: 5, unit: 'GB' as const },
    { label: '4K Movie (18 GB)', size: 18, unit: 'GB' as const },
    { label: 'Modern Game (75 GB)', size: 75, unit: 'GB' as const },
    { label: 'System Backup (500 GB)', size: 500, unit: 'GB' as const },
  ]

  const speedPresets = [
    { label: '4G LTE (30 Mbps)', s: 30 },
    { label: 'Broadband (100 Mbps)', s: 100 },
    { label: 'Fast 5G (300 Mbps)', s: 300 },
    { label: 'Gigabit Fiber (1000 Mbps)', s: 1000 },
  ]

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span aria-hidden="true">💾</span> Download & Upload Transfer Time Calculator
          </h2>
          <p className="text-xs opacity-60 mt-0.5">
            Estimate real-world transfer duration based on data size and network connection bandwidth.
          </p>
        </div>

        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[var(--primary-muted)] text-[var(--primary)] self-start sm:self-auto">
          Actual throughput: {speedMBps.toFixed(1)} MB/s
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Inputs */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold opacity-60">File / Data Size:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={fileSize}
                onChange={e => setFileSize(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-28 px-3 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-sm font-bold font-mono outline-none focus:border-[var(--primary)]"
              />
              <select
                value={sizeUnit}
                onChange={e => setSizeUnit(e.target.value as 'MB' | 'GB' | 'TB')}
                className="px-3 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="MB">MB (Megabytes)</option>
                <option value="GB">GB (Gigabytes)</option>
                <option value="TB">TB (Terabytes)</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {filePresets.map(p => (
                <button
                  key={p.label}
                  onClick={() => { setFileSize(p.size); setSizeUnit(p.unit) }}
                  className="btn-chip text-xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <label className="text-xs font-semibold opacity-60">Internet Speed (Bandwidth):</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={speedMbps}
                onChange={e => setSpeedMbps(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-28 px-3 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-sm font-bold font-mono outline-none focus:border-[var(--primary)]"
              />
              <span className="text-xs font-semibold opacity-70">Mbps (Megabits/sec)</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {speedPresets.map(p => (
                <button
                  key={p.label}
                  onClick={() => setSpeedMbps(p.s)}
                  className={`btn-chip text-xs ${speedMbps === p.s ? 'active' : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Result Card */}
        <div className="bg-[var(--card2)]/50 p-4 rounded-xl border border-[var(--border)] flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-semibold opacity-60 block">Estimated Time Required</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--primary)] mt-1">
              {duration}
            </div>
            <p className="text-xs opacity-60 mt-1">
              To transfer {fileSize} {sizeUnit} over a continuous {speedMbps} Mbps line.
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[var(--border)]/40 text-xs font-mono">
            <div className="flex justify-between">
              <span className="opacity-50">ISP Advertised Speed:</span>
              <span>{speedMbps} Mbps (bits)</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-50">Effective Data Rate:</span>
              <span className="text-[var(--text)] font-semibold">{speedMBps.toFixed(2)} MB/s (bytes)</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-50">Total Payload Size:</span>
              <span>{totalMB >= 1024 ? `${(totalMB / 1024).toFixed(2)} GB` : `${totalMB} MB`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
