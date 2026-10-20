import { useEffect } from 'react'
import { SITE, canonicalUrl } from '../../config/site'

interface Props {
  title: string
  description: string
  path?: string
  noindex?: boolean
  schema?: Record<string, unknown> | null
}

export default function SEOHead({ title, description, path = '', noindex = false, schema }: Props) {
  const fullTitle = title.includes('—') || title.includes('|') ? title : `${title} | Omega X Converter`
  const targetCanonical = canonicalUrl(path)

  useEffect(() => {
    // 1. Document Title
    document.title = fullTitle

    // 2. Canonical Tag
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = targetCanonical

    // 3. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = description

    // 4. Robots Meta (index / noindex)
    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
    if (!metaRobots) {
      metaRobots = document.createElement('meta')
      metaRobots.name = 'robots'
      document.head.appendChild(metaRobots)
    }
    metaRobots.content = noindex ? 'noindex, follow' : 'index, follow'

    // 5. OpenGraph Tags
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('property', property)
        document.head.appendChild(el)
      }
      el.content = content
    }

    setMeta('og:title', fullTitle)
    setMeta('og:description', description)
    setMeta('og:url', targetCanonical)
    setMeta('og:type', 'website')
    setMeta('og:site_name', SITE.fullName)

    // 6. Twitter Card Tags
    const setTwitter = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('name', name)
        document.head.appendChild(el)
      }
      el.content = content
    }

    setTwitter('twitter:card', 'summary_large_image')
    setTwitter('twitter:title', fullTitle)
    setTwitter('twitter:description', description)

    // 7. Page-level JSON-LD (isolated to id="omega-page-schema")
    let schemaScript = document.getElementById('omega-page-schema') as HTMLScriptElement | null
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script')
        schemaScript.id = 'omega-page-schema'
        schemaScript.type = 'application/ld+json'
        document.head.appendChild(schemaScript)
      }
      schemaScript.textContent = JSON.stringify(schema)
    } else if (schemaScript) {
      schemaScript.remove()
    }

    return () => {
      const existingScript = document.getElementById('omega-page-schema')
      if (existingScript) existingScript.remove()
    }
  }, [fullTitle, targetCanonical, description, noindex, schema])

  return null
}
