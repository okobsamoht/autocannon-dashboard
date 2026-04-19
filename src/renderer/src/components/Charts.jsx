import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ComposedChart
} from 'recharts'

const GRID = '#1e293b'
const AXIS = '#475569'
const tip = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#f1f5f9'
}

function fmt(v) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`
  return String(Math.round(v))
}

function fmtBytes(v) {
  if (v >= 1_048_576) return `${(v / 1_048_576).toFixed(1)} MB/s`
  if (v >= 1_024) return `${(v / 1_024).toFixed(1)} KB/s`
  return `${Math.round(v)} B/s`
}

function fmtSize(v) {
  if (v >= 1_048_576) return `${(v / 1_048_576).toFixed(2)} MB`
  if (v >= 1_024) return `${(v / 1_024).toFixed(1)} KB`
  return `${Math.round(v)} B`
}

const xAxis = <XAxis dataKey="tick" stroke={AXIS} tick={{ fontSize: 11 }} tickFormatter={v => `${v}s`} />
const grid  = <CartesianGrid strokeDasharray="3 3" stroke={GRID} />

// ── Gradients ────────────────────────────────────────────────────────────────

function Grad({ id, color }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
        <stop offset="95%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  )
}

// ── Requests / sec ───────────────────────────────────────────────────────────

export function ReqChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <Grad id="reqG" color="#3b82f6" />
        {grid}{xAxis}
        <YAxis stroke={AXIS} tick={{ fontSize: 11 }} tickFormatter={fmt} width={46} />
        <Tooltip contentStyle={tip} formatter={v => [fmt(v) + ' req/s', 'Req/s']} labelFormatter={l => `t=${l}s`} />
        <Area type="monotone" dataKey="reqsPerSec" name="Req/s" stroke="#3b82f6" fill="url(#reqG)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Throughput ───────────────────────────────────────────────────────────────

export function ThroughputChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <Grad id="tpG" color="#22c55e" />
        {grid}{xAxis}
        <YAxis stroke={AXIS} tick={{ fontSize: 11 }} tickFormatter={v => fmtBytes(v).split(' ')[0]} width={46} />
        <Tooltip contentStyle={tip} formatter={v => [fmtBytes(v), 'Throughput']} labelFormatter={l => `t=${l}s`} />
        <Area type="monotone" dataKey="throughputPerSec" name="Throughput" stroke="#22c55e" fill="url(#tpG)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Latency Percentiles (p50 / p90 / p99) ────────────────────────────────────

export function LatencyLinesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        {grid}{xAxis}
        <YAxis stroke={AXIS} tick={{ fontSize: 11 }} tickFormatter={v => `${v}ms`} width={50} />
        <Tooltip contentStyle={tip} formatter={v => [`${v.toFixed(1)} ms`]} labelFormatter={l => `t=${l}s`} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
        <Line type="monotone" dataKey="latencyP50" name="p50" stroke="#22c55e" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="latencyP75" name="p75" stroke="#f59e0b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="latencyP90" name="p90" stroke="#f97316" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="latencyP99" name="p99" stroke="#ef4444" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Mean Latency ─────────────────────────────────────────────────────────────

export function LatencyMeanChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <Grad id="latG" color="#a855f7" />
        {grid}{xAxis}
        <YAxis stroke={AXIS} tick={{ fontSize: 11 }} tickFormatter={v => `${v}ms`} width={50} />
        <Tooltip contentStyle={tip} formatter={v => [`${v.toFixed(1)} ms`, 'Mean latency']} labelFormatter={l => `t=${l}s`} />
        <Area type="monotone" dataKey="latencyMean" name="Mean" stroke="#a855f7" fill="url(#latG)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Errors & Timeouts ────────────────────────────────────────────────────────

export function ErrorsChart({ data }) {
  // Compute per-tick deltas for errors so we see spikes, not a staircase
  const withDelta = data.map((d, i) => ({
    ...d,
    errorsDelta: i === 0 ? d.errors : Math.max(0, d.errors - data[i - 1].errors)
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={withDelta} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        {grid}{xAxis}
        <YAxis stroke={AXIS} tick={{ fontSize: 11 }} width={36} allowDecimals={false} />
        <Tooltip contentStyle={tip} formatter={v => [v, 'Errors this sec']} labelFormatter={l => `t=${l}s`} />
        <Bar dataKey="errorsDelta" name="Errors/s" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── 2xx vs Non-2xx stacked ───────────────────────────────────────────────────

export function StatusChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        {grid}{xAxis}
        <YAxis stroke={AXIS} tick={{ fontSize: 11 }} tickFormatter={fmt} width={46} />
        <Tooltip contentStyle={tip} labelFormatter={l => `t=${l}s`} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
        <Bar dataKey="statusOk" name="2xx" stackId="s" fill="#22c55e" />
        <Bar dataKey="non2xx"   name="non-2xx" stackId="s" fill="#ef4444" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Cumulative Requests ───────────────────────────────────────────────────────

export function CumulativeReqChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <Grad id="cumG" color="#6366f1" />
        {grid}{xAxis}
        <YAxis stroke={AXIS} tick={{ fontSize: 11 }} tickFormatter={fmt} width={52} />
        <Tooltip contentStyle={tip} formatter={v => [v.toLocaleString(), 'Total reqs']} labelFormatter={l => `t=${l}s`} />
        <Area type="monotone" dataKey="totalRequests" name="Total" stroke="#6366f1" fill="url(#cumG)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Avg Response Size ─────────────────────────────────────────────────────────

export function AvgBytesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <Grad id="byteG" color="#06b6d4" />
        {grid}{xAxis}
        <YAxis stroke={AXIS} tick={{ fontSize: 11 }} tickFormatter={v => fmtSize(v).split(' ')[0]} width={46} />
        <Tooltip contentStyle={tip} formatter={v => [fmtSize(v), 'Avg response']} labelFormatter={l => `t=${l}s`} />
        <Area type="monotone" dataKey="avgBytesPerReq" name="Avg size" stroke="#06b6d4" fill="url(#byteG)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Req/s vs Mean Latency (dual axis) ────────────────────────────────────────

export function ReqVsLatencyChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        {grid}{xAxis}
        <YAxis yAxisId="r" stroke="#3b82f6" tick={{ fontSize: 11 }} tickFormatter={fmt} width={46} />
        <YAxis yAxisId="l" orientation="right" stroke="#a855f7" tick={{ fontSize: 11 }} tickFormatter={v => `${v}ms`} width={50} />
        <Tooltip contentStyle={tip} labelFormatter={l => `t=${l}s`} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
        <Area yAxisId="r" type="monotone" dataKey="reqsPerSec" name="Req/s" stroke="#3b82f6" fill="#3b82f620" strokeWidth={2} dot={false} />
        <Line yAxisId="l" type="monotone" dataKey="latencyMean" name="Lat mean (ms)" stroke="#a855f7" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// ── Final result: Latency percentile bar chart ───────────────────────────────

export function LatencyPercentileChart({ latency }) {
  if (!latency) return null
  const data = [
    { label: 'p2.5',  value: latency.p2_5 },
    { label: 'p50',   value: latency.p50 },
    { label: 'p75',   value: latency.p75 },
    { label: 'p90',   value: latency.p90 },
    { label: 'p97.5', value: latency.p97_5 },
    { label: 'p99',   value: latency.p99 },
    { label: 'p99.9', value: latency.p999 },
    { label: 'max',   value: latency.max }
  ]
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        {grid}
        <XAxis dataKey="label" stroke={AXIS} tick={{ fontSize: 11 }} />
        <YAxis stroke={AXIS} tick={{ fontSize: 11 }} tickFormatter={v => `${v}ms`} width={52} />
        <Tooltip contentStyle={tip} formatter={v => [`${v} ms`, 'Latency']} />
        <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
