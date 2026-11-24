import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Hash, Bell, TrendingUp, CheckCircle2 } from 'lucide-react'
import { api } from '../lib/api'
import { Card, Button, Select, Badge, Spinner, LivePing } from '../components/ui'
import { STATUS_COLOR } from '../lib/utils'

export function QueuePage() {
  const [depts, setDepts] = useState<any[]>([])
  const [token, setToken] = useState<any>(null)
  const [selectedDept, setSelectedDept] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    api.queueDepartments().then(d => {
      setDepts(d)
      if (d.length) setSelectedDept(d[0].department_id)
    }).finally(() => setLoading(false))

    // Simulate real-time refresh every 15s
    const interval = setInterval(() => {
      api.queueDepartments().then(setDepts)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  async function handleGetToken() {
    setGenerating(true)
    try {
      const t = await api.generateToken({ patient_id: 'P-1001', department_id: selectedDept, priority_level: 'routine' })
      setToken(t)
    } finally { setGenerating(false) }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  const deptOptions = depts.map(d => ({ value: d.department_id, label: d.department_name }))
  const servingDept = depts.find(d => d.department_id === selectedDept)

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Hash size={22} className="text-teal-600" /> Digital Queue Management</h2>
        <p className="text-sm text-slate-500 mt-1">Live queue tracking with estimated waiting times. Times are estimates and may vary.</p>
      </div>

      {/* Token display */}
      {token && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-2 border-teal-300 text-center">
            <div className="flex items-center justify-center gap-2 mb-2 text-teal-600 font-semibold text-sm">
              <LivePing /> Your Queue Token
            </div>
            <div className="text-6xl font-black text-teal-700 my-3 tracking-wider">{token.token_number}</div>
            <div className="flex justify-center gap-6 text-sm text-slate-500">
              <div><span className="font-bold text-orange-600">{token.estimated_wait_minutes}</span> min est. wait</div>
              <div>Serving: <span className="font-bold text-teal-600">{token.current_token_serving}</span></div>
            </div>
            <Badge className={`mt-3 ${STATUS_COLOR[token.status]}`}>{token.status}</Badge>
            <p className="text-xs text-slate-400 mt-3">Proceed to waiting area. You will be called when your turn arrives.</p>
          </Card>
        </motion.div>
      )}

      {/* Get token */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Bell size={16} className="text-teal-600" /> Get Queue Token</h3>
        <div className="flex gap-3">
          <Select className="flex-1" value={selectedDept} options={deptOptions}
            onChange={e => setSelectedDept(e.target.value)} />
          <Button loading={generating} onClick={handleGetToken}><Hash size={16} /> Get Token</Button>
        </div>
        {servingDept && (
          <div className="mt-3 bg-teal-50 rounded-xl p-3 text-sm flex justify-between">
            <span className="text-slate-600">Currently Serving:</span>
            <span className="font-bold text-teal-700">{servingDept.current_token_serving}</span>
          </div>
        )}
      </Card>

      {/* All departments */}
      <Card>
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-blue-600" /> Live Department Queues
          <span className="ml-auto flex items-center gap-1 text-xs text-teal-600 font-normal"><LivePing /> Live</span>
        </h3>
        <div className="space-y-3">
          {depts.map((d, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-all">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-700 text-sm">{d.department_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Floor {d.floor} · {d.queue_length} in queue</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-orange-600">{d.estimated_wait_minutes} min</p>
                  <p className="text-xs text-slate-400">est. wait</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (d.queue_length / 20) * 100)}%` }} />
                </div>
                <span className="text-xs text-slate-500">
                  {d.current_token_serving !== 'Standby' ? (
                    <span className="flex items-center gap-1 text-teal-600"><CheckCircle2 size={12} /> Serving {d.current_token_serving}</span>
                  ) : 'Standby'}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center">⏱ Waiting times are estimates. Actual times may vary based on clinical complexity.</p>
      </Card>
    </div>
  )
}

