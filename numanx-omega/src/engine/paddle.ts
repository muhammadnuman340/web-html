const PADDLE_TOKEN =
  import.meta.env.VITE_PADDLE_TOKEN ?? 'test_223df1dfe41ff662cf2f5c704f8'
const PRICE_ID =
  import.meta.env.VITE_PADDLE_PRICE_ID ?? 'pri_01krpf7bkn6tnrwtzekf4f8b1t'
const PADDLE_ENV = import.meta.env.VITE_PADDLE_ENV ?? 'sandbox'

function successUrl(): string {
  const configured = import.meta.env.VITE_PADDLE_SUCCESS_URL?.trim()
  if (configured) return configured
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/?payment=success`
  }
  return '/?payment=success'
}

let _ready = false
const _listeners: Array<(ok: boolean) => void> = []

function notify(ok: boolean) {
  _ready = ok
  _listeners.forEach(fn => fn(ok))
  _listeners.length = 0
}

function initPaddle() {
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
    script.onload = () => { notify(initPaddle()); resolve(_ready) }
    script.onerror = () => { notify(false); resolve(false) }
    document.head.appendChild(script)
  })
}

export async function ensurePaddle(): Promise<boolean> {
  if (_ready) return true
  if (window.Paddle && initPaddle()) { _ready = true; return true }
  return loadScript()
}

export function onPaddleReady(fn: (ok: boolean) => void) {
  if (_ready) { fn(true); return }
  _listeners.push(fn)
}

export function isPaddleReady() { return _ready }

export async function openPaddleCheckout() {
  if (!await ensurePaddle()) {
    alert(
      'Paddle is being blocked by your browser (ad-blocker or firewall).\n\n' +
      'Please disable your ad-blocker for this site, or try:\n' +
      '• Brave Shield: Click the lion icon → Shields Down\n' +
      '• uBlock Origin: Click icon → Power button off\n' +
      '• Then refresh the page and try again.'
    )
    return
  }
  window.Paddle.Checkout.open({
    items: [{ priceId: PRICE_ID, quantity: 1 }],
    settings: { successUrl: successUrl() },
  })
}
