import { useEffect, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { Zap, FolderOpen, ChevronRight, Plus, Activity } from 'lucide-react'

export default function Sidebar() {
  const [projects, setProjects] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const { projectId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    window.api.listProjects().then(setProjects)

    const checkRunning = async () => {
      const running = await window.api.isTestRunning()
      setIsRunning(running)
    }
    checkRunning()

    const unsubDone = window.api.onTestDone(() => setIsRunning(false))
    const unsubErr = window.api.onTestError(() => setIsRunning(false))

    return () => {
      unsubDone?.()
      unsubErr?.()
    }
  }, [])

  useEffect(() => {
    window.api.listProjects().then(setProjects)
  }, [projectId])

  return (
    <aside className="w-60 flex-shrink-0 bg-slate-900 border-r border-slate-700/50 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 leading-tight">Autocannon</div>
            <div className="text-xs text-slate-500">Dashboard</div>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      {isRunning && (
        <div className="mx-3 mt-3 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Test running…</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <NavLink
          to="/projects"
          end
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`
          }
        >
          <FolderOpen className="w-4 h-4" />
          All Projects
        </NavLink>

        {projects.length > 0 && (
          <div className="pt-4">
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Projects
            </div>
            {projects.map(p => (
              <NavLink
                key={p.id}
                to={`/projects/${p.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors group ${
                    isActive
                      ? 'bg-slate-700 text-slate-100'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`
                }
              >
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{p.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-700/50">
        <button
          onClick={() => navigate('/projects')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>
    </aside>
  )
}
