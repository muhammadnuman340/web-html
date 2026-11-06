import { Link } from 'react-router-dom'
import { DISCLAIMERS } from '../../config/legal'

export default function Disclaimer({ kind }: { kind: keyof typeof DISCLAIMERS }) {
  return (
    <p role="note" className="text-xs text-[var(--text3)] leading-relaxed">
      <span aria-hidden="true">ⓘ </span>
      {DISCLAIMERS[kind]} See our <Link to="/terms" className="underline hover:text-[var(--text2)]">Terms of Use</Link>.
    </p>
  )
}
