import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Play, Trash2, Edit2, Clock, ChevronRight, BarChart2, ArrowLeft } from 'lucide-react'

function ConfigCard({ config, projectId, onDelete, onRun }) {
  const navigate = useNavigate()
  const ac = config.config

  const fmtDuration = () => {
    if (ac.amount) return `${ac.amount.toLocaleString()} reqs`
    return `${ac.duration ?? 10}s`
  }

  return (
    <div className="card p-5 hover:border-slate-600 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-100">{config.name}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-xs">{ac.url}</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => navigate(`/projects/${projectId}/configs/${config.id}/edit`)}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(config.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="badge badge-blue">{ac.method ?? 'GET'}</span>
        <span className="badge bg-slate-700 text-slate-300">
          {(ac.connections ?? 10)} conn
        </span>
        <span className="badge bg-slate-700 text-slate-300">{fmtDuration()}</span>
        {ac.pipelining > 1 && (
          <span className="badge bg-purple-500/20 text-purple-400">
            pipeline ×{ac.pipelining}
          </span>
        )}
        {ac.workers && (
          <span className="badge bg-slate-700 text-slate-300">{ac.workers} workers</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onRun(config)}
          className="btn-success flex-1"
        >
          <Play className="w-3.5 h-3.5" /> Run Test
        </button>
        <button
          onClick={() => navigate(`/projects/${projectId}/configs/${config.id}/run`)}
          className="btn-secondary"
          title="View history"
        >
          <BarChart2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function ProjectPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [projects, cfgs] = await Promise.all([
      window.api.listProjects(),
      window.api.listConfigs(projectId)
    ])
    setProject(projects.find(p => p.id === projectId))
    setConfigs(cfgs)
    setLoading(false)
  }

  useEffect(() => { load() }, [projectId])

  const handleDelete = async (configId) => {
    if (!confirm('Delete this configuration and all its results?')) return
    await window.api.deleteConfig(configId)
    load()
  }

  const handleRun = (config) => {
    navigate(`/projects/${projectId}/configs/${config.id}/run`)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-slate-500">Loading…</div>
    </div>
  )

  if (!project) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
      Project not found.
      <Link to="/projects" className="mt-2 text-blue-400 hover:underline">Back to projects</Link>
    </div>
  )

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/projects" className="hover:text-slate-200 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Projects
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-200">{project.name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{project.name}</h1>
          {project.description && (
            <p className="text-slate-400 mt-1">{project.description}</p>
          )}
        </div>
        <button
          onClick={() => navigate(`/projects/${projectId}/configs/new`)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> New Configuration
        </button>
      </div>

      {configs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-4">
            <BarChart2 className="w-7 h-7 text-slate-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200 mb-2">No configurations yet</h2>
          <p className="text-slate-400 mb-6 max-w-sm text-sm">
            Add a test configuration with your target URL and autocannon settings.
          </p>
          <button
            onClick={() => navigate(`/projects/${projectId}/configs/new`)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> Add Configuration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configs.map(c => (
            <ConfigCard
              key={c.id}
              config={c}
              projectId={projectId}
              onDelete={handleDelete}
              onRun={handleRun}
            />
          ))}
        </div>
      )}
    </div>
  )
}
