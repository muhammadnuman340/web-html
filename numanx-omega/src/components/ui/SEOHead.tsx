import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

interface Props {
  title: string
  description: string
  path?: string
  schema?: Record<string, unknown>
}

const SITE = 'https://numanx-omega.netlify.app'

const REGIONS = [
  'en', 'x-default',
  'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN', 'en-NZ', 'en-ZA', 'en-IE',
  'en-SG', 'en-PH', 'en-NG', 'en-KE', 'en-GH',
]

export default function SEOHead({ title, description, path = '', schema }: Props) {
  const fullTitle = title.includes('—') || title.includes('|') ? title : `${title} | Omega X Converter`
  const url = `${SITE}${path}`

  useEffect(() => {
    document.title = fullTitle

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url

    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = description
  }, [fullTitle, url, description])

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${title} | Omega X Converter`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={`${title} | Omega X Converter`} />
      <meta name="twitter:description" content={description} />
      <link rel="canonical" href={url} />
      {REGIONS.map(r => (
        <link key={r} rel="alternate" href={url} hrefLang={r} />
      ))}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  )
}
