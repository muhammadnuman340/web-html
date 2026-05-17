import { Helmet } from 'react-helmet-async'

interface Props {
  title: string
  description: string
  path?: string
}

const SITE = 'https://numanx-omega.netlify.app'

export default function SEOHead({ title, description, path = '' }: Props) {
  const url = `${SITE}${path}`
  return (
    <Helmet>
      <title>{title} | Omega X Converter</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${title} | Omega X Converter`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={`${title} | Omega X Converter`} />
      <meta name="twitter:description" content={description} />
      <link rel="canonical" href={url} />
    </Helmet>
  )
}
