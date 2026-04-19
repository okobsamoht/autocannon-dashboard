const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  // Projects
  listProjects: () => ipcRenderer.invoke('projects:list'),
  createProject: (data) => ipcRenderer.invoke('projects:create', data),
  updateProject: (id, data) => ipcRenderer.invoke('projects:update', { id, data }),
  deleteProject: (id) => ipcRenderer.invoke('projects:delete', id),

  // Configs
  listConfigs: (projectId) => ipcRenderer.invoke('configs:list', projectId),
  getConfig: (id) => ipcRenderer.invoke('configs:get', id),
  createConfig: (data) => ipcRenderer.invoke('configs:create', data),
  updateConfig: (id, data) => ipcRenderer.invoke('configs:update', { id, data }),
  deleteConfig: (id) => ipcRenderer.invoke('configs:delete', id),

  // Test
  runTest: (configId, acConfig) => ipcRenderer.invoke('test:run', { configId, acConfig }),
  stopTest: () => ipcRenderer.invoke('test:stop'),
  isTestRunning: () => ipcRenderer.invoke('test:isRunning'),

  onTestTick: (cb) => {
    const handler = (_, data) => cb(data)
    ipcRenderer.on('test:tick', handler)
    return () => ipcRenderer.off('test:tick', handler)
  },
  onTestDone: (cb) => {
    const handler = (_, data) => cb(data)
    ipcRenderer.once('test:done', handler)
    return () => ipcRenderer.off('test:done', handler)
  },
  onTestError: (cb) => {
    const handler = (_, msg) => cb(msg)
    ipcRenderer.once('test:error', handler)
    return () => ipcRenderer.off('test:error', handler)
  },

  // Results
  listResults: (configId) => ipcRenderer.invoke('results:list', configId),
  getResult: (id) => ipcRenderer.invoke('results:get', id),
  deleteResult: (id) => ipcRenderer.invoke('results:delete', id),
  exportResult: (id, format) => ipcRenderer.invoke('results:export', { id, format }),
  openFile: (path) => ipcRenderer.invoke('results:openFile', path)
})
