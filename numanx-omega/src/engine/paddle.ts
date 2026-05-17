const PADDLE_TOKEN =
  import.meta.env.VITE_PADDLE_TOKEN ?? 'test_223df1dfe41ff662cf2f5c704f8'
const PRICE_ID =
  import.meta.env.VITE_PADDLE_PRICE_ID ?? 'pri_01krpf7bkn6tnrwtzekf4f8b1t'
const PADDLE_ENV = import.meta.env.VITE_PADDLE_ENV ?? 'sandbox'

let _ready = false
let _onCompleted: (() => void) | null = null

export function onCheckoutCompleted(fn: () => void) {
  _onCompleted = fn
}

function initPaddle(): boolean {
  if (!window.Paddle) return false
  try { window.Paddle.Environment?.set?.(PADDLE_ENV) } catch {}
  window.Paddle.Initialize({ token: PADDLE_TOKEN })
  return true
}

function loadScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById('paddle-checkout-sdk')) {
      resolve(initPaddle())
      return
    }
    const script = document.createElement('script')
    script.id = 'paddle-checkout-sdk'
    script.src = 'https://cdn.paddle.com/paddle/v3/paddle.js'
    script.async = true
    script.onload = () => { _ready = initPaddle(); resolve(_ready) }
    script.onerror = () => { _ready = false; resolve(false) }
    document.head.appendChild(script)
  })
}

export async function ensurePaddle(): Promise<boolean> {
  if (_ready) return true
  if (window.Paddle && initPaddle()) { _ready = true; return true }
  return loadScript()
}

export function isPaddleReady() { return _ready }

/**
 * Opens Paddle Checkout overlay. Returns true if the user completed payment.
 * Uses eventCallback to detect checkout.completed in real-time,
 * with successUrl redirect as fallback.
 *
 * NEVER falls back to free activation — user must go through Paddle.
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
    const cleanup = () => {
      window.removeEventListener('beforeunload', onUnload)
    }
    const onUnload = () => resolve(false)

    window.addEventListener('beforeunload', onUnload)

    window.Paddle.Checkout.open({
      items: [{ priceId: PRICE_ID, quantity: 1 }],
      settings: {
        displayMode: 'overlay',
        theme: 'dark',
      },
      eventCallback: (event: any) => {
        if (event.name === 'checkout.completed') {
          cleanup()
          _onCompleted?.()
          resolve(true)
        }
        if (event.name === 'checkout.closed') {
          cleanup()
          resolve(false)
        }
      },
    })
  })
}
