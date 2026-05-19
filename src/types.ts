// Desenvolvido por L. A. Leandro
// São José dos Campos - SP
// 19/05/2026

export interface RequestResult {
  url: string
  statusCode: number | null
  latencyMs: number
  success: boolean
  error?: string
}

export interface LoadTestMetrics {
  totalTimeMs: number
  totalRequests: number
  meanLatencyMs: number
  medianLatencyMs: number
  minLatencyMs: number
  maxLatencyMs: number
  p95LatencyMs: number
  p99LatencyMs: number
  statusCodes: Record<number, number>
  successCount: number
  errorCount: number
}

export interface CliOptions {
  url: string
  requests: number
  concurrency: number
}
