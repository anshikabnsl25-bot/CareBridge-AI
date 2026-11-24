import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, ArrowRight, Layers, Volume2 } from 'lucide-react'
import { api } from '../lib/api'
import { Card, Button, Select, Spinner, DisclaimerBanner } from '../components/ui'
import { speak } from '../lib/utils'

const DEPT_COLOR: Record<string, string> = {
  'Public Access': '#94a3b8',
  'Registration': '#3b82f6',
  'Pharmacy': '#10b981',
  'Billing': '#f59e0b',
  'Laboratory': '#8b5cf6',
  'Radiology': '#ec4899',
  'Emergency': '#ef4444',
  'Amenities': '#64748b',
  'OPD General': '#0ea5e9',
  'Dermatology': '#f97316',
  'Orthopedics': '#84cc16',
  'Pediatrics': '#14b8a6',
  'Cardiology': '#dc2626',
  'Pulmonology': '#06b6d4',
  'Vertical Transit': '#a1a1aa',
}

export function HospitalNavigatePage() {
  const [layout, setLayout] = useState<any>(null)
  const [route, setRoute] = useState<any>(null)
  const [from, setFrom] = useState('NODE_ENTRANCE')
  const [to, setTo] = useState('NODE_CARDIOLOGY')
  const [accessible, setAccessible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [navigating, setNavigating] = useState(false)
  const [activeFloor, setActiveFloor] = useState<number | 'all'>('all')
  const [queue, setQueue] = useState<any[]>([])

  const mapW = 680, mapH = 540, scale = 0.95

  useEffect(() => {
    Promise.all([api.hospitalLayout(), api.queueDepartments()])
      .then(([l, q]) => { setLayout(l); setQueue(q) })
      .finally(() => setLoading(false))
  }, [])

  async function handleNavigate() {
    setNavigating(true); setRoute(null)
    try {
      const r = await api.navigate(from, to, accessible)
      setRoute(r)
      if (r.detailed_steps?.length) {
        speak(`Navigate from ${layout?.nodes?.find((n: any) => n.id === from)?.label} to ${layout?.nodes?.find((n: any) => n.id === to)?.label}. Total distance ${r.total_distance_meters} metres. ${r.estimated_walking_time_mins} minutes walking.`)
      }
    } finally { setNavigating(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-80"><Spinner size="lg" /></div>

  const nodes: any[] = layout?.nodes || []
  const edges: any[] = layout?.edges || []
  const nodeMap = Object.fromEntries(nodes.map((n: any) => [n.id, n]))

  const pathSet = new Set(route?.path_nodes || [])
  const displayNodes = activeFloor === 'all' ? nodes : nodes.filter((n: any) => n.floor === activeFloor)

  const nodeOptions = nodes.map((n: any) => ({ value: n.id, label: `[Floor ${n.floor}] ${n.label}` }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><MapPin size={22} className="text-teal-600" /> Hospital Navigation</h2>
        <p className="text-sm text-slate-500 mt-1">Graph-based route finder with Dijkstra's algorithm · AIIMS District Hub (Demonstration Layout)</p>
      </div>

      <DisclaimerBanner text="DEMONSTRATION MAP: This is a sample hospital layout for prototype testing. Real hospital navigation requires integration with venue-specific floor plans." />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Navigation size={16} className="text-teal-600" /> Find Route</h3>
            <div className="space-y-3">
              <Select label="From" value={from} onChange={e => setFrom(e.target.value)} options={nodeOptions} />
              <Select label="To" value={to} onChange={e => setTo(e.target.value)} options={nodeOptions} />
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={accessible} onChange={e => setAccessible(e.target.checked)} className="rounded" />
                Accessible route only (ramps & elevators)
              </label>
              <Button className="w-full" loading={navigating} onClick={handleNavigate}>
                <Navigation size={16} /> Find Shortest Route
              </Button>
            </div>
          </Card>

          {route && !route.error && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">Route Found</h3>
                  <Button size="sm" variant="ghost" onClick={() => speak(route.detailed_steps.map((s: any) => s.instruction).join('. '))}>
                    <Volume2 size={14} /> Audio
                  </Button>
                </div>
                <div className="flex gap-4 mb-3 text-sm">
                  <div className="text-center">
                    <p className="text-xl font-bold text-teal-600">{route.total_distance_meters}m</p>
                    <p className="text-xs text-slate-400">Distance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-teal-600">~{route.estimated_walking_time_mins} min</p>
                    <p className="text-xs text-slate-400">Walk Time</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {route.detailed_steps.map((step: any, i: number) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{step.step_number}</div>
                      <p className="text-slate-600">{step.instruction}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
          {route?.error && (
            <Card className="border border-red-200 bg-red-50">
              <p className="text-red-600 text-sm font-medium">{route.error}</p>
            </Card>
          )}

          {/* Live queue summary */}
          <Card>
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
              🏥 Live Queue Status
            </h3>
            <div className="space-y-1.5">
              {queue.slice(0, 5).map((d: any, i: number) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-slate-500 truncate max-w-[140px]">{d.department_name.split(' ')[0]}</span>
                  <span className="font-semibold text-teal-700">{d.estimated_wait_minutes} min</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* SVG Map */}
        <div className="md:col-span-2">
          <Card className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Layers size={16} className="text-teal-600" /> Interactive Floor Map</h3>
              <div className="flex gap-1">
                {(['all', 0, 1, 2] as const).map(f => (
                  <button key={f} onClick={() => setActiveFloor(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${activeFloor === f ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {f === 'all' ? 'All' : `F${f}`}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <svg viewBox={`0 0 ${mapW} ${mapH}`} width="100%" style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                {/* Grid */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width={mapW} height={mapH} fill="url(#grid)" />

                {/* Floor labels */}
                {activeFloor === 'all' && [0, 1, 2].map(fl => (
                  <text key={fl} x={12} y={fl === 0 ? 480 : fl === 1 ? 310 : 140} fontSize="11" fill="#94a3b8" fontWeight="600">
                    Floor {fl}
                  </text>
                ))}

                {/* Edges */}
                {edges.map((e: any, i: number) => {
                  const s = nodeMap[e.source_node], t = nodeMap[e.target_node]
                  if (!s || !t) return null
                  const inPath = pathSet.has(e.source_node) && pathSet.has(e.target_node)
                  const hide = activeFloor !== 'all' && (s.floor !== activeFloor || t.floor !== activeFloor)
                  return (
                    <line key={i}
                      x1={s.x * scale} y1={(s.y - (s.floor * 170)) * scale + (s.floor * 170)}
                      x2={t.x * scale} y2={(t.y - (t.floor * 170)) * scale + (t.floor * 170)}
                      stroke={inPath ? '#0d9488' : hide ? '#e2e8f0' : '#cbd5e1'}
                      strokeWidth={inPath ? 3 : 1.5}
                      strokeDasharray={e.source_node.includes('ELEVATOR') || e.target_node.includes('ELEVATOR') ? '6 4' : undefined}
                      opacity={hide ? 0.2 : 1}
                    />
                  )
                })}

                {/* Nodes */}
                {nodes.map((n: any) => {
                  const nx = n.x * scale
                  const ny = (n.y - (n.floor * 170)) * scale + (n.floor * 170)
                  const inPath = pathSet.has(n.id)
                  const isFrom = n.id === from, isTo = n.id === to
                  const hide = activeFloor !== 'all' && n.floor !== activeFloor
                  const color = DEPT_COLOR[n.department] || '#64748b'
                  return (
                    <g key={n.id} style={{ cursor: 'pointer', opacity: hide ? 0.2 : 1 }}>
                      <circle cx={nx} cy={ny} r={isFrom || isTo ? 11 : 8}
                        fill={isFrom ? '#1e40af' : isTo ? '#dc2626' : inPath ? '#0d9488' : color}
                        stroke="white" strokeWidth={2} />
                      <text x={nx} y={ny + 20} textAnchor="middle" fontSize="8.5" fill="#475569" fontWeight={inPath ? '700' : '500'}>
                        {n.label.split(' ')[0]}
                      </text>
                    </g>
                  )
                })}

                {/* Legend */}
                <g transform={`translate(${mapW - 140}, ${mapH - 100})`}>
                  <rect width="135" height="90" fill="white" rx="8" stroke="#e2e8f0" />
                  <text x="8" y="18" fontSize="9" fontWeight="600" fill="#475569">Legend</text>
                  {[
                    { color: '#1e40af', label: 'Your Location' },
                    { color: '#dc2626', label: 'Destination' },
                    { color: '#0d9488', label: 'Route Path' },
                  ].map((l, i) => (
                    <g key={i} transform={`translate(8, ${30 + i * 20})`}>
                      <circle cx="6" cy="6" r="6" fill={l.color} />
                      <text x="16" y="10" fontSize="9" fill="#475569">{l.label}</text>
                    </g>
                  ))}
                </g>
              </svg>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

