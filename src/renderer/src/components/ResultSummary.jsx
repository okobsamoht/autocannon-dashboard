import { LatencyPercentileChart } from './Charts'

function Row({ label, value, highlight }) {
  return (
    <tr className="border-t border-slate-700/50">
      <td className="py-2 pr-4 text-slate-400 text-sm whitespace-nowrap">{label}</td>
      <td className={`py-2 text-sm font-mono font-medium ${highlight ? 'text-blue-400' : 'text-slate-200'}`}>{value}</td>
    </tr>
  )
}

function fmt(v) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(2)}k`
  return typeof v === 'number' ? v.toFixed(2) : v
}

function fmtBytes(bytes) {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(2)} GB`
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(2)} MB`
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(2)} KB`
  return `${bytes} B`
}

export default function ResultSummary({ result }) {
  const r = result.result
  const { latency, requests, throughput } = r

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-3">
          <div className="text-xs text-slate-500 mb-1">URL</div>
          <div className="text-sm text-slate-200 font-mono truncate">{r.url}</div>
        </div>
        <div className="card p-3">
          <div className="text-xs text-slate-500 mb-1">Connections</div>
          <div className="text-sm text-blue-400 font-bold">{r.connections}</div>
        </div>
        <div className="card p-3">
          <div className="text-xs text-slate-500 mb-1">Duration</div>
          <div className="text-sm text-blue-400 font-bold">{r.duration}s</div>
        </div>
        <div className="card p-3">
          <div className="text-xs text-slate-500 mb-1">Pipelining</div>
          <div className="text-sm text-blue-400 font-bold">{r.pipelining}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Requests */}
        <div className="card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Requests</h3>
          <table className="w-full">
            <tbody>
              <Row label="Total" value={requests.total.toLocaleString()} highlight />
              <Row label="Sent" value={requests.sent.toLocaleString()} />
              <Row label="Average/sec" value={fmt(requests.average)} highlight />
              <Row label="Mean/sec" value={fmt(requests.mean)} />
              <Row label="Stdev" value={fmt(requests.stddev)} />
              <Row label="Min/sec" value={fmt(requests.min)} />
              <Row label="Max/sec" value={fmt(requests.max)} />
            </tbody>
          </table>
        </div>

        {/* Throughput */}
        <div className="card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Throughput</h3>
          <table className="w-full">
            <tbody>
              <Row label="Total" value={fmtBytes(throughput.total)} highlight />
              <Row label="Average/sec" value={fmtBytes(throughput.average)} highlight />
              <Row label="Mean/sec" value={fmtBytes(throughput.mean)} />
              <Row label="Stdev" value={fmtBytes(throughput.stddev)} />
              <Row label="Min/sec" value={fmtBytes(throughput.min)} />
              <Row label="Max/sec" value={fmtBytes(throughput.max)} />
            </tbody>
          </table>
        </div>

        {/* Errors */}
        <div className="card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Responses</h3>
          <table className="w-full">
            <tbody>
              <Row label="Errors" value={r.errors} highlight={r.errors > 0} />
              <Row label="Timeouts" value={r.timeouts} highlight={r.timeouts > 0} />
              <Row label="Non-2xx" value={r['non2xx'] || 0} highlight={(r['non2xx'] || 0) > 0} />
              <Row label="Resets" value={r.resets || 0} />
              <Row label="2xx OK" value={(requests.total - (r.errors || 0) - (r['non2xx'] || 0)).toLocaleString()} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Latency */}
      <div className="card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Latency</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <table className="w-full">
            <tbody>
              <Row label="Average" value={`${latency.average.toFixed(2)} ms`} highlight />
              <Row label="Stdev" value={`${latency.stddev.toFixed(2)} ms`} />
              <Row label="p2.5" value={`${latency.p2_5} ms`} />
              <Row label="p50 (median)" value={`${latency.p50} ms`} highlight />
              <Row label="p75" value={`${latency.p75} ms`} />
              <Row label="p90" value={`${latency.p90} ms`} highlight />
              <Row label="p97.5" value={`${latency.p97_5} ms`} />
              <Row label="p99" value={`${latency.p99} ms`} highlight />
              <Row label="p99.9" value={`${latency.p999} ms`} />
              <Row label="Max" value={`${latency.max} ms`} />
            </tbody>
          </table>
          <LatencyPercentileChart latency={latency} />
        </div>
      </div>
    </div>
  )
}
