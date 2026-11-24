import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Stethoscope, Activity, Clock, ChevronRight, AlertTriangle, TrendingUp } from 'lucide-react'
import { api } from '../../lib/api'
import { getUser } from '../../lib/auth'
import { Card, Badge, Button, Spinner, DisclaimerBanner } from '../../components/ui'
import { PRIORITY_COLOR, STATUS_COLOR } from '../../lib/utils'

export function AshaWorkerDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const user = getUser()
  const [cases, setCases] = useState<any[]>([])
  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.cases(), api.referrals()])
      .then(([c, r]) => { setCases(c.slice(0, 5)); setReferrals(r.slice(0, 4)) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-80"><Spinner size="lg" /></div>

  const urgentCount = cases.filter(c => c.priority_level === 'Urgent review').length
  const pendingRefs = referrals.filter(r => r.status === 'pending').length

  const stats = [
    { label: 'Total Cases Filed', value: cases.length.toString(), icon: <Stethoscope size={20} />, color: 'text-teal-600 bg-teal-50' },
    { label: 'Urgent Reviews', value: urgentCount.toString(), icon: <AlertTriangle size={20} />, color: 'text-red-600 bg-red-50' },
    { label: 'Pending Referrals', value: pendingRefs.toString(), icon: <Activity size={20} />, color: 'text-orange-600 bg-orange-50' },
    { label: 'Patients Registered', value: '12', icon: <Users size={20} />, color: 'text-blue-600 bg-blue-50' },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white"
      >
        <p className="text-sm opacity-80">ASHA Health Worker Portal</p>
        <h1 className="text-2xl font-bold">{user?.full_name}</h1>
        <p className="text-sm opacity-70 mt-1">PHC Centre Barhaj · Gorakhpur</p>
        <div className="flex gap-2 mt-4">
          <Button size="sm" className="bg-white text-purple-700 hover:bg-purple-50" onClick={() => onNavigate('register')}>
            <Users size={14} /> Register Patient
          </Button>
          <Button size="sm" className="bg-purple-500/30 text-white hover:bg-purple-500/50 border border-white/30" onClick={() => onNavigate('case')}>
            <Stethoscope size={14} /> New Clinical Case
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <DisclaimerBanner text="PROTOTYPE: AI Triage is an assistive research tool. All clinical decisions must be reviewed by a licensed healthcare professional." />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp size={16} className="text-teal-600" /> Recent Cases
            </h3>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('triage')}>View All <ChevronRight size={14} /></Button>
          </div>
          <div className="space-y-2">
            {cases.map((c, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{c.patient_name}</p>
                    <p className="text-xs text-slate-400 truncate">{c.symptoms.slice(0, 50)}…</p>
                  </div>
                  <Badge className={PRIORITY_COLOR[c.priority_level] || 'bg-gray-100 text-gray-600 border-gray-200'}>
                    {c.priority_level?.split(' ')[0]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity size={16} className="text-blue-600" /> Referral Status
            </h3>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('referrals')}>View All <ChevronRight size={14} /></Button>
          </div>
          <div className="space-y-2">
            {referrals.map((r, i) => (
              <div key={i} className="flex items-center justify-between border border-slate-100 rounded-xl p-3 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{r.patient_name}</p>
                  <p className="text-xs text-slate-400 truncate">{r.department}</p>
                </div>
                <Badge className={STATUS_COLOR[r.status] || ''}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Register New Patient', icon: <Users size={22} />, page: 'register', color: 'from-blue-500 to-blue-700' },
          { label: 'Submit Clinical Case & Triage', icon: <Stethoscope size={22} />, page: 'case', color: 'from-teal-500 to-teal-700' },
          { label: 'Follow-up Referrals', icon: <Clock size={22} />, page: 'referrals', color: 'from-purple-500 to-purple-700' },
        ].map((a, i) => (
          <button key={i} onClick={() => onNavigate(a.page)} className={`bg-gradient-to-br ${a.color} text-white rounded-2xl p-5 text-left flex flex-col gap-3 hover:opacity-90 transition-opacity`}>
            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">{a.icon}</div>
            <span className="font-semibold text-sm">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

