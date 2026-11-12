import { useState, useMemo } from 'react'
import { convertCricketOvers } from '../../../engine/converter'
import { fmt } from '../../../utils/numbers'

export default function CricketOversVisualizer() {
  const [oversInput, setOversInput] = useState<number>(14.3)
  const [runsScored, setRunsScored] = useState<number>(116)

  // NRR Calculator State
  const [teamRuns, setTeamRuns] = useState<number>(175)
  const [teamOvers, setTeamOvers] = useState<number>(20.0)
  const [oppRuns, setOppRuns] = useState<number>(152)
  const [oppOvers, setOppOvers] = useState<number>(20.0)

  // Derived Ball & Overs metrics
  const totalBalls = useMemo(() => convertCricketOvers(oversInput, 'overs_balls', 'balls'), [oversInput])
  const trueDecimalOvers = useMemo(() => convertCricketOvers(oversInput, 'overs_balls', 'true_overs'), [oversInput])

  const runRate = useMemo(() => {
    return trueDecimalOvers > 0 ? cleanDiv(runsScored, trueDecimalOvers) : 0
  }, [runsScored, trueDecimalOvers])

  // ICC Net Run Rate (NRR) = (Team Runs / Team Decimal Overs) - (Opp Runs / Opp Decimal Overs)
  const nrr = useMemo(() => {
    const teamDecOvers = convertCricketOvers(teamOvers, 'overs_balls', 'true_overs')
    const oppDecOvers = convertCricketOvers(oppOvers, 'overs_balls', 'true_overs')
    if (teamDecOvers <= 0 || oppDecOvers <= 0) return 0
    const teamRate = teamRuns / teamDecOvers
    const oppRate = oppRuns / oppDecOvers
    return teamRate - oppRate
  }, [teamRuns, teamOvers, oppRuns, oppOvers])

  function cleanDiv(a: number, b: number): number {
    return Math.round((a / b) * 100) / 100
  }

  return (
    <section aria-labelledby="cricket-overs-heading" className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/60 pb-3">
        <div>
          <h2 id="cricket-overs-heading" className="text-sm sm:text-base font-bold flex items-center gap-2 text-[var(--text)]">
            <span role="img" aria-hidden="true">🏏</span> Cricket Base-6 Overs & ICC Net Run Rate (NRR) Calculator
          </h2>
          <p className="text-xs text-[var(--text2)] opacity-85 mt-0.5">
            Convert cricket notation (14.3) to 87 legal balls and 14.50 true decimal overs for exact run rate analysis.
          </p>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 self-start sm:self-auto font-mono">
          Run Rate: {fmt(runRate, 2)} RPO
        </div>
      </div>

      {/* Inputs for Match Analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--text2)] font-medium mb-1 block">
            Cricket Overs Notation (e.g., 14.3 = 14 overs & 3 balls)
          </label>
          <input
            type="number"
            step="0.1"
            value={oversInput}
            onChange={e => setOversInput(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-sm font-bold font-mono outline-none focus:border-[var(--primary)] tabular-nums"
          />
        </div>

        <div>
          <label className="text-xs text-[var(--text2)] font-medium mb-1 block">Total Runs Scored</label>
          <input
            type="number"
            value={runsScored}
            onChange={e => setRunsScored(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-1.5 rounded-xl bg-[var(--card2)] border border-[var(--border)] text-sm font-bold font-mono outline-none focus:border-[var(--primary)] tabular-nums"
          />
        </div>
      </div>

      {/* Converted Metrics Display Cards */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] font-medium">Legal Balls (Deliveries)</div>
          <div className="text-base sm:text-lg font-bold text-[var(--primary)] mt-1 font-mono tabular-nums">
            {totalBalls} balls
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] font-medium">True Decimal Overs</div>
          <div className="text-base sm:text-lg font-bold text-emerald-400 mt-1 font-mono tabular-nums">
            {fmt(trueDecimalOvers, 2)}
          </div>
        </div>

        <div className="glass rounded-xl p-3 border border-[var(--border)]">
          <div className="text-xs text-[var(--text2)] font-medium">Runs per Over (RPO)</div>
          <div className="text-base sm:text-lg font-bold text-amber-400 mt-1 font-mono tabular-nums">
            {fmt(runRate, 2)}
          </div>
        </div>
      </div>

      {/* ICC Tournament NRR Section */}
      <div className="glass rounded-xl p-3.5 border border-[var(--border)] space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-[var(--text)] flex items-center gap-1.5">
            <span>🏆</span> ICC Tournament Net Run Rate (NRR) Formula
          </span>
          <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${nrr >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            NRR: {nrr >= 0 ? '+' : ''}{fmt(nrr, 3)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div>
            <label className="text-[var(--text2)] block mb-0.5">Runs Scored</label>
            <input
              type="number"
              value={teamRuns}
              onChange={e => setTeamRuns(Number(e.target.value))}
              className="w-full px-2 py-1 rounded bg-[var(--card2)] border border-[var(--border)]"
            />
          </div>
          <div>
            <label className="text-[var(--text2)] block mb-0.5">Overs Faced</label>
            <input
              type="number"
              step="0.1"
              value={teamOvers}
              onChange={e => setTeamOvers(Number(e.target.value))}
              className="w-full px-2 py-1 rounded bg-[var(--card2)] border border-[var(--border)]"
            />
          </div>
          <div>
            <label className="text-[var(--text2)] block mb-0.5">Runs Conceded</label>
            <input
              type="number"
              value={oppRuns}
              onChange={e => setOppRuns(Number(e.target.value))}
              className="w-full px-2 py-1 rounded bg-[var(--card2)] border border-[var(--border)]"
            />
          </div>
          <div>
            <label className="text-[var(--text2)] block mb-0.5">Overs Bowled</label>
            <input
              type="number"
              step="0.1"
              value={oppOvers}
              onChange={e => setOppOvers(Number(e.target.value))}
              className="w-full px-2 py-1 rounded bg-[var(--card2)] border border-[var(--border)]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
