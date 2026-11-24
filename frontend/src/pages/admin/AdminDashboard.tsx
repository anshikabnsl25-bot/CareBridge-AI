import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Activity, Clock, ShieldCheck, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { api } from '../../lib/api'
import { getUser } from '../../lib/auth'
import { Card, Spinner } from '../../components/ui'

const CHART_COLORS = ['#0d9488', '#1e40af', '#7c3aed', '#d97706', '#dc2626', '#059669', '#db2777']

export function AdminDashboard() {
  const user = getUser()
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.adminMetrics().then(m => setMetrics(m)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-80"><Spinner size="lg" /></div>

  const stats = [
    { label: 'Registered Patients', value: metrics.total_registered_patients, icon: <Users size={20} />, color: 'text-blue-600 bg-blue-50', delta: '+12 today' },
    { label: 'Active Referrals', value: metrics.active_referrals, icon: <Activity size={20} />, color: 'text-teal-600 bg-teal-50', delta: `${metrics.referral_completion_rate_pct}% completed` },
    { label: 'Avg Wait Time', value: `${metrics.average_waiting_time_mins} min`, icon: <Clock size={20} />, color: 'text-orange-600 bg-orange-50', delta: '−3 min from yesterday' },
    { label: 'Verifications Today', value: metrics.medicine_verification?.total_scans_today, icon: <ShieldCheck size={20} />, color: 'text-green-600 bg-green-50', delta: `${metrics.expired_batch_alerts} expired alerts` },
    { label: 'Suspicious Alerts', value: metrics.suspicious_counterfeit_alerts, icon: <AlertTriangle size={20} />, color: 'text-red-600 bg-red-50', delta: 'Needs review' },
    { label: 'Referral Rate', value: `${metrics.referral_completion_rate_pct}%`, icon: <TrendingUp size={20} />, color: 'text-purple-600 bg-purple-50', delta: 'Completion rate' },
  ]

  const verificationPieData = [
    { name: 'Authentic', value: metrics.medicine_verification?.authentic_matches },
    { name: 'Expired', value: metrics.medicine_verification?.expired_alerts },
    { name: 'Suspicious', value: metrics.medicine_verification?.suspicious_repeated_scans },
    { name: 'Not Found', value: metrics.medicine_verification?.unmatched_queries },
  ]

  const weeklyData = [
    { day: 'Mon', patients: 85, referrals: 12, verifications: 108 },
    { day: 'Tue', patients: 92, referrals: 18, verifications: 124 },
    { day: 'Wed', patients: 78, referrals: 15, verifications: 98 },
    { day: 'Thu', patients: 105, referrals: 22, verifications: 156 },
    { day: 'Fri', patients: 118, referrals: 25, verifications: 178 },
    { day: 'Sat', patients: 96, referrals: 20, verifications: 142 },
    { day: 'Sun', patients: 42, referrals: 8, verifications: 61 },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <p className="text-sm opacity-70">Hospital Administration · Analytics Console</p>
        <h1 className="text-2xl font-bold">{user?.full_name}</h1>
        <p className="text-sm opacity-60 mt-1">AIIMS District Healthcare Hub, Gorakhpur · Chief Medical Officer</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${s.color} mt-0.5`}>{s.icon}</div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-xs text-teal-600 font-medium mt-0.5">{s.delta}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Department load bar chart */}
        <Card>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-teal-600" /> Department-wise Patient Load
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metrics.department_load} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} tickFormatter={v => v.split(' ')[0]} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="patients" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Verification pie */}
        <Card>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <ShieldCheck size={16} className="text-green-600" /> Medicine Verification Breakdown
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={verificationPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                  {verificationPieData.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              {verificationPieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i] }} />
                  <span className="text-slate-600">{d.name}: <strong>{d.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly trend line chart */}
      <Card>
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-blue-600" /> Weekly Activity Trends
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={weeklyData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="patients" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} name="Patients" />
            <Line type="monotone" dataKey="referrals" stroke="#1e40af" strokeWidth={2} dot={{ r: 3 }} name="Referrals" />
            <Line type="monotone" dataKey="verifications" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} name="Verifications" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Average wait by dept */}
      <Card>
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Clock size={16} className="text-orange-500" /> Average Waiting Time by Department
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {metrics.department_load.map((d: any, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{d.department}</span>
                  <span className="font-semibold">{d.avg_wait} min</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${Math.min(100, (d.avg_wait / 30) * 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

