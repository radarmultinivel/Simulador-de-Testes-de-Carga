#!/usr/bin/env node

// Desenvolvido por L. A. Leandro
// São José dos Campos - SP
// 19/05/2026

import { performance } from 'node:perf_hooks'
import { parseArgs } from './cli.js'
import { executeLoadTest } from './services/loadEngine.js'
import { calculateMetrics } from './services/metrics.js'
import { printReport } from './services/reporter.js'

async function main(): Promise<void> {
  const options = parseArgs()

  console.log()
  console.log('🚀 Iniciando teste de carga...')
  console.log(`   URL:         ${options.url}`)
  console.log(`   Requisições: ${options.requests}`)
  console.log(`   Concorrência: ${options.concurrency}`)
  console.log()

  const testStart = performance.now()
  const results = await executeLoadTest(options.url, options.requests, options.concurrency)
  const totalTimeMs = performance.now() - testStart

  const metrics = calculateMetrics(results, totalTimeMs)
  printReport(metrics)
}

main().catch((error) => {
  console.error('Erro fatal:', error)
  process.exit(1)
})
