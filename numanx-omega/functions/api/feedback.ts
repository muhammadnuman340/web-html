interface Env {
  FEEDBACK_WEBHOOK_URL?: string
  WEBHOOK_SECRET?: string
}

export interface FeedbackEventContext {
  request: Request
  env: Env
}

export async function onRequest(context: FeedbackEventContext): Promise<Response> {
  const { request, env } = context

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST' },
    })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { type, message, email, page, hp } = body || {}

  // Honeypot trap: silently return 200 ok without forwarding to Google Apps Script
  if (typeof hp === 'string' && hp.trim().length > 0) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Type validation: must be 'problem' or 'suggestion'
  if (type !== 'problem' && type !== 'suggestion') {
    return new Response(JSON.stringify({ error: 'Feedback type must be problem or suggestion.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Message validation: required text between 10 and 2000 characters
  if (typeof message !== 'string') {
    return new Response(JSON.stringify({ error: 'Message is required and must be text.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const cleanMessage = message.trim()
  if (cleanMessage.length < 10 || cleanMessage.length > 2000) {
    return new Response(JSON.stringify({ error: 'Message must be between 10 and 2000 characters.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Email validation: optional, max 254 chars, valid format
  let cleanEmail = ''
  if (email !== undefined && email !== null && email !== '') {
    if (typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email must be text.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    cleanEmail = email.trim().toLowerCase()
    if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return new Response(JSON.stringify({ error: 'That email address looks incomplete.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // Page validation: must start with converter.numanxstudio.com
  const cleanPage = typeof page === 'string' ? page.trim() : ''
  if (!cleanPage.startsWith('converter.numanxstudio.com')) {
    return new Response(JSON.stringify({ error: 'Invalid page identifier.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const webhookUrl = env?.FEEDBACK_WEBHOOK_URL
  if (!webhookUrl) {
    return new Response(JSON.stringify({ error: 'Feedback service is not currently configured.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const forwardPayload = {
    type: 'feedback',
    site: 'converter.numanxstudio.com',
    feedbackType: type,
    message: cleanMessage,
    email: cleanEmail,
    page: cleanPage.slice(0, 300),
    timestamp: new Date().toISOString(),
    secret: env?.WEBHOOK_SECRET || '',
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forwardPayload),
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timer)

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Feedback could not be sent right now. Please try again later.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let out: { success?: boolean; error?: string } = {}
    try {
      out = (await res.json()) as { success?: boolean; error?: string }
    } catch {
      // non-JSON reply
    }

    if (out && out.success === false) {
      return new Response(JSON.stringify({ error: 'Feedback could not be processed right now.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true, message: 'Thank you for your feedback!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    clearTimeout(timer)
    return new Response(JSON.stringify({ error: 'Feedback could not be sent right now. Please try again later.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
