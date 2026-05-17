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

/**
 * Initialize Paddle SDK.
 * Paddle.Initialize() is async in v3 — MUST be awaited before Checkout.open().
 * Environment is passed in Initialize options (Paddle.Environment.set does NOT exist in v3).
 */
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
      console.error('[Paddle] Script failed to load (ad-blocker?):', script.src)
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
 * Opens Paddle Checkout overlay. Returns true if the user completed payment.
 * Uses eventCallback to detect checkout.completed in real-time.
 * Falls back to ?payment=success URL param detection on page load.
 */
export async function openPaddleCheckout(): Promise<boolean> {
  if (!await ensurePaddle()) {
    alert(
      'Paddle is being blocked by your browser (ad-blocker or firewall).\n\n' +
      'Please disable your ad-blocker for this site, or try:\n' +
      '• Brave Shield: Click the lion icon → Shields Down\n' +
      '• uBlock Origin: Click icon → Power button off\n' +
      '• Then refresh the page and try again.'
    )
    return false
  }

  return new Promise(resolve => {
    let settled = false
    const cleanup = () => {
      settled = true
      window.removeEventListener('beforeunload', onUnload)
    }
    const onUnload = () => { if (!settled) { cleanup(); resolve(false) } }
    // Safety timeout: resolve false after 5 min so the promise doesn't hang forever
    const timeout = setTimeout(() => {
      if (!settled) { cleanup(); resolve(false) }
    }, 300_000)

    window.addEventListener('beforeunload', onUnload)

    try {
      window.Paddle.Checkout.open({
        items: [{ priceId: PRICE_ID, quantity: 1 }],
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
        },
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
      alert('Failed to open payment window. Please try again or contact support.')
      resolve(false)
    }
  })
}
