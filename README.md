<div align="center">

# ⚡ Autocannon Dashboard

**A beautiful desktop app for running, visualising, and managing HTTP load tests.**  
Built on top of the battle-tested [autocannon](https://github.com/mcollina/autocannon) library.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron)](https://electronjs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green?logo=node.js)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](https://github.com/okobsamoht/autocannon-dashboard/releases)

[**Download**](https://github.com/okobsamoht/autocannon-dashboard/releases) · [**Landing Page**](https://okobsamoht.github.io/autocannon-dashboard) · [**Report a Bug**](https://github.com/okobsamoht/autocannon-dashboard/issues/new?template=bug_report.md) · [**Request a Feature**](https://github.com/okobsamoht/autocannon-dashboard/issues/new?template=feature_request.md)

</div>

---

## Overview

Autocannon Dashboard turns the `autocannon` CLI into a full-featured desktop experience. Organise your tests into projects, configure every option autocannon exposes through a clean UI, run tests and watch real-time charts update as traffic flows, then browse and export historical results — all without leaving the app.

> **Why?** Because pasting `autocannon -c 100 -d 30 http://...` into a terminal and staring at a scrolling table is fine once. When you're iterating on API performance across multiple services, environments, and configurations, you need a dashboard.

---

## Features

### Project Management
- Create multiple **projects**, each with its own collection of test configurations
- Edit, clone, and delete projects and configurations independently
- All data persisted locally — no account, no server, no telemetry

### Full Autocannon Configuration
Every autocannon option exposed through a tabbed form:

| Tab | Options |
|-----|---------|
| **Basic** | URL, title, method, connections, duration / request count, timeout |
| **Headers & Body** | HTTP headers (key-value editor), raw / JSON / form body |
| **Advanced** | Pipelining, workers, overall rate, connection rate, reconnect rate, bailout, max requests, forever mode, ID replacement, socket path, SNI server name, expect body |
| **Scenarios** | Multi-request sequences — define ordered request chains per connection |

### Real-Time Visualisations

Eight live charts update every second while the test runs:

| Chart | What it shows |
|-------|---------------|
| **Requests / sec** | Per-second throughput (area) |
| **Throughput** | Bytes/sec (area) |
| **Latency p50 / p75 / p90 / p99** | Four percentile lines on one chart |
| **Req/s vs Mean Latency** | Dual-axis — spot the throughput/latency trade-off |
| **Status Codes** | 2xx vs non-2xx stacked bar per second |
| **Errors / sec** | Per-second error spikes (bar) |
| **Cumulative Requests** | Running total (area) |
| **Avg Response Size** | Bytes-per-response over time |

Eight **KPI cards** above the charts show the latest tick values at a glance:  
`Req/s · Throughput · Lat mean · Lat p50 · Lat p90 · Lat p99 · Errors · Total reqs`

### Results & History
- Every completed test is stored automatically
- Browse historical runs per configuration
- Full result report: latency percentile bar chart, requests / throughput / error tables
- **Export** any result to **JSON** or **CSV** via native save dialog
- Delete individual results to manage storage

### Console Logging
Every test prints a live table to the terminal where the app was launched:

```
┌─ Autocannon ─────────────────────────────────────────┐
│  Target:  http://localhost:3000/api/users
│  Config:  50 conn · 1 pipeline · 30s
└──────────────────────────────────────────────────────┘
  Tick │    Req/s │ Throughput │ Errors │ Total reqs │  Lat p50 │  Lat p99
 ──────┼──────────┼────────────┼────────┼────────────┼──────────┼─────────
    1s │   12,840 │   3.1MB/s  │      0 │     12,840 │   3.8ms  │   9.1ms
    2s │   13,102 │   3.2MB/s  │      0 │     25,942 │   3.7ms  │   8.4ms
   ...
  ✓ Done
  Requests:   391,540 total · 13,051 req/s avg
  Latency:    p50 3.8ms · p90 7.2ms · p99 12.4ms · max 94ms
```

---

## Installation

### Download a release (recommended)

Go to [**Releases**](https://github.com/okobsamoht/autocannon-dashboard/releases) and download the installer for your platform:

| Platform | File |
|----------|------|
| Windows | `autocannon-dashboard-setup.exe` |
| macOS | `autocannon-dashboard.dmg` |
| Linux | `autocannon-dashboard.AppImage` or `.deb` |

### Build from source

**Requirements:** Node.js ≥ 18, npm ≥ 9

```bash
git clone https://github.com/okobsamoht/autocannon-dashboard.git
cd autocannon-dashboard
npm install
npm run dev          # launch in dev mode with hot-reload
```

### Build a distributable

```bash
npm run dist         # builds for current platform → release/
npm run dist:all     # builds for macOS + Windows + Linux
```

Packaged releases land in `release/`. Requires `electron-builder` (already in devDependencies).

---

## Development

### Stack

| Layer | Technology |
|-------|-----------|
| Shell | [Electron](https://electronjs.org) 33 |
| Build | [electron-vite](https://electron-vite.org) 2 |
| UI | [React](https://react.dev) 18 + [React Router](https://reactrouter.com) 6 |
| Styling | [Tailwind CSS](https://tailwindcss.com) 3 |
| Charts | [Recharts](https://recharts.org) 2 |
| Icons | [Lucide React](https://lucide.dev) |
| Storage | [electron-store](https://github.com/sindresorhus/electron-store) 8 |
| Load engine | [autocannon](https://github.com/mcollina/autocannon) 7 |

### Project structure

```
autocannon-dashboard/
├── src/
│   ├── main/
│   │   └── index.js          # Electron main process — IPC, autocannon, storage
│   ├── preload/
│   │   └── index.js          # contextBridge API surface
│   └── renderer/
│       ├── index.html
│       └── src/
│           ├── App.jsx        # Router
│           ├── index.css      # Tailwind + global styles
│           ├── components/
│           │   ├── Charts.jsx         # All Recharts chart components
│           │   ├── Layout.jsx
│           │   ├── MetricCard.jsx
│           │   ├── ResultSummary.jsx
│           │   ├── Sidebar.jsx
│           │   └── TestConfigForm.jsx # Tabbed autocannon config form
│           └── pages/
│               ├── ProjectsPage.jsx
│               ├── ProjectPage.jsx
│               ├── TestConfigPage.jsx
│               ├── RunTestPage.jsx    # Real-time charts + history
│               └── ResultPage.jsx
├── docs/                     # Landing page (GitHub Pages)
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── electron.vite.config.mjs
├── tailwind.config.js
└── package.json
```

### IPC architecture

```
Renderer (React)
    │  ipcRenderer.invoke(channel, args)
    │  ipcRenderer.on('test:tick', handler)
    ▼
Preload (contextBridge)
    │  window.api.*
    ▼
Main (ipcMain.handle)
    │  autocannon instance
    │  response events → per-second aggregation
    │  setInterval → webContents.send('test:tick', dataPoint)
    ▼
electron-store → JSON on disk
```

### Data model

```
projects[]  { id, name, description, createdAt, updatedAt }
configs[]   { id, projectId, name, config: <autocannon opts>, createdAt, updatedAt }
results[]   { id, configId, projectId, startedAt, completedAt, result, timeseries[], createdAt }
```

`timeseries` is an array of per-second snapshots:
```js
{
  tick,            // second number
  reqsPerSec,      // requests in this 1-second window
  throughputPerSec,// bytes in this window
  latencyMean,     // mean of all response times this window
  latencyP50,      // p50 of response times this window
  latencyP75, latencyP90, latencyP99,
  statusOk,        // 2xx count this window
  non2xx,          // non-2xx count this window
  avgBytesPerReq,  // mean response size this window
  errors,          // cumulative errors
  totalRequests    // cumulative requests
}
```

---

## Autocannon options reference

All options map directly to [autocannon's API](https://github.com/mcollina/autocannon#api).

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | string | — | **Required.** Target URL |
| `method` | string | `GET` | HTTP method |
| `connections` | number | `10` | Concurrent connections |
| `duration` | number | `10` | Test duration in seconds |
| `amount` | number | — | Fixed number of requests (replaces duration) |
| `timeout` | number | `10` | Request timeout in seconds |
| `pipelining` | number | `1` | Requests per connection in flight |
| `workers` | number | — | Worker threads (experimental) |
| `headers` | object | — | HTTP headers |
| `body` | string | — | Request body |
| `overallRate` | number | — | Max total req/s |
| `connectionRate` | number | — | Max req/s per connection |
| `reconnectRate` | number | — | Reconnect after N requests |
| `bailout` | number | — | Stop if req/s drops below this |
| `maxConnectionRequests` | number | — | Close connection after N requests |
| `maxOverallRequests` | number | — | Stop after N total requests |
| `forever` | boolean | `false` | Run indefinitely until stopped |
| `idReplacement` | boolean | `false` | Replace `[<id>]` in URL/body |
| `socketPath` | string | — | Unix domain socket path |
| `servername` | string | — | TLS SNI override |
| `expectBody` | string | — | Assert response body contains string |
| `requests` | array | — | Scenario: ordered request sequence |

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

**Quick start:**
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/)
4. Push and open a PR against `main`

For bugs, open an [issue](https://github.com/okobsamoht/autocannon-dashboard/issues/new?template=bug_report.md) with reproduction steps.

---

## Roadmap

- [ ] **Compare view** — overlay two results on the same chart
- [ ] **Environments** — switch base URLs without editing configs
- [ ] **Scheduled runs** — cron-based test execution
- [ ] **Threshold alerts** — fail run if p99 > N ms
- [ ] **HAR import** — convert browser recordings into test scenarios
- [ ] **Plugin system** — custom auth handlers (OAuth, AWS SigV4)
- [ ] **Team sync** — share projects via Git

---

## License

[MIT](LICENSE) © 2024 Thomas Boko
