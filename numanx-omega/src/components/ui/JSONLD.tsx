import { buildGlobalSiteSchema } from '../../config/schema'

export default function JSONLD() {
  const schema = buildGlobalSiteSchema()

  return (
    <script
      id="omega-global-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
