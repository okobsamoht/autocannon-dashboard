import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Play, Square, ChevronRight, ArrowLeft, Clock, Download, Eye, Trash2 } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import {
  ReqChart, ThroughputChart, ErrorsChart, ReqVsLatencyChart,
  LatencyLinesChart, LatencyMeanChart, StatusChart,
  CumulativeReqChart, AvgBytesChart
} from '../components/Charts'
import ResultSummary from '../components/ResultSummary'

function fmtBytes(b) {
  if (b >= 1_048_576) return `${(b / 1_048_576).toFixed(1)} MB/s`
  if (b >= 1_024) return `${(b / 1_024).toFixed(1)} KB/s`
  return `${Math.round(b)} B/s`
}

function fmtDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

function ProgressBar({ progress }) {
  return (
    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

function HistoryItem({ record, onView, onDelete, onExport }) {
  const r = record.result
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-sm font-medium text-slate-200">
            {fmtDate(record.startedAt)}
          </span>
          <span className="badge badge-green">{r.requests.average.toFixed(0)} req/s</span>
          <span className="text-xs text-slate-500">
            p99: {r.latency.p99}ms
          </span>
        </div>
        <div className="text-xs text-slate-500">
          {r.requests.total.toLocaleString()} requests · {r.errors} errors · {r.duration}s
        </div>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button onClick={() => onView(record.id)} className="btn-secondary py-1.5 px-2.5 text-xs">
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onExport(record.id, 'json')} className="btn-secondary py-1.5 px-2.5 text-xs" title="Export JSON">
          <Download className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(record.id)} className="btn-danger py-1.5 px-2.5 text-xs">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function RunTestPage() {
  const { projectId, configId } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [config, setConfig] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [timeseries, setTimeseries] = useState([])
  const [currentResult, setCurrentResult] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [latestTick, setLatestTick] = useState(null)
  const startTimeRef = useRef(null)
  const cleanupRef = useRef([])

  const loadHistory = async () => {
    const results = await window.api.listResults(configId)
    setHistory(results)
  }

  useEffect(() => {
    const load = async () => {
      const [projects, cfg] = await Promise.all([
        window.api.listProjects(),
        window.api.getConfig(configId)
      ])
      setProject(projects.find(p => p.id === projectId))
      setConfig(cfg)
    }
    load()
    loadHistory()

    return () => {
      cleanupRef.current.forEach(fn => fn?.())
    }
  }, [configId, projectId])

  const handleRun = async () => {
    if (!config) return
    setIsRunning(true)
    setTimeseries([])
    setCurrentResult(null)
    setError(null)
    setProgress(0)
    setLatestTick(null)
    startTimeRef.current = Date.now()

    const ac = config.config
    const isAmountMode = !!ac.amount
    const duration = ac.duration ?? 10
    const amount = ac.amount ?? 0

    const unsubTick = window.api.onTestTick((tick) => {
      setTimeseries(prev => [...prev, tick])
      setLatestTick(tick)

      if (isAmountMode) {
        setProgress(Math.min((tick.totalRequests / amount) * 100, 99))
      } else {
        setProgress(Math.min((tick.tick / duration) * 100, 99))
      }
    })
    cleanupRef.current.push(unsubTick)

    const result = await window.api.runTest(config.id, config.config)

    unsubTick()
    setIsRunning(false)
    setProgress(100)

    if (result?.error) {
      setError(result.error)
    } else {
      setCurrentResult(result)
      loadHistory()
    }
  }

  const handleStop = async () => {
    await window.api.stopTest()
    setIsRunning(false)
  }

  const handleDeleteResult = async (id) => {
    if (!confirm('Delete this result?')) return
    await window.api.deleteResult(id)
    loadHistory()
  }

  const handleExport = async (id, format) => {
    const out = await window.api.exportResult(id, format)
    if (out.error) alert(out.error)
  }

  const latest = latestTick

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/projects" className="hover:text-slate-200">Projects</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/projects/${projectId}`} className="hover:text-slate-200">
          {project?.name ?? '…'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-200">{config?.name ?? '…'}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/projects/${projectId}`)} className="btn-secondary p-2">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-100">{config?.name}</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{config?.config.url}</p>
        </div>
        <div className="flex gap-2">
          {isRunning ? (
            <button onClick={handleStop} className="btn-danger">
              <Square className="w-3.5 h-3.5" /> Stop
            </button>
          ) : (
            <button onClick={handleRun} disabled={isRunning} className="btn-success">
              <Play className="w-3.5 h-3.5" /> Run Test
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          Error: {error}
        </div>
      )}

      {/* Progress */}
      {isRunning && (
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Running…</span>
            <span className="text-xs text-slate-400">
              {config?.config.amount
                ? `${latestTick?.totalRequests?.toLocaleString() ?? 0} / ${config.config.amount.toLocaleString()} requests`
                : `${latestTick?.tick ?? 0}s / ${config?.config.duration ?? 10}s`}
            </span>
          </div>
          <ProgressBar progress={progress} />
        </div>
      )}

      {/* Live metrics + charts */}
      {(isRunning || timeseries.length > 0) && !currentResult && (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-5">
            <MetricCard label="Req/s"       value={latest ? Math.round(latest.reqsPerSec).toLocaleString() : '—'} color="blue" size="sm" />
            <MetricCard label="Throughput"  value={latest ? fmtBytes(latest.throughputPerSec) : '—'} color="green" size="sm" />
            <MetricCard label="Lat mean"    value={latest ? `${latest.latencyMean.toFixed(1)}ms` : '—'} color="purple" size="sm" />
            <MetricCard label="Lat p50"     value={latest ? `${latest.latencyP50.toFixed(1)}ms` : '—'} color="purple" size="sm" />
            <MetricCard label="Lat p90"     value={latest ? `${latest.latencyP90.toFixed(1)}ms` : '—'} color="yellow" size="sm" />
            <MetricCard label="Lat p99"     value={latest ? `${latest.latencyP99.toFixed(1)}ms` : '—'} color="red" size="sm" />
            <MetricCard label="Errors"      value={latest ? latest.errors : '—'} color={latest?.errors > 0 ? 'red' : 'slate'} size="sm" />
            <MetricCard label="Total reqs"  value={latest ? latest.totalRequests.toLocaleString() : '—'} color="slate" size="sm" />
          </div>

          {/* Row 1: Req/s + Throughput */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Requests / sec</div>
              <ReqChart data={timeseries} />
            </div>
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Throughput</div>
              <ThroughputChart data={timeseries} />
            </div>
          </div>

          {/* Row 2: Latency percentiles + Mean latency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Latency — p50 / p75 / p90 / p99
              </div>
              <LatencyLinesChart data={timeseries} />
            </div>
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Req/s vs Mean Latency
              </div>
              <ReqVsLatencyChart data={timeseries} />
            </div>
          </div>

          {/* Row 3: Status codes + Errors/s */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status Codes (2xx vs non-2xx)</div>
              <StatusChart data={timeseries} />
            </div>
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Errors per second</div>
              <ErrorsChart data={timeseries} />
            </div>
          </div>

          {/* Row 4: Cumulative requests + Avg response size */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cumulative Requests</div>
              <CumulativeReqChart data={timeseries} />
            </div>
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Avg Response Size</div>
              <AvgBytesChart data={timeseries} />
            </div>
          </div>
        </>
      )}

      {/* Final result */}
      {currentResult && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Test Complete</h2>
            <div className="flex gap-2">
              <button onClick={() => handleExport(currentResult.id, 'json')} className="btn-secondary text-xs">
                <Download className="w-3.5 h-3.5" /> JSON
              </button>
              <button onClick={() => handleExport(currentResult.id, 'csv')} className="btn-secondary text-xs">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button onClick={() => navigate(`/results/${currentResult.id}`)} className="btn-secondary text-xs">
                <Eye className="w-3.5 h-3.5" /> Full Report
              </button>
            </div>
          </div>

          {/* Charts from the completed run */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Requests / sec</div>
              <ReqChart data={timeseries} />
            </div>
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Throughput</div>
              <ThroughputChart data={timeseries} />
            </div>
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Latency — p50 / p75 / p90 / p99</div>
              <LatencyLinesChart data={timeseries} />
            </div>
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status Codes</div>
              <StatusChart data={timeseries} />
            </div>
          </div>

          <ResultSummary result={currentResult} />
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> Run History
          </h2>
          <div className="space-y-2">
            {history.map(r => (
              <HistoryItem
                key={r.id}
                record={r}
                onView={(id) => navigate(`/results/${id}`)}
                onDelete={handleDeleteResult}
                onExport={handleExport}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
