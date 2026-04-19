import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Download, ChevronRight, Trash2 } from 'lucide-react'
import ResultSummary from '../components/ResultSummary'
import { ReqChart, ThroughputChart, ErrorsChart, ReqVsLatencyChart } from '../components/Charts'

function fmtDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

function Duration({ from, to }) {
  const secs = Math.round((new Date(to) - new Date(from)) / 1000)
  return <span>{secs}s</span>
}

export default function ResultPage() {
  const { resultId } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [config, setConfig] = useState(null)
  const [project, setProject] = useState(null)

  useEffect(() => {
    const load = async () => {
      const rec = await window.api.getResult(resultId)
      setRecord(rec)
      if (rec) {
        const [cfg, projects] = await Promise.all([
          window.api.getConfig(rec.configId),
          window.api.listProjects()
        ])
        setConfig(cfg)
        setProject(projects.find(p => p.id === rec.projectId))
      }
    }
    load()
  }, [resultId])

  const handleExport = async (format) => {
    const out = await window.api.exportResult(resultId, format)
    if (out.error) alert(out.error)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this result?')) return
    await window.api.deleteResult(resultId)
    if (record?.configId && record?.projectId) {
      navigate(`/projects/${record.projectId}/configs/${record.configId}/run`)
    } else {
      navigate('/projects')
    }
  }

  if (!record) return (
    <div className="flex items-center justify-center h-full text-slate-500">Loading…</div>
  )

  const timeseries = record.timeseries ?? []

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 flex-wrap">
        <Link to="/projects" className="hover:text-slate-200">Projects</Link>
        {project && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/projects/${project.id}`} className="hover:text-slate-200">{project.name}</Link>
          </>
        )}
        {config && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/projects/${record.projectId}/configs/${record.configId}/run`} className="hover:text-slate-200">
              {config.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-200">Result</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary p-2 shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              {config?.name ?? 'Test Result'}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
              <span>{fmtDate(record.startedAt)}</span>
              {record.completedAt && (
                <span>· <Duration from={record.startedAt} to={record.completedAt} /> elapsed</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('json')} className="btn-secondary text-sm">
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
          <button onClick={() => handleExport('csv')} className="btn-secondary text-sm">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={handleDelete} className="btn-danger text-sm">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Charts */}
      {timeseries.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Timeline</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Requests / sec</div>
              <ReqChart data={timeseries} />
            </div>
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Throughput</div>
              <ThroughputChart data={timeseries} />
            </div>
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Errors over time</div>
              <ErrorsChart data={timeseries} />
            </div>
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Req/s vs Latency</div>
              <ReqVsLatencyChart data={timeseries} />
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Summary</h2>
        <ResultSummary result={record} />
      </div>
    </div>
  )
}
