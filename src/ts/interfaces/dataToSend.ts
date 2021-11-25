interface metrics {
  misses: number,
  hits: number,
  hitRate: number,
}

interface blockData {
  gameNunber: number,
  subBlockMetrics: metrics,
  passMetrics: metrics,
  noiseMetrics: metrics,
}

export interface dataToSend {
  hits: number,       // overall hitrate
  misses: number,
  hitRate: number,
  block: blockData[],
  session: string
}
