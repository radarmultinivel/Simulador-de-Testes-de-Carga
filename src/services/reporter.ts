// Desenvolvido por L. A. Leandro
// São José dos Campos - SP
// 19/05/2026

import type { LoadTestMetrics } from '../types.js'

function separator(char = '='): string {
  return char.repeat(64)
}

function formatMs(ms: number): string {
  return `${ms.toFixed(2)} ms`
}

function formatCount(n: number): string {
  return n.toLocaleString('pt-BR')
}

export function printReport(metrics: LoadTestMetrics): void {
  console.clear()
  console.log()
  console.log(separator())
  console.log('  RELATÓRIO DE TESTE DE CARGA')
  console.log(separator())
  console.log()

  console.log('  📊 Visão Geral')
  console.log(`  Total de requisições:  ${formatCount(metrics.totalRequests)}`)
  console.log(`  Tempo total:           ${formatMs(metrics.totalTimeMs)}`)
  console.log()

  console.log('  ⚡ Latência')
  console.log(`  Média:    ${formatMs(metrics.meanLatencyMs)}`)
  console.log(`  Mediana:  ${formatMs(metrics.medianLatencyMs)}`)
  console.log(`  Mínima:   ${formatMs(metrics.minLatencyMs)}`)
  console.log(`  Máxima:   ${formatMs(metrics.maxLatencyMs)}`)
  console.log(`  P95:      ${formatMs(metrics.p95LatencyMs)}`)
  console.log(`  P99:      ${formatMs(metrics.p99LatencyMs)}`)
  console.log()

  console.log('  ✅❌ Status')
  console.log(`  Sucessos:  ${formatCount(metrics.successCount)}`)
  console.log(`  Erros:     ${formatCount(metrics.errorCount)}`)
  console.log(`  Taxa de sucesso: ${((metrics.successCount / metrics.totalRequests) * 100).toFixed(2)}%`)
  console.log()

  console.log('  📋 Por Código HTTP')
  const sortedCodes = Object.entries(metrics.statusCodes).sort(
    ([a], [b]) => Number(a) - Number(b),
  )
  for (const [code, count] of sortedCodes) {
    const codeLabel = code === '0' ? 'Erro de conexão' : `HTTP ${code}`
    console.log(`  ${codeLabel}: ${formatCount(count)} requisições`)
  }
  console.log()

  if (metrics.errorCount > metrics.successCount) {
    console.log('  ⚠️  ALERTA: Mais erros do que sucessos — o servidor pode estar sobrecarregado.')
    console.log()
  }

  console.log(separator())
  console.log()
}
