const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const { join } = require('path')
const { writeFile } = require('fs/promises')
const { randomUUID } = require('crypto')
const Store = require('electron-store')
const autocannon = require('autocannon')

const store = new Store({
  defaults: { projects: [], configs: [], results: [] }
})

let mainWindow = null
let currentInstance = null
let samplerTimer = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ── Projects ───────────────────────────────────────────────────────────────

ipcMain.handle('projects:list', () => store.get('projects', []))

ipcMain.handle('projects:create', (_, data) => {
  const projects = store.get('projects', [])
  const project = {
    id: randomUUID(),
    name: data.name,
    description: data.description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  store.set('projects', [...projects, project])
  return project
})

ipcMain.handle('projects:update', (_, { id, data }) => {
  const projects = store.get('projects', [])
  const idx = projects.findIndex(p => p.id === id)
  if (idx === -1) throw new Error('Project not found')
  projects[idx] = { ...projects[idx], ...data, updatedAt: new Date().toISOString() }
  store.set('projects', projects)
  return projects[idx]
})

ipcMain.handle('projects:delete', (_, id) => {
  const configIds = store.get('configs', []).filter(c => c.projectId === id).map(c => c.id)
  store.set('projects', store.get('projects', []).filter(p => p.id !== id))
  store.set('configs', store.get('configs', []).filter(c => c.projectId !== id))
  store.set('results', store.get('results', []).filter(r => !configIds.includes(r.configId)))
  return true
})

// ── Configs ─────────────────────────────────────────────────────────────────

ipcMain.handle('configs:list', (_, projectId) =>
  store.get('configs', []).filter(c => c.projectId === projectId)
)

ipcMain.handle('configs:get', (_, id) =>
  store.get('configs', []).find(c => c.id === id)
)

ipcMain.handle('configs:create', (_, data) => {
  const configs = store.get('configs', [])
  const config = {
    id: randomUUID(),
    projectId: data.projectId,
    name: data.name,
    config: data.config,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  store.set('configs', [...configs, config])
  return config
})

ipcMain.handle('configs:update', (_, { id, data }) => {
  const configs = store.get('configs', [])
  const idx = configs.findIndex(c => c.id === id)
  if (idx === -1) throw new Error('Config not found')
  configs[idx] = { ...configs[idx], ...data, updatedAt: new Date().toISOString() }
  store.set('configs', configs)
  return configs[idx]
})

ipcMain.handle('configs:delete', (_, id) => {
  store.set('configs', store.get('configs', []).filter(c => c.id !== id))
  store.set('results', store.get('results', []).filter(r => r.configId !== id))
  return true
})

// ── Test Running ─────────────────────────────────────────────────────────────

ipcMain.handle('test:run', (event, { configId, acConfig }) => {
  if (currentInstance) return { error: 'A test is already running' }

  const startedAt = new Date().toISOString()
  const timeseries = []

  return new Promise((resolve) => {
    const opts = { ...acConfig, trackResponses: true }
    delete opts.setupClient
    delete opts.verifyBody

    const instance = autocannon(opts)
    currentInstance = instance

    const label = acConfig.title || acConfig.url
    const fmtBytes = (b) => b >= 1048576 ? `${(b/1048576).toFixed(1)}MB/s` : b >= 1024 ? `${(b/1024).toFixed(1)}KB/s` : `${b}B/s`
    const pad = (s, n) => String(s).padStart(n)

    console.log(`\n\x1b[1m\x1b[36m┌─ Autocannon ─────────────────────────────────────────┐\x1b[0m`)
    console.log(`\x1b[36m│\x1b[0m  \x1b[1mTarget:\x1b[0m  ${acConfig.url}`)
    console.log(`\x1b[36m│\x1b[0m  \x1b[1mConfig:\x1b[0m  ${acConfig.connections} conn · ${acConfig.pipelining ?? 1} pipeline · ${acConfig.amount ? `${acConfig.amount} reqs` : `${acConfig.duration ?? 10}s`}`)
    console.log(`\x1b[1m\x1b[36m└──────────────────────────────────────────────────────┘\x1b[0m`)
    console.log(`\x1b[90m  Tick │    Req/s │ Throughput │ Errors │ Total reqs │  Lat p50 │  Lat p99\x1b[0m`)
    console.log(`\x1b[90m ──────┼──────────┼────────────┼────────┼────────────┼──────────┼─────────\x1b[0m`)

    function pct(sorted, p) {
      if (!sorted.length) return 0
      return sorted[Math.max(0, Math.ceil(p / 100 * sorted.length) - 1)]
    }

    // Per-second window counters (reset each tick)
    let reqsInWindow = 0
    let bytesInWindow = 0
    let latencySamples = []  // all response times this window for percentiles
    let statusOkInWindow = 0
    let non2xxInWindow = 0
    // Cumulative counters
    let errorsTotal = 0
    let timeoutsTotal = 0
    let totalRequests = 0
    let tickCount = 0

    instance.on('response', (_client, statusCode, resBytes, responseTime) => {
      reqsInWindow++
      bytesInWindow += resBytes || 0
      totalRequests++
      latencySamples.push(responseTime || 0)
      if (statusCode >= 200 && statusCode < 300) {
        statusOkInWindow++
      } else {
        non2xxInWindow++
      }
    })

    instance.on('reqError', () => {
      errorsTotal++
      totalRequests++
      non2xxInWindow++
    })

    samplerTimer = setInterval(() => {
      if (!currentInstance) return clearInterval(samplerTimer)

      const sorted = latencySamples.slice().sort((a, b) => a - b)
      const latencyMean = sorted.length ? sorted.reduce((s, v) => s + v, 0) / sorted.length : 0
      const latencyP50  = pct(sorted, 50)
      const latencyP75  = pct(sorted, 75)
      const latencyP90  = pct(sorted, 90)
      const latencyP99  = pct(sorted, 99)
      const avgBytesPerReq = reqsInWindow > 0 ? bytesInWindow / reqsInWindow : 0

      const dataPoint = {
        tick: ++tickCount,
        timestamp: Date.now(),
        reqsPerSec: reqsInWindow,
        throughputPerSec: bytesInWindow,
        errors: errorsTotal,
        timeouts: timeoutsTotal,
        totalRequests,
        latencyMean,
        latencyP50,
        latencyP75,
        latencyP90,
        latencyP99,
        statusOk: statusOkInWindow,
        non2xx: non2xxInWindow,
        avgBytesPerReq
      }

      const errColor = errorsTotal > 0 ? '\x1b[31m' : '\x1b[32m'
      console.log(
        `\x1b[90m  \x1b[0m${pad(tickCount + 's', 5)} \x1b[90m│\x1b[0m` +
        ` ${pad(reqsInWindow.toLocaleString(), 8)} \x1b[90m│\x1b[0m` +
        ` ${pad(fmtBytes(bytesInWindow), 10)} \x1b[90m│\x1b[0m` +
        ` ${errColor}${pad(errorsTotal, 6)}\x1b[0m \x1b[90m│\x1b[0m` +
        ` ${pad(totalRequests.toLocaleString(), 10)} \x1b[90m│\x1b[0m` +
        ` ${pad(latencyP50.toFixed(1) + 'ms', 8)} \x1b[90m│\x1b[0m` +
        ` ${pad(latencyP99.toFixed(1) + 'ms', 7)}`
      )

      // Reset per-window counters
      reqsInWindow = 0
      bytesInWindow = 0
      latencySamples = []
      statusOkInWindow = 0
      non2xxInWindow = 0

      timeseries.push(dataPoint)
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('test:tick', dataPoint)
      }
    }, 1000)

    instance.on('done', (result) => {
      clearInterval(samplerTimer)
      samplerTimer = null
      currentInstance = null

      const r = result
      console.log(`\x1b[90m ──────┴──────────┴────────────┴────────┴────────────┴──────────┴─────────\x1b[0m`)
      console.log(`\n\x1b[1m\x1b[32m  ✓ Done\x1b[0m`)
      console.log(`\x1b[90m  Requests:   \x1b[0m${r.requests.total.toLocaleString()} total · \x1b[1m${r.requests.average.toFixed(0)} req/s\x1b[0m avg`)
      console.log(`\x1b[90m  Throughput: \x1b[0m${fmtBytes(r.throughput.average)} avg`)
      console.log(`\x1b[90m  Latency:    \x1b[0mp50 \x1b[1m${r.latency.p50}ms\x1b[0m · p90 \x1b[1m${r.latency.p90}ms\x1b[0m · p99 \x1b[1m${r.latency.p99}ms\x1b[0m · max \x1b[1m${r.latency.max}ms\x1b[0m`)
      if (r.errors > 0)   console.log(`\x1b[31m  Errors:     ${r.errors}\x1b[0m`)
      if (r.timeouts > 0) console.log(`\x1b[31m  Timeouts:   ${r.timeouts}\x1b[0m`)
      if (r['non2xx'] > 0) console.log(`\x1b[33m  Non-2xx:    ${r['non2xx']}\x1b[0m`)
      console.log('')

      const cfg = store.get('configs', []).find(c => c.id === configId)
      const record = {
        id: randomUUID(),
        configId,
        projectId: cfg?.projectId,
        startedAt,
        completedAt: new Date().toISOString(),
        result,
        timeseries,
        createdAt: new Date().toISOString()
      }

      const results = store.get('results', [])
      store.set('results', [...results, record])

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('test:done', record)
      }
      resolve(record)
    })

    instance.on('error', (err) => {
      clearInterval(samplerTimer)
      samplerTimer = null
      currentInstance = null
      const msg = err?.message || String(err)
      console.log(`\x1b[31m  ✗ Error: ${msg}\x1b[0m\n`)
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('test:error', msg)
      }
      resolve({ error: msg })
    })
  })
})

ipcMain.handle('test:stop', () => {
  if (currentInstance) {
    currentInstance.stop()
    clearInterval(samplerTimer)
    samplerTimer = null
    currentInstance = null
    console.log(`\x1b[33m  ⏹ Test stopped by user\x1b[0m\n`)
    return true
  }
  return false
})

ipcMain.handle('test:isRunning', () => !!currentInstance)

// ── Results ──────────────────────────────────────────────────────────────────

ipcMain.handle('results:list', (_, configId) =>
  store.get('results', [])
    .filter(r => r.configId === configId)
    .map(({ timeseries: _, ...r }) => r)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
)

ipcMain.handle('results:get', (_, id) =>
  store.get('results', []).find(r => r.id === id)
)

ipcMain.handle('results:delete', (_, id) => {
  store.set('results', store.get('results', []).filter(r => r.id !== id))
  return true
})

ipcMain.handle('results:export', async (_, { id, format }) => {
  const record = store.get('results', []).find(r => r.id === id)
  if (!record) return { error: 'Result not found' }

  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `autocannon-result-${record.startedAt.split('T')[0]}`,
    filters: format === 'csv'
      ? [{ name: 'CSV', extensions: ['csv'] }]
      : [{ name: 'JSON', extensions: ['json'] }]
  })

  if (!filePath) return { cancelled: true }

  let content
  if (format === 'csv') {
    const r = record.result
    const rows = [
      ['Metric', 'Value'],
      ['URL', r.url],
      ['Title', r.title || ''],
      ['Connections', r.connections],
      ['Pipelining', r.pipelining],
      ['Duration (s)', r.duration],
      ['Requests Total', r.requests.total],
      ['Requests Sent', r.requests.sent],
      ['Requests/sec Average', r.requests.average.toFixed(2)],
      ['Requests/sec Mean', r.requests.mean.toFixed(2)],
      ['Throughput Total (bytes)', r.throughput.total],
      ['Throughput/sec Average (bytes)', r.throughput.average.toFixed(2)],
      ['Latency Average (ms)', r.latency.average.toFixed(2)],
      ['Latency Stdev (ms)', r.latency.stddev.toFixed(2)],
      ['Latency p2.5 (ms)', r.latency.p2_5],
      ['Latency p50 (ms)', r.latency.p50],
      ['Latency p75 (ms)', r.latency.p75],
      ['Latency p90 (ms)', r.latency.p90],
      ['Latency p97.5 (ms)', r.latency.p97_5],
      ['Latency p99 (ms)', r.latency.p99],
      ['Latency p99.9 (ms)', r.latency.p999],
      ['Latency Max (ms)', r.latency.max],
      ['Errors', r.errors],
      ['Timeouts', r.timeouts],
      ['Non-2xx Responses', r['non2xx'] || 0],
      ['Resets', r.resets || 0]
    ]
    content = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  } else {
    content = JSON.stringify(record, null, 2)
  }

  await writeFile(filePath, content, 'utf-8')
  return { success: true, filePath }
})

ipcMain.handle('results:openFile', async (_, filePath) => {
  await shell.openPath(filePath)
})
