// Light is the default theme. Dark is opt-in through the header toggle or Settings.
export type Theme = 'light' | 'dark'

const KEY = 'nx_theme'

export function getTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function setTheme(theme: Theme): void {
  document.body.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem(KEY, theme)
  } catch { /* storage blocked */ }
}
