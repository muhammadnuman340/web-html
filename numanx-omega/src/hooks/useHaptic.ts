export function useHaptic() {
  const enabled = localStorage.getItem('uc_haptic') !== 'off'
  const trigger = (duration = 10) => {
    if (enabled && navigator.vibrate) navigator.vibrate(duration)
  }
  return { trigger }
}
