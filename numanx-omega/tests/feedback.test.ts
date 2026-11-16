import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { buildFeedbackPayload } from '../src/engine/feedback'
import { onRequest as feedbackHandler } from '../functions/api/feedback'

const LABEL = 'Report a problem / Suggest an improvement'

describe('Feedback Client Payload Construction', () => {
  it('contains strictly the 4 allowed fields when email is provided', () => {
    const payload = buildFeedbackPayload({
      type: 'problem',
      message: 'The conversion factor for light years seems incorrect on this calculation.',
      pathname: '/convert/astronomy/light-year-to-meter',
      email: 'user@example.com',
    })

    const keys = Object.keys(payload)
    assert.equal(keys.length, 4, `Expected exactly 4 allowed fields, received: ${keys.join(', ')}`)
    assert.deepEqual(keys.sort(), ['email', 'message', 'page', 'type'])
    assert.equal(payload.type, 'problem')
    assert.equal(payload.message, 'The conversion factor for light years seems incorrect on this calculation.')
    assert.equal(payload.email, 'user@example.com')
    assert.ok(payload.page.startsWith('converter.numanxstudio.com'), 'Page must start with converter.numanxstudio.com')
    assert.equal(payload.page, 'converter.numanxstudio.com/convert/astronomy/light-year-to-meter')
  })

  it('contains strictly 3 allowed fields when optional email is omitted', () => {
    const payload = buildFeedbackPayload({
      type: 'suggestion',
      message: 'Please consider adding astronomical units to parallax second conversion.',
      pathname: '/convert/astronomy',
    })

    const keys = Object.keys(payload)
    assert.equal(keys.length, 3, `Expected 3 fields without email, received: ${keys.join(', ')}`)
    assert.deepEqual(keys.sort(), ['message', 'page', 'type'])
    assert.equal(payload.email, undefined)
    assert.ok(payload.page.startsWith('converter.numanxstudio.com'), 'Page must start with converter.numanxstudio.com')
  })

  it('includes honeypot field only if non-empty', () => {
    const cleanPayload = buildFeedbackPayload({
      type: 'problem',
      message: 'Valid human feedback message over ten chars.',
      pathname: '/convert/length',
      hp: '',
    })
    assert.equal(cleanPayload.hp, undefined)

    const botPayload = buildFeedbackPayload({
      type: 'problem',
      message: 'Automated spam message over ten chars.',
      pathname: '/convert/length',
      hp: 'bot-token-payload',
    })
    assert.equal(botPayload.hp, 'bot-token-payload')
  })
})

describe('Feedback Edge Function Validation & Forwarding', () => {
  const createMockRequest = (method: string, body?: unknown): Request => {
    return new Request('https://converter.numanxstudio.com/api/feedback', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  it('rejects non-POST requests with 405 Method Not Allowed and Allow header', async () => {
    const req = createMockRequest('GET')
    const res = await feedbackHandler({ request: req, env: {} })
    assert.equal(res.status, 405)
    assert.equal(res.headers.get('Allow'), 'POST')
  })

  it('rejects invalid JSON with 400 Bad Request', async () => {
    const req = new Request('https://converter.numanxstudio.com/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ not valid json',
    })
    const res = await feedbackHandler({ request: req, env: {} })
    assert.equal(res.status, 400)
    const data = await res.json() as { error?: string }
    assert.ok(data.error?.includes('JSON'))
  })

  it('rejects invalid or missing feedback type with 400', async () => {
    const req = createMockRequest('POST', {
      type: 'invalid-type',
      message: 'Valid length message here.',
      page: 'converter.numanxstudio.com/convert/length',
    })
    const res = await feedbackHandler({ request: req, env: {} })
    assert.equal(res.status, 400)
    const data = await res.json() as { error?: string }
    assert.ok(data.error?.includes('type'))
  })

  it('rejects messages shorter than 10 characters with 400', async () => {
    const req = createMockRequest('POST', {
      type: 'problem',
      message: 'Too short',
      page: 'converter.numanxstudio.com/convert/length',
    })
    const res = await feedbackHandler({ request: req, env: {} })
    assert.equal(res.status, 400)
    const data = await res.json() as { error?: string }
    assert.ok(data.error?.includes('10'))
  })

  it('rejects messages longer than 2000 characters with 400', async () => {
    const req = createMockRequest('POST', {
      type: 'problem',
      message: 'a'.repeat(2001),
      page: 'converter.numanxstudio.com/convert/length',
    })
    const res = await feedbackHandler({ request: req, env: {} })
    assert.equal(res.status, 400)
    const data = await res.json() as { error?: string }
    assert.ok(data.error?.includes('2000'))
  })

  it('rejects malformed email address with 400', async () => {
    const req = createMockRequest('POST', {
      type: 'problem',
      message: 'Valid message over ten characters long.',
      email: 'not-an-email',
      page: 'converter.numanxstudio.com/convert/length',
    })
    const res = await feedbackHandler({ request: req, env: {} })
    assert.equal(res.status, 400)
    const data = await res.json() as { error?: string }
    assert.ok(data.error?.includes('email'))
  })

  it('rejects invalid page identifier that does not start with converter.numanxstudio.com', async () => {
    const req = createMockRequest('POST', {
      type: 'problem',
      message: 'Valid message over ten characters long.',
      page: 'https://evil.example.com/phishing',
    })
    const res = await feedbackHandler({ request: req, env: {} })
    assert.equal(res.status, 400)
  })

  it('silently drops honeypot hits with HTTP 200 without calling fetch', async () => {
    const originalFetch = globalThis.fetch
    let fetchCalled = false
    globalThis.fetch = (async () => {
      fetchCalled = true
      return new Response(JSON.stringify({ ok: true }))
    }) as unknown as typeof fetch

    try {
      const req = createMockRequest('POST', {
        type: 'problem',
        message: 'Spam robot submitting unwanted data payload.',
        page: 'converter.numanxstudio.com/convert/length',
        hp: 'bot-fill-value',
      })
      const res = await feedbackHandler({
        request: req,
        env: { FEEDBACK_WEBHOOK_URL: 'https://script.google.com/test' },
      })
      assert.equal(res.status, 200)
      const data = await res.json() as { ok?: boolean }
      assert.equal(data.ok, true)
      assert.equal(fetchCalled, false, 'Fetch must never be called on honeypot hit')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('accepts valid payload and forwards to Google Apps Script webhook with secret', async () => {
    const originalFetch = globalThis.fetch
    let capturedUrl = ''
    let capturedBody: Record<string, unknown> = {}

    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(url)
      capturedBody = JSON.parse(String(init?.body || '{}'))
      return new Response(JSON.stringify({ success: true }))
    }) as unknown as typeof fetch

    try {
      const req = createMockRequest('POST', {
        type: 'suggestion',
        message: 'Great tool! Please consider adding knot to km/h shortcut.',
        email: 'pilot@example.com',
        page: 'converter.numanxstudio.com/convert/speed',
      })
      const res = await feedbackHandler({
        request: req,
        env: {
          FEEDBACK_WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbxTest/exec',
          WEBHOOK_SECRET: 'test-secret-key',
        },
      })
      assert.equal(res.status, 200)
      const data = await res.json() as { ok?: boolean }
      assert.equal(data.ok, true)
      assert.equal(capturedUrl, 'https://script.google.com/macros/s/AKfycbxTest/exec')
      assert.equal(capturedBody.type, 'feedback')
      assert.equal(capturedBody.site, 'converter.numanxstudio.com')
      assert.equal(capturedBody.feedbackType, 'suggestion')
      assert.equal(capturedBody.message, 'Great tool! Please consider adding knot to km/h shortcut.')
      assert.equal(capturedBody.email, 'pilot@example.com')
      assert.equal(capturedBody.page, 'converter.numanxstudio.com/convert/speed')
      assert.equal(capturedBody.secret, 'test-secret-key')
      assert.ok(capturedBody.timestamp)
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('returns 503 when FEEDBACK_WEBHOOK_URL is not configured', async () => {
    const req = createMockRequest('POST', {
      type: 'problem',
      message: 'Valid feedback message over ten chars.',
      page: 'converter.numanxstudio.com/convert/mass',
    })
    const res = await feedbackHandler({ request: req, env: {} })
    assert.equal(res.status, 503)
  })

  it('never exposes the Apps Script URL or secret in the response body', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = (async () => {
      return new Response('Not Found', { status: 404 })
    }) as unknown as typeof fetch

    const secretUrl = 'https://script.google.com/macros/s/SUPER_SECRET_TOKEN/exec'
    const secretKey = 'MY_PRIVATE_SECRET_12345'

    try {
      const req = createMockRequest('POST', {
        type: 'problem',
        message: 'Valid feedback message over ten chars.',
        page: 'converter.numanxstudio.com/convert/mass',
      })
      const res = await feedbackHandler({
        request: req,
        env: { FEEDBACK_WEBHOOK_URL: secretUrl, WEBHOOK_SECRET: secretKey },
      })
      assert.equal(res.status, 503)
      const text = await res.text()
      assert.ok(!text.includes('SUPER_SECRET_TOKEN'), 'Response must not leak webhook URL')
      assert.ok(!text.includes('MY_PRIVATE_SECRET_12345'), 'Response must not leak webhook secret')
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})

describe('HTML Prerender Verification (dist/)', () => {
  const cwd = process.cwd()
  const distDir = path.resolve(cwd, 'dist')

  it('contains the feedback button on prerendered pair pages', () => {
    const pairFile = path.join(distDir, 'convert', 'length', 'meters-to-feet.html')
    if (!fs.existsSync(pairFile)) return
    const html = fs.readFileSync(pairFile, 'utf8')
    assert.ok(html.includes('data-open-feedback'), 'Pair page must contain data-open-feedback button')
    assert.ok(html.includes(LABEL), `Pair page must contain "${LABEL}"`)
  })

  it('contains the feedback button on prerendered category pages', () => {
    const catFile = path.join(distDir, 'convert', 'length.html')
    if (!fs.existsSync(catFile)) return
    const html = fs.readFileSync(catFile, 'utf8')
    assert.ok(html.includes('data-open-feedback'), 'Category page must contain data-open-feedback button')
    assert.ok(html.includes(LABEL), `Category page must contain "${LABEL}"`)
  })

  it('contains the feedback button on prerendered guide pages', () => {
    const guideFile = path.join(distDir, 'guides', 'cups-to-grams.html')
    if (!fs.existsSync(guideFile)) return
    const html = fs.readFileSync(guideFile, 'utf8')
    assert.ok(html.includes('data-open-feedback'), 'Guide page must contain data-open-feedback button')
    assert.ok(html.includes(LABEL), `Guide page must contain "${LABEL}"`)
  })

  it('contains the feedback button in the static footer across all prerendered pages', () => {
    const homeFile = path.join(distDir, 'index.html')
    if (!fs.existsSync(homeFile)) return
    const html = fs.readFileSync(homeFile, 'utf8')
    assert.ok(html.includes('data-open-feedback'), 'Home page footer must contain data-open-feedback')
    assert.ok(html.includes(LABEL), `Home page footer must contain "${LABEL}"`)
  })
})
