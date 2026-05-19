// Desenvolvido por L. A. Leandro
// São José dos Campos - SP
// 19/05/2026

import type { RequestResult, LoadTestMetrics } from '../types.js'

export function calculateMetrics(
  results: RequestResult[],
  totalTimeMs: number,
): LoadTestMetrics {
  if (results.length === 0) {
    return {
      totalTimeMs,
      totalRequests: 0,
      meanLatencyMs: 0,
      medianLatencyMs: 0,
      minLatencyMs: 0,
      maxLatencyMs: 0,
      p95LatencyMs: 0,
      p99LatencyMs: 0,
      statusCodes: {},
      successCount: 0,
      errorCount: 0,
    }
  }

  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b)
  const n = latencies.length

  const meanLatencyMs = latencies.reduce((a, b) => a + b, 0) / n
  const minLatencyMs = latencies[0]
  const maxLatencyMs = latencies[n - 1]
  const medianLatencyMs = n % 2 === 0
    ? (latencies[n / 2 - 1] + latencies[n / 2]) / 2
    : latencies[Math.floor(n / 2)]

  const p95Index = Math.ceil(n * 0.95) - 1
  const p99Index = Math.ceil(n * 0.99) - 1
  const p95LatencyMs = latencies[Math.max(0, p95Index)]
  const p99LatencyMs = latencies[Math.max(0, p99Index)]

  const statusCodes: Record<number, number> = {}
  let successCount = 0
  let errorCount = 0

  for (const r of results) {
    if (r.statusCode !== null) {
      statusCodes[r.statusCode] = (statusCodes[r.statusCode] ?? 0) + 1
    } else {
      statusCodes[0] = (statusCodes[0] ?? 0) + 1
    }

    if (r.success) {
      successCount++
    } else {
      errorCount++
    }
  }

  return {
    totalTimeMs,
    totalRequests: n,
    meanLatencyMs,
    medianLatencyMs,
    minLatencyMs,
    maxLatencyMs,
    p95LatencyMs,
    p99LatencyMs,
    statusCodes,
    successCount,
    errorCount,
  }
}
