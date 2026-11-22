import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'

const COLUMNS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: 'Popular converters',
    links: [
      { to: '/convert/length', label: 'Length' },
      { to: '/convert/mass', label: 'Weight' },
      { to: '/convert/temp', label: 'Temperature' },
      { to: '/convert/volume', label: 'Volume' },
      { to: '/convert/cooking', label: 'Cooking' },
      { to: '/convert/textile', label: 'Fabric weight' },
    ],
  },
  {
    title: 'Converter',
    links: [
      { to: '/categories', label: 'All categories' },
      { to: '/converter', label: 'Universal converter' },
      { to: '/guides', label: 'Guides' },
      { to: '/blog', label: 'Blog' },
      { to: '/sitemap', label: 'Sitemap' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
      { to: '/privacy', label: 'Privacy' },
      { to: '/terms', label: 'Terms' },
      { to: '/settings', label: 'Settings' },
    ],
  },
]

const linkClass = 'inline-flex items-center min-h-[44px] text-[15px] text-[#111111] hover:underline underline-offset-4 focus-visible:outline-[#111111]'

/** Solid yellow NumanX footer band (same as Tools Hub). Text is always #111 on yellow. */
export default function SiteFooter() {
  return (
    <footer className="bg-[#ffc414] text-[#111111] mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <section aria-labelledby="more-numanx" className="space-y-3">
          <h2 id="more-numanx" className="text-xl text-[#111111]">More from NumanX Studio</h2>
          <p className="text-[15px] leading-relaxed max-w-sm">
            NumanX Tools Hub: free tools for images, text, QR codes, YouTube creators and cricket stats. No sign-up, runs in your browser.
          </p>
          <a
            href="https://toolshub.numanxstudio.com"
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl bg-[#111111] text-white font-semibold text-[15px] hover:bg-black focus-visible:outline-[#111111]"
          >
            Visit NumanX Tools Hub
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </section>
        {COLUMNS.map(col => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-base font-sans font-bold tracking-normal text-[#111111] mb-2">{col.title}</h2>
            <ul>
              {col.links.map(l => (
                <li key={l.to}><Link to={l.to} className={linkClass}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-[#111111]/20">
        <p className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-sm">
          © {new Date().getFullYear()} NumanX Studio · Omega X Converter
        </p>
      </div>
    </footer>
  )
}
