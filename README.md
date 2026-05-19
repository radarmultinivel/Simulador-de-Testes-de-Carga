# Simulador de Testes de Carga

Ferramenta de linha de comando para execução de testes de estresse em servidores HTTP. Desenvolvida para validar limites de taxa, medir latencia e identificar pontos de falha em APIs e microsservicos.

## Objetivo do Programa

Permitir que engenheiros de infraestrutura e desenvolvedores realizem disparos simultaneos de requisicoes HTTP contra uma URL alvo, respeitando um limite definido de concorrencia, e obtenham metricas consolidadas de desempenho (latencia, taxa de sucesso, distribuicao de codigos de status).

## Requisitos de Sistema

- Node.js 20.x ou superior
- NPM 9.x ou superior
- Sistema operacional: Windows, Linux ou macOS
- Conexao de rede com acesso a URL alvo

## Especificacoes Tecnicas

### Funcionais

- O programa deve aceitar tres parametros via terminal: URL, total de requisicoes e limite de concorrencia
- O motor de carga deve respeitar rigorosamente o limite de requisicoes simultaneas definido
- Cada requisicao deve ter seu tempo de resposta capturado em milissegundos
- O relatorio final deve exibir: latencia media, mediana, minima, maxima, P95, P99
- A saida deve consolidar a contagem de requisicoes por codigo HTTP de resposta
- Conexoes recusadas e timeouts devem ser registrados como erros de conexao

### Nao Funcionais

- O programa nao deve travar o computador do usuario ou a rede local
- O cliente HTTP deve implementar timeout de 30 segundos por requisicao
- O calculo das metricas deve usar aritmetica de ponto flutuante com precisao de milissegundos
- O modulo de testes deve validar as formulas matematicas com dados fixos previsiveis

## Fluxograma da Arquitetura

```
+---------------------+
|    TERMINAL (CLI)   |
|  npm start -- args  |
+----------+----------+
           |
           v
+----------+----------+
|    src/index.ts     |  Ponto de entrada
|  main()             |  Orquestra o pipeline
+----------+----------+
           |
           v
+----------+----------+
|    src/cli.ts       |  Parsing e validacao
|  parseArgs()        |  yargs + regras de
|                     |  consistencia
+----------+----------+
           |
           v
+----------+----------+
|  loadEngine.ts      |  Motor de carga
|  Semaphore class    |  Controle de concorrencia
|  makeRequest()      |  fetch + performance.now()
|  executeLoadTest()  |  Disparo em lote
+----------+----------+
           |
           v
+----------+----------+
|  metrics.ts         |  Calculadora
|  calculateMetrics() |  Media, mediana, P95,
|                     |  P99, min, max, status
+----------+----------+
           |
           v
+----------+----------+
|  reporter.ts        |  Formatacao
|  printReport()      |  Console.clear() +
|                     |  tabela formatada
+----------+----------+
           |
           v
+----------+----------+
|   SAIDA DO TERMINAL |
|  Relatorio completo |
+---------------------+
```

## Stacks, Tecnologias e Dependencias

### Ambiente de Execucao

| Componente       | Especificacao                        |
|------------------|--------------------------------------|
| Runtime          | Node.js 20+                          |
| Linguagem        | TypeScript 5.6 (compilado para ES2022)|
| Module System    | ESM (import/export)                  |

### Dependencias de Producao

| Pacote  | Versao   | Funcao                                |
|---------|----------|---------------------------------------|
| yargs   | 17.7.x   | Parsing de argumentos da linha de comando|

### Dependencias de Desenvolvimento

| Pacote          | Versao   | Funcao                                |
|-----------------|----------|---------------------------------------|
| typescript      | 5.6.x    | Compilador TypeScript                 |
| tsx             | 4.19.x   | Execucao de TypeScript sem compilacao |
| vitest          | 2.1.x    | Framework de testes unitarios         |
| @types/node     | 22.x     | Tipagens do Node.js                   |
| @types/yargs    | 17.x     | Tipagens do yargs                     |

### API Nativa

- `fetch()` — Cliente HTTP nativo do Node.js (baseado em undici)
- `performance.now()` — Medicao de latencia em milissegundos com alta resolucao temporal
- `AbortSignal.timeout()` — Controle de timeout por requisicao (30s)

## Instalacao

```bash
git clone https://github.com/radarmultinivel/Simulador-de-Testes-de-Carga.git
cd Simulador-de-Testes-de-Carga
npm install
```

A compilacao do TypeScript e opcional, pois o `tsx` executa o codigo fonte diretamente:

```bash
npm run build
```

## Manual do Usuario

### Sintaxe

```
npm start -- --url <URL> --requests <N> --concurrency <N>
```

### Parametros

| Parametro       | Tipo     | Descricao                            |
|-----------------|----------|--------------------------------------|
| --url           | string   | URL completa do servidor alvo        |
| --requests      | number   | Quantidade total de requisicoes      |
| --concurrency   | number   | Numero maximo de requisicoes simultaneas|

### Exemplos de Execucao

Teste basico contra um servidor local:

```bash
npm start -- --url http://localhost:3000/api/health --requests 50 --concurrency 5
```

Teste contra API publica com carga elevada:

```bash
npx tsx src/index.ts --url https://jsonplaceholder.typicode.com/posts --requests 500 --concurrency 25
```

Validacao de rate limit:

```bash
npm start -- --url https://gateway.exemplo.com/v1/clientes --requests 100 --concurrency 20
```

### Leitura do Relatorio

A saida do programa apresenta as seguintes secoes:

- **Visao Geral**: total de requisicoes disparadas e tempo total decorrido do teste
- **Latencia**: estatisticas descritivas dos tempos de resposta (media, mediana, P95, P99, minimo, maximo)
- **Status**: contagem de sucessos (HTTP 200) e erros (qualquer codigo diferente de 200)
- **Por Codigo HTTP**: detalhamento da frequencia de cada codigo de status retornado
- **Alerta**: exibido quando o numero de erros supera o numero de sucessos, indicando possivel sobrecarga

Interpretacao das metricas:

- Latencia media abaixo de 200ms indica bom desempenho
- P95 elevado em relacao a media sugere variacao na resposta do servidor (caudas de latencia)
- Erros HTTP 429 indicam que o rate limit do servidor foi acionado
- Erros HTTP 500 indicam falha interna do servidor sob carga
- Erros de conexao (codigo 0) indicam que o servidor recusou ou nao respondeu a requisicao

## Testes

### Execucao

```bash
npm test
```

### Cobertura

O conjunto de testes esta dividido em dois arquivos:

| Arquivo                 | Tipo            | Casos testados                                           |
|-------------------------|-----------------|----------------------------------------------------------|
| tests/metrics.test.ts   | Unitario        | Lista vazia, requisicao unica, mediana par/impar, P95/P99, contagem de status codes, erros de conexao, cenario misto |
| tests/loadEngine.test.ts| Integracao      | Requisicoes com servidor mock, limite de concorrencia, erros 500, rate limit 429, concorrencia maxima/minima, URL invalida |

Os testes de integracao utilizam o modulo `http` nativo do Node.js para criar um servidor HTTP temporario que simula respostas 200, 500, 429 e atrasos de 100ms, permitindo validar o comportamento do motor de carga sem depender de servicos externos.

## Scripts Disponiveis

| Comando              | Descricao                                    |
|----------------------|----------------------------------------------|
| npm run build        | Compila TypeScript para o diretorio dist/    |
| npm start            | Executa o simulador via tsx                  |
| npm run dev          | Modo watch para desenvolvimento              |
| npm test             | Executa todos os testes com Vitest           |
| npm run test:watch   | Executa testes em modo observe               |

## Estrutura do Projeto

```
src/
  index.ts              Ponto de entrada do programa
  cli.ts                Leitura e validacao dos argumentos da CLI
  types.ts              Interfaces compartilhadas (RequestResult, LoadTestMetrics, CliOptions)
  services/
    loadEngine.ts       Implementacao do semaforo e disparo de requisicoes
    metrics.ts          Calculo das metricas estatisticas
    reporter.ts         Formatacao e exibicao do relatorio no terminal
tests/
  metrics.test.ts       Testes unitarios do modulo de metricas
  loadEngine.test.ts    Testes de integracao com servidor HTTP mock
.gitignore
package.json
tsconfig.json
vitest.config.ts
README.md
LICENSE
```

## Licenca

Distribuido sob licenca MIT. Consulte o arquivo LICENSE para mais informacoes.
