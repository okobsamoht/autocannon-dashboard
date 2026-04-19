import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import TestConfigForm from '../components/TestConfigForm'

export default function TestConfigPage() {
  const { projectId, configId } = useParams()
  const navigate = useNavigate()
  const isEdit = !!configId
  const [project, setProject] = useState(null)
  const [initialConfig, setInitialConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const projects = await window.api.listProjects()
      setProject(projects.find(p => p.id === projectId))

      if (isEdit) {
        const cfg = await window.api.getConfig(configId)
        setInitialConfig(cfg)
      }
      setLoading(false)
    }
    load()
  }, [projectId, configId])

  const handleSave = async ({ name, config }) => {
    if (isEdit) {
      await window.api.updateConfig(configId, { name, config })
    } else {
      await window.api.createConfig({ projectId, name, config })
    }
    navigate(`/projects/${projectId}`)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-slate-500">Loading…</div>
    </div>
  )

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/projects" className="hover:text-slate-200">Projects</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/projects/${projectId}`} className="hover:text-slate-200">
          {project?.name ?? '…'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-200">{isEdit ? 'Edit Configuration' : 'New Configuration'}</span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(`/projects/${projectId}`)} className="btn-secondary p-2">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-2xl font-bold text-slate-100">
          {isEdit ? 'Edit Configuration' : 'New Configuration'}
        </h1>
      </div>

      <div className="card p-6">
        <TestConfigForm
          initialConfig={initialConfig}
          onSave={handleSave}
          onCancel={() => navigate(`/projects/${projectId}`)}
        />
      </div>
    </div>
  )
}
