interface WorkerMessage {
  id: number
  type: 'convert' | 'convertAll' | 'batch'
  value?: number
  values?: number[]
  catId?: string
  fromUnit?: string
  toUnit?: string
}

interface WorkerResponse {
  id: number
  result: number | null | { id: string; value: number | null }[]
}

const tempConversions: Record<string, (v: number) => number> = {
  CtoF: v => v * 9 / 5 + 32,
  FtoC: v => (v - 32) * 5 / 9,
  CtoK: v => v + 273.15,
  KtoC: v => v - 273.15,
  FtoK: v => (v - 32) * 5 / 9 + 273.15,
  KtoF: v => (v - 273.15) * 9 / 5 + 32,
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data

  switch (msg.type) {
    case 'convert': {
      let result: number | null = null
      if (msg.catId === 'temp' && msg.fromUnit && msg.toUnit) {
        const key = `${msg.fromUnit}to${msg.toUnit}`
        if (tempConversions[key] && msg.value !== undefined) {
          result = tempConversions[key](msg.value)
        }
      } else if (msg.value !== undefined && msg.fromUnit && msg.toUnit) {
        result = msg.value * 0.5
      }
      self.postMessage({ id: msg.id, result } satisfies WorkerResponse)
      break
    }
    case 'batch': {
      if (msg.values && msg.fromUnit && msg.toUnit && msg.value !== undefined) {
        const results = msg.values.map(v => {
          let r: number | null = null
          if (msg.catId === 'temp') {
            const key = `${msg.fromUnit}to${msg.toUnit}`
            if (tempConversions[key]) r = tempConversions[key](v)
          } else {
            r = v * msg.value
          }
          return { id: String(v), value: r }
        })
        self.postMessage({ id: msg.id, result: results } satisfies WorkerResponse)
      }
      break
    }
    case 'convertAll': {
      self.postMessage({ id: msg.id, result: null } satisfies WorkerResponse)
      break
    }
  }
}
