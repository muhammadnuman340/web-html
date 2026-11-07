interface Env {
  ASSETS: {
    fetch: (request: Request | string | URL) => Promise<Response>
  }
}

interface EventContext {
  request: Request
  env: Env
}

export async function onRequest({ request, env }: EventContext): Promise<Response> {
  const res = await env.ASSETS.fetch(request)
  if (res.status !== 404) return res
  return env.ASSETS.fetch(new URL('/spa', request.url))
}
