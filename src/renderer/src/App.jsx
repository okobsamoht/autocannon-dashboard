import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProjectsPage from './pages/ProjectsPage'
import ProjectPage from './pages/ProjectPage'
import TestConfigPage from './pages/TestConfigPage'
import RunTestPage from './pages/RunTestPage'
import ResultPage from './pages/ResultPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectPage />} />
          <Route path="/projects/:projectId/configs/new" element={<TestConfigPage />} />
          <Route path="/projects/:projectId/configs/:configId/edit" element={<TestConfigPage />} />
          <Route path="/projects/:projectId/configs/:configId/run" element={<RunTestPage />} />
          <Route path="/results/:resultId" element={<ResultPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
