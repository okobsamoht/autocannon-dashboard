# Roadmap

> Status legend: 🟢 Done · 🔵 In progress · ⬜ Planned · 💡 Idea

## v1.0 — Foundation ✅
- 🟢 Project & configuration management
- 🟢 Full autocannon option surface (4-tab form)
- 🟢 Real-time charts (req/s, throughput, latency, errors, status, cumulative, avg size)
- 🟢 Live latency percentiles (p50 / p75 / p90 / p99) per second
- 🟢 Result history, full report, JSON/CSV export
- 🟢 Console logging with structured table output
- 🟢 Windows / macOS / Linux support

## v1.1 — Compare & Annotate ⬜
- ⬜ **Compare view** — overlay two result runs on the same chart set
- ⬜ **Annotations** — mark a deploy or config change on the timeline
- ⬜ **Run notes** — attach free-text notes to a result before saving
- ⬜ **Config clone** — duplicate an existing configuration

## v1.2 — Environments ⬜
- ⬜ **Environments** — define named base URLs (local / staging / production) and switch without editing configs
- ⬜ **Variable substitution** — `{{BASE_URL}}`, `{{TOKEN}}` in URLs and headers, resolved per environment
- ⬜ **Environment import** — load `.env` files directly

## v1.3 — Thresholds & Alerts ⬜
- ⬜ **Pass/fail thresholds** — define SLOs (e.g. p99 < 200ms, error rate < 0.1%) that mark a run as failed
- ⬜ **Desktop notification** — alert when a test completes or threshold is breached
- ⬜ **Exit code** — for CI: non-zero exit if thresholds not met

## v1.4 — Import & Integration ⬜
- ⬜ **HAR import** — convert a browser HAR recording into a multi-request scenario
- ⬜ **Postman / Insomnia import** — import collections as test configurations
- ⬜ **OpenAPI / Swagger** — generate scenario from spec endpoint list
- ⬜ **CLI bridge** — `autocannon-dashboard run <config-id>` from terminal

## v1.5 — Scheduled Runs ⬜
- ⬜ **Cron scheduler** — configure tests to run on a schedule (e.g. every night at 2 AM)
- ⬜ **Trend charts** — p99 latency and req/s over the last N runs in a sparkline on the project page
- ⬜ **Regression alerts** — notify when a metric degrades by more than X% vs. the last run

## v2.0 — Team Features 💡
- 💡 **Git-backed projects** — store projects and configs as JSON in a Git repo, share across the team
- 💡 **Remote runner** — schedule a test on a remote machine and stream results back
- 💡 **Plugin API** — custom auth handlers, request transformers (OAuth 2.0, AWS SigV4, JWT refresh)
- 💡 **Report sharing** — generate a shareable static HTML report from any result

---

Have a feature idea? [Open an issue](https://github.com/okobsamoht/autocannon-dashboard/issues/new?template=feature_request.md) — the roadmap is community-driven.
