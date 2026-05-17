const PADDLE_TOKEN =
  import.meta.env.VITE_PADDLE_TOKEN ?? 'test_223df1dfe41ff662cf2f5c704f8'
const PRICE_ID =
  import.meta.env.VITE_PADDLE_PRICE_ID ?? 'pri_01krpf7bkn6tnrwtzekf4f8b1t'
const PADDLE_ENV = import.meta.env.VITE_PADDLE_ENV ?? 'sandbox'

let _ready = false
let _initPromise: Promise<boolean> | null = null
let _lastSdkBlocked = false
let _onCompleted: (() => void) | null = null

export function onCheckoutCompleted(fn: () => void) {
  _onCompleted = fn
}

export function wasSdkBlocked() { return _lastSdkBlocked }

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

let _loadCount = 0

function loadScript(): Promise<boolean> {
  return new Promise(resolve => {
    const existing = document.getElementById('paddle-checkout-sdk')
    if (existing) {
      existing.remove() // Remove stale script tag so we can retry
    }
    const script = document.createElement('script')
    script.id = 'paddle-checkout-sdk'
    // Try alternate CDN on retry in case main one is blocked
    script.src = _loadCount > 1
      ? 'https://cdn.jsdelivr.net/npm/@paddle/paddle-js@latest/dist/paddle.js'
      : 'https://cdn.paddle.com/paddle/v3/paddle.js'
    script.async = true
    script.onload = () => {
      initPaddle().then(ok => { _ready = ok; resolve(ok) })
    }
    script.onerror = () => {
      _ready = false
      _lastSdkBlocked = true
      console.warn('[Paddle] Script blocked (attempt ' + (_loadCount + 1) + '):', script.src)
      resolve(false)
    }
    document.head.appendChild(script)
  })
}

function resetPaddleState() {
  _ready = false
  _initPromise = null
  _lastSdkBlocked = false
  const existing = document.getElementById('paddle-checkout-sdk')
  if (existing) existing.remove()
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

  _loadCount++
  _initPromise = loadScript()
  const ok = await _initPromise
  _ready = ok
  return ok
}

export function isPaddleReady() { return _ready }

export async function retryPaddle(): Promise<boolean> {
  resetPaddleState()
  _loadCount = 0
  return ensurePaddle()
}

/**
 * Opens Paddle Checkout overlay.
 * Paddle v3 REQUIRES the SDK — there's no direct hosted checkout URL in v3.
 * If the SDK is blocked, returns false and the caller shows a retry UI.
 */
export async function openPaddleCheckout(): Promise<boolean> {
  const sdkLoaded = await ensurePaddle()

  if (!sdkLoaded) {
    // SDK blocked — cannot proceed in v3. Caller must show retry UI.
    return false
  }

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
      resolve(false)
    }
  })
}
