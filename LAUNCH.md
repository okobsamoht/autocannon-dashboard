# Launch Checklist

A step-by-step guide to ship Autocannon Dashboard publicly.

---

## 1. Repository

- [ ] Push all code to `main` on GitHub
- [ ] Set repo description: *"Desktop dashboard for autocannon HTTP load testing — real-time charts, latency percentiles, project management"*
- [ ] Add topics: `autocannon` `load-testing` `electron` `performance` `benchmarking` `developer-tools` `nodejs` `http`
- [ ] Add website URL (GitHub Pages)
- [ ] Enable **Issues** and **Discussions**
- [ ] Pin the repo on your GitHub profile

## 2. GitHub Pages (Landing Page)

- [ ] Go to **Settings → Pages**
- [ ] Source: `Deploy from a branch` → branch `main`, folder `/docs`
- [ ] Wait ~2 minutes, then verify: `https://okobsamoht.github.io/autocannon-dashboard/`
- [ ] Verify OG image loads: `https://okobsamoht.github.io/autocannon-dashboard/og.svg`
- [ ] Verify press kit loads: `https://okobsamoht.github.io/autocannon-dashboard/press.html`

## 3. First Release (v1.0.0)

- [ ] Install electron-builder: `npm install` (already in devDependencies)
- [ ] Tag the release:
  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```
- [ ] The `release.yml` workflow builds installers for all 3 platforms automatically
- [ ] Go to **Releases** → edit the draft → paste CHANGELOG.md content → publish
- [ ] Verify download links work for all platforms

## 4. Screenshots & Demo

- [ ] Take a screenshot of the Projects page (empty state)
- [ ] Take a screenshot of a test running with all 8 charts visible
- [ ] Take a screenshot of a completed result report
- [ ] Record a short GIF or video (≤60s) showing: create project → configure test → run → charts → result
- [ ] Add screenshots to README.md `## Screenshots` section
- [ ] Recommended tools: **Kap** (macOS), **ScreenToGif** (Windows), **Peek** (Linux)

## 5. Product Hunt

- [ ] Create a maker account at producthunt.com
- [ ] Schedule the launch for a **Tuesday or Wednesday** (highest traffic)
- [ ] **Tagline** (60 chars max):
  > Load testing with real-time charts — no CLI required
- [ ] **Description** (260 chars):
  > Autocannon Dashboard is a free desktop app that gives autocannon a proper UI. Configure HTTP load tests, watch 8 live charts update per second (req/s, p50/p90/p99, errors, status codes), and browse test history. Windows, macOS, Linux. MIT licensed.
- [ ] Add the OG image (`docs/og.svg`) as the gallery image
- [ ] Add the demo GIF/video
- [ ] Topics to select: `Developer Tools`, `Open Source`, `Productivity`, `Node.js`
- [ ] Thumbnail: use the logo icon (blue square with lightning bolt)
- [ ] First comment: post a brief maker's note explaining why you built it
- [ ] Share the PH link on all channels the moment it goes live

## 6. Hacker News

- [ ] Post to **Show HN**: `Show HN: Autocannon Dashboard – desktop UI for HTTP load testing with real-time charts`
- [ ] Include: what it does, why you built it, link to repo, link to landing page
- [ ] Post between 8–10 AM US Eastern Time on a weekday
- [ ] Engage with every comment in the first 2 hours

## 7. Reddit

- [ ] r/node — `[Show] Autocannon Dashboard: Electron desktop UI for load testing with real-time charts`
- [ ] r/webdev — focus on the UX/DX angle
- [ ] r/programming — if it makes Show HN front page, cross-post
- [ ] r/electronjs — native audience

## 8. Dev Communities

- [ ] **dev.to** — write a post: *"I built a desktop dashboard for autocannon because the CLI wasn't enough"*
  - Walkthrough of the architecture (IPC, real-time percentiles, response event counting)
  - Include the console output screenshot
  - Link to GitHub + Product Hunt
- [ ] **Hashnode** — cross-post the dev.to article
- [ ] **Twitter/X** — thread: problem → solution → demo GIF → link
  - Tag: `#nodejs` `#electronjs` `#loadtesting` `#devtools` `#opensource`
- [ ] **LinkedIn** — professional announcement post
- [ ] **Discord** — Electron server `#show-off`, Node.js server `#projects`

## 9. Reach Out

- [ ] Email the autocannon maintainer (Matteo Collina) — let him know a dashboard exists
- [ ] Post in the autocannon GitHub Discussions if one exists
- [ ] Reach out to Node.js newsletter editors (Node Weekly, JavaScript Weekly)
- [ ] Reach out to podcast hosts (Syntax.fm, JS Party) for a mention

## 10. Post-Launch

- [ ] Respond to every GitHub issue within 24 hours for the first week
- [ ] Monitor crash reports and fix critical bugs within 48 hours (patch release)
- [ ] Update README with actual screenshots from production
- [ ] Add a `## Used by` section as testimonials come in
- [ ] Write a retrospective post 2 weeks after launch

---

## Copy Templates

### Tweet
```
🚀 Built a desktop dashboard for autocannon because I was tired of staring at a scrolling terminal

✅ 8 live charts (req/s, throughput, p50/p90/p99, errors, status codes)
✅ Full autocannon config — no CLI flags
✅ Project & result management
✅ Windows / macOS / Linux — free & MIT

[demo GIF]

→ GitHub: https://github.com/okobsamoht/autocannon-dashboard
```

### HN Title
```
Show HN: Autocannon Dashboard – Electron desktop UI for HTTP load testing with real-time charts
```

### LinkedIn
```
I spent the last few weeks building a desktop dashboard for autocannon, the fastest HTTP load testing library for Node.js.

Why? Because every time I ran a benchmark I was copy-pasting flags, staring at a scrolling table, and losing context between test runs.

What I built:
→ 8 real-time charts updating every second (req/s, throughput, p50/p90/p99 latency, errors, status codes, cumulative requests, avg response size)
→ Full autocannon option surface through a tabbed form — no CLI needed
→ Project management — organise tests, browse history, export to JSON/CSV
→ Works on Windows, macOS, Linux

Free. MIT licensed. No account needed.

GitHub: https://github.com/okobsamoht/autocannon-dashboard
```
