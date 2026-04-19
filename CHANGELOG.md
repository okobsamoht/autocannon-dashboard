# Changelog

All notable changes to Autocannon Dashboard are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2024-04-19

### Added
- **Project management** — create, edit, and delete projects with names and descriptions
- **Test configurations** — full autocannon option surface exposed via a 4-tab form (Basic, Headers & Body, Advanced, Scenarios)
- **Real-time charts** — 8 live charts updating every second during a test run:
  - Requests/sec (area)
  - Throughput in bytes/sec (area)
  - Latency percentiles p50 / p75 / p90 / p99 (multi-line)
  - Req/s vs Mean Latency (dual-axis)
  - Status codes 2xx vs non-2xx (stacked bar)
  - Errors per second (bar)
  - Cumulative requests (area)
  - Average response size (area)
- **8 KPI cards** — live tick values above charts (Req/s, Throughput, Lat mean, p50, p90, p99, Errors, Total reqs)
- **Progress bar** — time-based for duration mode, request-count-based for amount mode
- **Result history** — every completed test stored, browsable per configuration
- **Full result report** — latency percentile bar chart, requests/throughput/errors tables
- **Export** — JSON and CSV via native save dialog
- **Console logging** — structured table with p50/p99 per tick, summary on completion
- **Stop test** — interrupt a running test at any point
- Dark theme throughout

[1.0.0]: https://github.com/okobsamoht/autocannon-dashboard/releases/tag/v1.0.0
