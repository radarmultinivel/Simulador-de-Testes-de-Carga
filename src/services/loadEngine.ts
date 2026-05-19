// Desenvolvido por L. A. Leandro
// São José dos Campos - SP
// 19/05/2026

import type { RequestResult } from '../types.js'

class Semaphore {
  private current = 0
  private queue: Array<() => void> = []

  constructor(private maxConcurrency: number) {}

  async acquire(): Promise<void> {
    if (this.current < this.maxConcurrency) {
      this.current++
      return
    }
    return new Promise<void>((resolve) => {
      this.queue.push(resolve)
    })
  }

  release(): void {
    const next = this.queue.shift()
    if (next) {
      next()
    } else {
      this.current--
    }
  }
}

async function makeRequest(url: string): Promise<RequestResult> {
  const start = performance.now()
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(30_000),
    })
    const latencyMs = performance.now() - start
    return {
      url,
      statusCode: response.status,
      latencyMs,
      success: response.status === 200,
    }
  } catch (error) {
    const latencyMs = performance.now() - start
    const message = error instanceof Error ? error.message : String(error)
    const isTimeout = message.includes('timeout') || message.includes('abort')
    return {
      url,
      statusCode: null,
      latencyMs,
      success: false,
      error: isTimeout ? 'Timeout' : message,
    }
  }
}

export async function executeLoadTest(
  url: string,
  totalRequests: number,
  concurrency: number,
): Promise<RequestResult[]> {
  const semaphore = new Semaphore(concurrency)
  const results: RequestResult[] = []

  const tasks = Array.from({ length: totalRequests }, () =>
    semaphore.acquire().then(async () => {
      const result = await makeRequest(url)
      results.push(result)
      semaphore.release()
    }),
  )

  await Promise.all(tasks)
  return results
}
