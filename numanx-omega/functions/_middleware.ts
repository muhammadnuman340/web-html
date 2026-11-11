/**
 * functions/_middleware.ts
 * Cloudflare Pages Edge Middleware
 *
 * Prevents Google and search engine crawlers from indexing preview deployments
 * (e.g. *.pages.dev, staging branch subdomains, PR previews).
 *
 * - converter.numanxstudio.com: Serves with normal production headers.
 * - Any other hostname (e.g. *.pages.dev): Automatically injects
 *   `X-Robots-Tag: noindex, nofollow, noarchive` to guarantee preview URLs are never indexed.
 */

interface Env {
  ASSETS: {
    fetch: (request: Request | string | URL) => Promise<Response>
  }
}

interface EventContext {
  request: Request
  env: Env
  next: () => Promise<Response>
}

const PRODUCTION_HOST = 'converter.numanxstudio.com'

export async function onRequest(context: EventContext): Promise<Response> {
  const response = await context.next()
  const url = new URL(context.request.url)

  // If request is from any host other than the authoritative production domain,
  // enforce X-Robots-Tag to immediately prevent search indexation.
  if (url.hostname.toLowerCase() !== PRODUCTION_HOST) {
    const headers = new Headers(response.headers)
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }

  return response
}
