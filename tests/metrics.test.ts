// Desenvolvido por L. A. Leandro
// São José dos Campos - SP
// 19/05/2026

import { describe, it, expect } from 'vitest'
import { calculateMetrics } from '../src/services/metrics.js'
import type { RequestResult } from '../src/types.js'

function makeResult(overrides: Partial<RequestResult>): RequestResult {
  return {
    url: 'http://localhost:3000',
    statusCode: 200,
    latencyMs: 100,
    success: true,
    ...overrides,
  }
}

describe('calculateMetrics', () => {
  it('deve retornar métricas zeradas para lista vazia', () => {
    const metrics = calculateMetrics([], 0)
    expect(metrics.totalRequests).toBe(0)
    expect(metrics.meanLatencyMs).toBe(0)
    expect(metrics.minLatencyMs).toBe(0)
    expect(metrics.maxLatencyMs).toBe(0)
    expect(metrics.successCount).toBe(0)
    expect(metrics.errorCount).toBe(0)
    expect(metrics.totalTimeMs).toBe(0)
  })

  it('deve calcular métricas corretas para uma única requisição', () => {
    const results = [makeResult({ latencyMs: 150 })]
    const metrics = calculateMetrics(results, 500)
    expect(metrics.totalRequests).toBe(1)
    expect(metrics.meanLatencyMs).toBe(150)
    expect(metrics.medianLatencyMs).toBe(150)
    expect(metrics.minLatencyMs).toBe(150)
    expect(metrics.maxLatencyMs).toBe(150)
    expect(metrics.p95LatencyMs).toBe(150)
    expect(metrics.p99LatencyMs).toBe(150)
    expect(metrics.totalTimeMs).toBe(500)
    expect(metrics.successCount).toBe(1)
    expect(metrics.errorCount).toBe(0)
  })

  it('deve calcular média, mínimo e máximo corretamente', () => {
    const latencies = [10, 20, 30, 40, 50]
    const results = latencies.map((latencyMs) => makeResult({ latencyMs }))
    const metrics = calculateMetrics(results, 1000)

    expect(metrics.totalRequests).toBe(5)
    expect(metrics.meanLatencyMs).toBe(30)
    expect(metrics.minLatencyMs).toBe(10)
    expect(metrics.maxLatencyMs).toBe(50)
    expect(metrics.medianLatencyMs).toBe(30)
    expect(metrics.totalTimeMs).toBe(1000)
  })

  it('deve calcular mediana par corretamente', () => {
    // Para vetor par, mediana = média dos dois elementos centrais
    const latencies = [10, 20, 30, 40]
    const results = latencies.map((latencyMs) => makeResult({ latencyMs }))
    const metrics = calculateMetrics(results, 500)

    expect(metrics.medianLatencyMs).toBe(25)
  })

  it('deve calcular mediana ímpar corretamente', () => {
    const latencies = [10, 20, 30, 40, 50]
    const results = latencies.map((latencyMs) => makeResult({ latencyMs }))
    const metrics = calculateMetrics(results, 500)

    expect(metrics.medianLatencyMs).toBe(30)
  })

  it('deve calcular P95 e P99 corretamente', () => {
    // 100 latências de 1 a 100
    const latencies = Array.from({ length: 100 }, (_, i) => i + 1)
    const results = latencies.map((latencyMs) => makeResult({ latencyMs }))
    const metrics = calculateMetrics(results, 2000)

    // P95 (95o valor) = 95, P99 (99o valor) = 99
    expect(metrics.p95LatencyMs).toBe(95)
    expect(metrics.p99LatencyMs).toBe(99)
  })

  it('deve contar status codes corretamente', () => {
    const results: RequestResult[] = [
      makeResult({ statusCode: 200, success: true }),
      makeResult({ statusCode: 200, success: true }),
      makeResult({ statusCode: 404, success: false }),
      makeResult({ statusCode: 500, success: false }),
      makeResult({ statusCode: 429, success: false }),
    ]
    const metrics = calculateMetrics(results, 1000)

    expect(metrics.statusCodes[200]).toBe(2)
    expect(metrics.statusCodes[404]).toBe(1)
    expect(metrics.statusCodes[500]).toBe(1)
    expect(metrics.statusCodes[429]).toBe(1)
    expect(metrics.successCount).toBe(2)
    expect(metrics.errorCount).toBe(3)
  })

  it('deve tratar erros de conexão (statusCode null) como código 0', () => {
    const results: RequestResult[] = [
      makeResult({ statusCode: null, success: false, error: 'Timeout' }),
      makeResult({ statusCode: null, success: false, error: 'ECONNREFUSED' }),
      makeResult({ statusCode: 200, success: true }),
    ]
    const metrics = calculateMetrics(results, 500)

    expect(metrics.statusCodes[0]).toBe(2)
    expect(metrics.statusCodes[200]).toBe(1)
    expect(metrics.successCount).toBe(1)
    expect(metrics.errorCount).toBe(2)
  })

  it('deve calcular taxa de sucesso para cenário misto', () => {
    const results: RequestResult[] = [
      makeResult({ statusCode: 200, success: true }),
      makeResult({ statusCode: 200, success: true }),
      makeResult({ statusCode: 200, success: true }),
      makeResult({ statusCode: 500, success: false }),
    ]
    const metrics = calculateMetrics(results, 1000)

    expect(metrics.successCount).toBe(3)
    expect(metrics.errorCount).toBe(1)
    expect(metrics.totalRequests).toBe(4)
  })
})
