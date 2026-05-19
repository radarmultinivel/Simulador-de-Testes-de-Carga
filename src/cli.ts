// Desenvolvido por L. A. Leandro
// São José dos Campos - SP
// 19/05/2026

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import type { CliOptions } from './types.js'

export function parseArgs(): CliOptions {
  const argv = yargs(hideBin(process.argv))
    .usage('Uso: load-tester --url <url> --requests <n> --concurrency <n>')
    .option('url', {
      type: 'string',
      demandOption: true,
      description: 'URL alvo do teste de carga',
    })
    .option('requests', {
      type: 'number',
      demandOption: true,
      description: 'Número total de requisições a disparar',
    })
    .option('concurrency', {
      type: 'number',
      demandOption: true,
      description: 'Limite de requisições simultâneas',
    })
    .check((argv) => {
      if (argv.requests < 1) throw new Error('O número de requisições deve ser maior que zero')
      if (argv.concurrency < 1) throw new Error('O limite de concorrência deve ser maior que zero')
      if (argv.concurrency > argv.requests) {
        throw new Error('O limite de concorrência não pode exceder o total de requisições')
      }
      return true
    })
    .strict()
    .parseSync()

  return {
    url: argv.url,
    requests: argv.requests,
    concurrency: argv.concurrency,
  }
}
