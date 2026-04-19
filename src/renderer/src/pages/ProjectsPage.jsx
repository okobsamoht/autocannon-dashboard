import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, Trash2, Zap, Clock } from 'lucide-react'

function ProjectModal({ onClose, onSave, initial }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    onSave({ name: name.trim(), description: description.trim() })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="card p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          {initial ? 'Edit Project' : 'New Project'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Project Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My API Tests"
              className={`input ${error ? 'border-red-500' : ''}`}
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this project testing?"
              rows={3}
              className="input resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              {initial ? 'Save Changes' : 'Create Project'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [configCounts, setConfigCounts] = useState({})
  const [modal, setModal] = useState(null) // null | 'create' | project object
  const navigate = useNavigate()

  const load = async () => {
    const ps = await window.api.listProjects()
    setProjects(ps)
    const counts = {}
    for (const p of ps) {
      const configs = await window.api.listConfigs(p.id)
      counts[p.id] = configs.length
    }
    setConfigCounts(counts)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (data) => {
    await window.api.createProject(data)
    setModal(null)
    load()
  }

  const handleUpdate = async (data) => {
    await window.api.updateProject(modal.id, data)
    setModal(null)
    load()
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this project and all its configurations and results?')) return
    await window.api.deleteProject(id)
    load()
  }

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
          <p className="text-slate-400 mt-1">Manage your load testing projects</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-200 mb-2">No projects yet</h2>
          <p className="text-slate-400 mb-6 max-w-sm">
            Create a project to organize your autocannon test configurations and results.
          </p>
          <button onClick={() => setModal('create')} className="btn-primary">
            <Plus className="w-4 h-4" /> Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="card p-5 cursor-pointer hover:border-slate-500 hover:bg-slate-700/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); setModal(p) }}
                    className="p-1.5 rounded hover:bg-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button
                    onClick={e => handleDelete(e, p.id)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-100 mb-1 truncate">{p.name}</h3>
              {p.description && (
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">{p.description}</p>
              )}

              <div className="flex items-center gap-4 mt-auto text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {configCounts[p.id] ?? 0} config{configCounts[p.id] !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {fmtDate(p.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === 'create' && (
        <ProjectModal onClose={() => setModal(null)} onSave={handleCreate} />
      )}
      {modal && modal !== 'create' && (
        <ProjectModal onClose={() => setModal(null)} onSave={handleUpdate} initial={modal} />
      )}
    </div>
  )
}
