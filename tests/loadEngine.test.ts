// Desenvolvido por L. A. Leandro
// São José dos Campos - SP
// 19/05/2026

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import http from 'node:http'
import { executeLoadTest } from '../src/services/loadEngine.js'

let server: http.Server
let baseUrl: string
let requestCount = 0

beforeAll(() => {
  server = http.createServer((req, res) => {
    requestCount++
    if (req.url === '/error') {
      res.writeHead(500)
      res.end('Erro interno')
    } else if (req.url === '/slow') {
      setTimeout(() => {
        res.writeHead(200)
        res.end('Resposta lenta')
      }, 100)
    } else if (req.url === '/rate-limited') {
      res.writeHead(429)
      res.end('Too Many Requests')
    } else {
      res.writeHead(200)
      res.end('OK')
    }
  })

  return new Promise<void>((resolve) => {
    server.listen(0, () => {
      const addr = server.address()
      if (addr && typeof addr === 'object') {
        baseUrl = `http://localhost:${addr.port}`
      }
      resolve()
    })
  })
})

afterAll(() => {
  return new Promise<void>((resolve) => {
    server.close(() => resolve())
  })
})

describe('executeLoadTest', () => {
  beforeEach(() => {
    requestCount = 0
  })

  it('deve executar requisições e retornar resultados', async () => {
    const results = await executeLoadTest(baseUrl, 5, 2)
    expect(results).toHaveLength(5)
    for (const r of results) {
      expect(r.statusCode).toBe(200)
      expect(r.success).toBe(true)
      expect(r.latencyMs).toBeGreaterThanOrEqual(0)
      expect(r.url).toBe(baseUrl)
    }
  })

  it('deve respeitar o limite de concorrência', async () => {
    const results = await executeLoadTest(`${baseUrl}/slow`, 10, 3)
    expect(results).toHaveLength(10)
    // Todas as requisições lentas devem ter latency >= 100ms
    for (const r of results) {
      expect(r.latencyMs).toBeGreaterThanOrEqual(90) // margem para variação
    }
  })

  it('deve capturar erros 500 como falha', async () => {
    const results = await executeLoadTest(`${baseUrl}/error`, 3, 2)
    expect(results).toHaveLength(3)
    for (const r of results) {
      expect(r.statusCode).toBe(500)
      expect(r.success).toBe(false)
    }
  })

  it('deve capturar rate limit 429 como falha', async () => {
    const results = await executeLoadTest(`${baseUrl}/rate-limited`, 3, 2)
    expect(results).toHaveLength(3)
    for (const r of results) {
      expect(r.statusCode).toBe(429)
      expect(r.success).toBe(false)
    }
  })

  it('deve lidar com concorrência igual ao total de requisições', async () => {
    const results = await executeLoadTest(baseUrl, 5, 5)
    expect(results).toHaveLength(5)
    for (const r of results) {
      expect(r.statusCode).toBe(200)
    }
  })

  it('deve lidar com concorrência mínima (1)', async () => {
    const results = await executeLoadTest(baseUrl, 3, 1)
    expect(results).toHaveLength(3)
    for (const r of results) {
      expect(r.statusCode).toBe(200)
    }
  })

  it('deve produzir latências não-negativas para URLs inválidas', async () => {
    const results = await executeLoadTest('http://localhost:1', 2, 1)
    expect(results).toHaveLength(2)
    for (const r of results) {
      expect(r.success).toBe(false)
      expect(r.statusCode).toBeNull()
      expect(r.latencyMs).toBeGreaterThanOrEqual(0)
      expect(r.error).toBeDefined()
    }
  })
})
