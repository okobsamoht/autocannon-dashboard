import { useState } from 'react'
import { Plus, Trash2, ChevronDown } from 'lucide-react'

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
const TABS = ['Basic', 'Headers & Body', 'Advanced', 'Scenarios']

function Tab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
        active
          ? 'text-blue-400 border-blue-500 bg-slate-800'
          : 'text-slate-400 border-transparent hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

function NumberInput({ value, onChange, min, max, placeholder }) {
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      min={min}
      max={max}
      placeholder={placeholder}
      className="input"
    />
  )
}

function HeaderEditor({ headers, onChange }) {
  const add = () => onChange([...headers, { key: '', value: '' }])
  const remove = (i) => onChange(headers.filter((_, idx) => idx !== i))
  const update = (i, field, val) => {
    const next = [...headers]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {headers.map((h, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={h.key}
            onChange={e => update(i, 'key', e.target.value)}
            placeholder="Header name"
            className="input flex-1"
          />
          <input
            value={h.value}
            onChange={e => update(i, 'value', e.target.value)}
            placeholder="Value"
            className="input flex-1"
          />
          <button type="button" onClick={() => remove(i)} className="btn-danger p-2">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="btn-secondary text-xs">
        <Plus className="w-3.5 h-3.5" /> Add Header
      </button>
    </div>
  )
}

function ScenarioEditor({ scenarios, onChange }) {
  const add = () => onChange([...scenarios, { method: 'GET', path: '/', headers: {}, body: '' }])
  const remove = (i) => onChange(scenarios.filter((_, idx) => idx !== i))
  const update = (i, field, val) => {
    const next = [...scenarios]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Define a sequence of requests to send in order. Each connection will cycle through these requests.
      </p>
      {scenarios.map((s, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Request #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="btn-danger text-xs py-1">
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Method">
              <select value={s.method} onChange={e => update(i, 'method', e.target.value)} className="select">
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Path">
              <input
                value={s.path}
                onChange={e => update(i, 'path', e.target.value)}
                placeholder="/api/endpoint"
                className="input"
              />
            </Field>
          </div>
          <Field label="Body (optional)">
            <textarea
              value={s.body}
              onChange={e => update(i, 'body', e.target.value)}
              placeholder='{"key": "value"}'
              rows={3}
              className="input font-mono text-xs resize-y"
            />
          </Field>
        </div>
      ))}
      <button type="button" onClick={add} className="btn-secondary text-xs">
        <Plus className="w-3.5 h-3.5" /> Add Request
      </button>
    </div>
  )
}

function headersToList(obj) {
  if (!obj || typeof obj !== 'object') return []
  return Object.entries(obj).map(([key, value]) => ({ key, value: String(value) }))
}

function listToHeaders(list) {
  return Object.fromEntries(list.filter(h => h.key.trim()).map(h => [h.key.trim(), h.value]))
}

export default function TestConfigForm({ initialConfig, onSave, onCancel }) {
  const ac = initialConfig?.config ?? {}

  const [tab, setTab] = useState(0)
  const [name, setName] = useState(initialConfig?.name ?? '')
  const [url, setUrl] = useState(ac.url ?? '')
  const [title, setTitle] = useState(ac.title ?? '')
  const [method, setMethod] = useState(ac.method ?? 'GET')
  const [connections, setConnections] = useState(ac.connections ?? 10)
  const [durationMode, setDurationMode] = useState(ac.amount ? 'amount' : 'duration')
  const [duration, setDuration] = useState(ac.duration ?? 10)
  const [amount, setAmount] = useState(ac.amount ?? undefined)
  const [timeout, setTimeout2] = useState(ac.timeout ?? 10)
  const [headers, setHeaders] = useState(headersToList(ac.headers))
  const [body, setBody] = useState(ac.body ?? '')
  const [bodyType, setBodyType] = useState('raw')
  const [pipelining, setPipelining] = useState(ac.pipelining ?? 1)
  const [workers, setWorkers] = useState(ac.workers ?? undefined)
  const [overallRate, setOverallRate] = useState(ac.overallRate ?? undefined)
  const [connectionRate, setConnectionRate] = useState(ac.connectionRate ?? undefined)
  const [reconnectRate, setReconnectRate] = useState(ac.reconnectRate ?? undefined)
  const [bailout, setBailout] = useState(ac.bailout ?? undefined)
  const [maxConnectionRequests, setMaxConnectionRequests] = useState(ac.maxConnectionRequests ?? undefined)
  const [maxOverallRequests, setMaxOverallRequests] = useState(ac.maxOverallRequests ?? undefined)
  const [forever, setForever] = useState(ac.forever ?? false)
  const [idReplacement, setIdReplacement] = useState(ac.idReplacement ?? false)
  const [socketPath, setSocketPath] = useState(ac.socketPath ?? '')
  const [servername, setServername] = useState(ac.servername ?? '')
  const [expectBody, setExpectBody] = useState(ac.expectBody ?? '')
  const [scenarios, setScenarios] = useState(ac.requests ?? [])
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!url.trim()) e.url = 'URL is required'
    if (!/^https?:\/\/.+/.test(url.trim()) && !url.trim().startsWith('/')) {
      e.url = 'Must be a valid http/https URL'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) { setTab(0); return }

    const config = {
      url: url.trim(),
      connections,
      timeout: timeout,
      pipelining,
      method
    }

    if (title.trim()) config.title = title.trim()

    if (durationMode === 'duration') {
      config.duration = duration
    } else if (amount) {
      config.amount = amount
    }

    const h = listToHeaders(headers)
    if (bodyType === 'json' && !h['content-type'] && !h['Content-Type']) {
      h['content-type'] = 'application/json'
    } else if (bodyType === 'form' && !h['content-type'] && !h['Content-Type']) {
      h['content-type'] = 'application/x-www-form-urlencoded'
    }
    if (Object.keys(h).length > 0) config.headers = h
    if (body.trim()) config.body = body.trim()
    if (workers) config.workers = workers
    if (overallRate) config.overallRate = overallRate
    if (connectionRate) config.connectionRate = connectionRate
    if (reconnectRate) config.reconnectRate = reconnectRate
    if (bailout) config.bailout = bailout
    if (maxConnectionRequests) config.maxConnectionRequests = maxConnectionRequests
    if (maxOverallRequests) config.maxOverallRequests = maxOverallRequests
    if (forever) config.forever = true
    if (idReplacement) config.idReplacement = true
    if (socketPath.trim()) config.socketPath = socketPath.trim()
    if (servername.trim()) config.servername = servername.trim()
    if (expectBody.trim()) config.expectBody = expectBody.trim()
    if (scenarios.length > 0) config.requests = scenarios

    onSave({ name: name.trim(), config })
  }

  return (
    <div className="space-y-4">
      {/* Config name */}
      <div>
        <label className="label">Configuration Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Homepage stress test"
          className={`input ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="flex gap-1">
          {TABS.map((t, i) => (
            <Tab key={t} active={tab === i} onClick={() => setTab(i)}>{t}</Tab>
          ))}
        </div>
      </div>

      {/* Tab: Basic */}
      {tab === 0 && (
        <div className="space-y-4">
          <Field label="URL *" hint="Full URL including protocol (e.g. http://localhost:3000/api)">
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="http://localhost:3000"
              className={`input font-mono ${errors.url ? 'border-red-500' : ''}`}
            />
            {errors.url && <p className="mt-1 text-xs text-red-400">{errors.url}</p>}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Title (optional)" hint="Shown in result reports">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="My benchmark" className="input" />
            </Field>
            <Field label="HTTP Method">
              <select value={method} onChange={e => setMethod(e.target.value)} className="select">
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Connections" hint="Concurrent connections (default: 10)">
              <NumberInput value={connections} onChange={setConnections} min={1} placeholder="10" />
            </Field>
            <Field label="Timeout (s)" hint="Request timeout in seconds (default: 10)">
              <NumberInput value={timeout} onChange={setTimeout2} min={1} placeholder="10" />
            </Field>
          </div>

          <div>
            <label className="label">Duration Mode</label>
            <div className="flex gap-3 mb-3">
              {['duration', 'amount'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMode(m)}
                  className={`btn text-sm capitalize ${durationMode === m ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {m === 'duration' ? 'Time-based' : 'Request count'}
                </button>
              ))}
            </div>
            {durationMode === 'duration' ? (
              <Field label="Duration (seconds)" hint="How long to run the test (default: 10)">
                <NumberInput value={duration} onChange={setDuration} min={1} placeholder="10" />
              </Field>
            ) : (
              <Field label="Amount (requests)" hint="Total number of requests to send">
                <NumberInput value={amount} onChange={setAmount} min={1} placeholder="1000" />
              </Field>
            )}
          </div>
        </div>
      )}

      {/* Tab: Headers & Body */}
      {tab === 1 && (
        <div className="space-y-5">
          <Field label="HTTP Headers">
            <HeaderEditor headers={headers} onChange={setHeaders} />
          </Field>

          <Field label="Body Type">
            <div className="flex gap-2">
              {['raw', 'json', 'form'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setBodyType(t)}
                  className={`btn text-xs uppercase ${bodyType === t ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>

          <Field
            label="Request Body"
            hint={bodyType === 'json' ? 'Will automatically set Content-Type: application/json' : bodyType === 'form' ? 'Will set Content-Type: application/x-www-form-urlencoded' : ''}
          >
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder={
                bodyType === 'json'
                  ? '{\n  "key": "value"\n}'
                  : bodyType === 'form'
                  ? 'key=value&other=123'
                  : 'Request body...'
              }
              rows={8}
              className="input font-mono text-xs resize-y"
            />
          </Field>
        </div>
      )}

      {/* Tab: Advanced */}
      {tab === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Pipelining" hint="Number of pipelined requests per connection (default: 1)">
              <NumberInput value={pipelining} onChange={setPipelining} min={1} placeholder="1" />
            </Field>
            <Field label="Workers" hint="Number of worker threads (experimental)">
              <NumberInput value={workers} onChange={setWorkers} min={1} placeholder="auto" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Overall Rate (req/s)" hint="Limit total requests per second">
              <NumberInput value={overallRate} onChange={setOverallRate} min={1} placeholder="unlimited" />
            </Field>
            <Field label="Connection Rate (req/s)" hint="Limit requests per second per connection">
              <NumberInput value={connectionRate} onChange={setConnectionRate} min={1} placeholder="unlimited" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Bailout threshold (req/s)" hint="Stop the test if requests/sec drops below this">
              <NumberInput value={bailout} onChange={setBailout} min={1} placeholder="disabled" />
            </Field>
            <Field label="Reconnect Rate" hint="Reconnect every N requests per connection">
              <NumberInput value={reconnectRate} onChange={setReconnectRate} min={1} placeholder="disabled" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Max Requests per Connection" hint="Close and reopen connection after N requests">
              <NumberInput value={maxConnectionRequests} onChange={setMaxConnectionRequests} min={1} placeholder="unlimited" />
            </Field>
            <Field label="Max Overall Requests" hint="Stop after sending this many requests total">
              <NumberInput value={maxOverallRequests} onChange={setMaxOverallRequests} min={1} placeholder="unlimited" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Socket Path" hint="Unix domain socket path (alternative to URL host)">
              <input value={socketPath} onChange={e => setSocketPath(e.target.value)} placeholder="/tmp/server.sock" className="input font-mono text-xs" />
            </Field>
            <Field label="Server Name (SNI)" hint="Override server name for TLS SNI">
              <input value={servername} onChange={e => setServername(e.target.value)} placeholder="example.com" className="input" />
            </Field>
          </div>

          <Field label="Expect Body" hint="Verify each response body contains this string">
            <input value={expectBody} onChange={e => setExpectBody(e.target.value)} placeholder="Expected response text" className="input" />
          </Field>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={forever}
                onChange={e => setForever(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500"
              />
              <span className="text-sm text-slate-300">Run forever</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={idReplacement}
                onChange={e => setIdReplacement(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500"
              />
              <span className="text-sm text-slate-300">ID replacement</span>
            </label>
          </div>
        </div>
      )}

      {/* Tab: Scenarios */}
      {tab === 3 && (
        <ScenarioEditor scenarios={scenarios} onChange={setScenarios} />
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-slate-700">
        <button type="button" onClick={handleSave} className="btn-primary">
          Save Configuration
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
