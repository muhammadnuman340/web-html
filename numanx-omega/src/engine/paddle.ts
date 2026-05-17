const PADDLE_TOKEN =
  import.meta.env.VITE_PADDLE_TOKEN ?? 'test_223df1dfe41ff662cf2f5c704f8'
const PRICE_ID =
  import.meta.env.VITE_PADDLE_PRICE_ID ?? 'pri_01krpf7bkn6tnrwtzekf4f8b1t'
const PADDLE_ENV = import.meta.env.VITE_PADDLE_ENV ?? 'sandbox'

let _ready = false
let _initPromise: Promise<boolean> | null = null
let _onCompleted: (() => void) | null = null

export function onCheckoutCompleted(fn: () => void) {
  _onCompleted = fn
}

/** Direct checkout URL — works even when Paddle.js SDK is blocked by ad-blockers */
function getDirectCheckoutUrl(): string {
  const base = PADDLE_ENV === 'live'
    ? 'https://checkout.paddle.com'
    : 'https://sandbox-checkout.paddle.com'
  const successUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?payment=success`
    : '/?payment=success'
  return `${base}/price/${PRICE_ID}/checkout?successUrl=${encodeURIComponent(successUrl)}`
}

async function initPaddle(): Promise<boolean> {
  if (!window.Paddle) return false
  try {
    await window.Paddle.Initialize({
      token: PADDLE_TOKEN,
      environment: PADDLE_ENV === 'live' ? 'production' : 'sandbox',
    })
    return true
  } catch (err) {
    console.error('[Paddle] Initialize failed:', err)
    return false
  }
}

function loadScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById('paddle-checkout-sdk')) {
      initPaddle().then(resolve)
      return
    }
    const script = document.createElement('script')
    script.id = 'paddle-checkout-sdk'
    script.src = 'https://cdn.paddle.com/paddle/v3/paddle.js'
    script.async = true
    script.onload = () => {
      initPaddle().then(ok => { _ready = ok; resolve(ok) })
    }
    script.onerror = () => {
      _ready = false
      console.warn('[Paddle] Script blocked by browser/ad-blocker:', script.src)
      resolve(false)
    }
    document.head.appendChild(script)
  })
}

export async function ensurePaddle(): Promise<boolean> {
  if (_ready) return true
  if (_initPromise) return _initPromise

  if (window.Paddle) {
    _initPromise = initPaddle()
    const ok = await _initPromise
    _ready = ok
    return ok
  }

  _initPromise = loadScript()
  const ok = await _initPromise
  _ready = ok
  return ok
}

export function isPaddleReady() { return _ready }

/**
 * Opens Paddle Checkout. Two paths:
 * 1. SDK loaded → open overlay with event callback (normal flow)
 * 2. SDK blocked → open direct checkout URL in new tab (ad-blocker fallback)
 *
 * In fallback mode, activation happens via ?payment=success URL param
 * when Paddle redirects back after payment.
 */
export async function openPaddleCheckout(): Promise<boolean> {
  const sdkLoaded = await ensurePaddle()

  if (!sdkLoaded) {
    // SDK blocked — use direct URL fallback
    const url = getDirectCheckoutUrl()
    try { window.open(url, '_blank') } catch {}
    alert(
      '⚠️  Paddle Checkout\n\n' +
      'The payment window couldn\'t open automatically (ad-blocker or firewall).\n\n' +
      'Please complete your purchase in the new tab that just opened.\n' +
      'If it didn\'t open, click this link:\n\n' +
      url + '\n\n' +
      'After payment, you\'ll be redirected back and Pro will activate automatically.'
    )
    // Can't detect result from new tab — relies on ?payment=success redirect
    return false
  }

  // SDK loaded — use overlay with event callback
  return new Promise(resolve => {
    let settled = false
    const cleanup = () => {
      settled = true
      window.removeEventListener('beforeunload', onUnload)
    }
    const onUnload = () => { if (!settled) { cleanup(); resolve(false) } }
    const timeout = setTimeout(() => {
      if (!settled) { cleanup(); resolve(false) }
    }, 300_000)

    window.addEventListener('beforeunload', onUnload)

    try {
      window.Paddle.Checkout.open({
        items: [{ priceId: PRICE_ID, quantity: 1 }],
        settings: { displayMode: 'overlay', theme: 'dark' },
        eventCallback: (event: any) => {
          if (event.name === 'checkout.completed') {
            clearTimeout(timeout)
            cleanup()
            _onCompleted?.()
            resolve(true)
          }
          if (event.name === 'checkout.closed' && !settled) {
            clearTimeout(timeout)
            cleanup()
            resolve(false)
          }
        },
      })
    } catch (err) {
      clearTimeout(timeout)
      cleanup()
      console.error('[Paddle] Checkout.open threw:', err)
      // Fallback: open direct URL in new tab
      const url = getDirectCheckoutUrl()
      try { window.open(url, '_blank') } catch {}
      alert(
        '⚠️  Paddle Checkout\n\n' +
        'The payment window encountered an error.\n\n' +
        'Please complete your purchase at this link:\n\n' +
        url + '\n\n' +
        'After payment, you\'ll be redirected back and Pro will activate automatically.'
      )
      resolve(false)
    }
  })
}
