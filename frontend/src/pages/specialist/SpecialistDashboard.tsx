import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Stethoscope, Clock, CheckCircle2, FileText, ChevronRight, User } from 'lucide-react'
import { api } from '../../lib/api'
import { getUser } from '../../lib/auth'
import { Card, Badge, Button, Spinner, DisclaimerBanner, Input } from '../../components/ui'
import { PRIORITY_COLOR, STATUS_COLOR, formatDate } from '../../lib/utils'

export function SpecialistDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const user = getUser()
  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRef, setSelectedRef] = useState<any>(null)
  const [observations, setObservations] = useState('')
  const [action, setAction] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<string[]>([])

  useEffect(() => {
    api.referrals('SPEC-101').then(r => setReferrals(r)).finally(() => setLoading(false))
  }, [])

  const pending = referrals.filter(r => r.status === 'pending' || r.status === 'accepted')
  const completed = referrals.filter(r => r.status === 'completed')

  async function handleReview(refId: string) {
    if (!observations.trim() || !action.trim()) return
    setSubmitting(true)
    try {
      await api.submitReview({ referral_id: refId, observations, recommended_action: action })
      setSubmitted(prev => [...prev, refId])
      setSelectedRef(null)
      setObservations(''); setAction('')
      const updated = await api.referrals('SPEC-101')
      setReferrals(updated)
    } catch (e) { console.error(e) }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-80"><Spinner size="lg" /></div>

  const stats = [
    { label: 'Assigned Referrals', value: referrals.length, icon: <FileText size={20} />, color: 'text-teal-600 bg-teal-50' },
    { label: 'Pending Review', value: pending.length, icon: <Clock size={20} />, color: 'text-orange-600 bg-orange-50' },
    { label: 'Reviewed', value: completed.length, icon: <CheckCircle2 size={20} />, color: 'text-green-600 bg-green-50' },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-600 to-cyan-700 rounded-2xl p-6 text-white">
        <p className="text-sm opacity-80">Specialist Tele-Review Portal</p>
        <h1 className="text-2xl font-bold">{user?.full_name}</h1>
        <p className="text-sm opacity-70 mt-1">Department of Cardiology · AIIMS District Hub Gorakhpur</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <DisclaimerBanner text="All clinical reviews are made by the specialist using their own professional judgement. AI triage scores are for context only." />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending cases */}
        <Card>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Clock size={16} className="text-orange-500" /> Pending Reviews ({pending.length})
          </h3>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {pending.length === 0 && <p className="text-sm text-slate-400 text-center py-6">All caught up! No pending referrals.</p>}
            {pending.map((r, i) => (
              <div key={i} className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${selectedRef?.id === r.id ? 'border-teal-400 bg-teal-50' : 'border-slate-100'}`}
                onClick={() => setSelectedRef(r)}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User size={14} className="text-teal-500" />
                      <p className="text-sm font-semibold text-slate-700">{r.patient_name}</p>
                      <span className="text-xs text-slate-400">· {r.patient_age}y</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{r.symptoms}</p>
                  </div>
                  <Badge className={PRIORITY_COLOR[r.urgency] || 'bg-gray-100 text-gray-600 border-gray-200'}>
                    {r.urgency?.split(' ')[0]}
                  </Badge>
                </div>
                {r.vitals && (
                  <div className="flex gap-3 mt-2 text-xs text-slate-500">
                    <span>🌡️ {r.vitals.temp}°F</span>
                    <span>💉 {r.vitals.bp}</span>
                    <span>❤️ {r.vitals.hr}bpm</span>
                    <span>🫁 {r.vitals.spo2}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-400">{formatDate(r.created_at)}</span>
                  <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setSelectedRef(r) }}>
                    Review <ChevronRight size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Review panel */}
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">
            {selectedRef ? `Review: ${selectedRef.patient_name}` : 'Select a Case to Review'}
          </h3>
          {!selectedRef ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Stethoscope size={40} />
              <p className="mt-3 text-sm">Click a pending referral to begin review</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1">
                <p><span className="font-medium">Patient:</span> {selectedRef.patient_name} · {selectedRef.patient_gender} · {selectedRef.patient_age}y</p>
                <p><span className="font-medium">Symptoms:</span> {selectedRef.symptoms}</p>
                <p><span className="font-medium">Urgency:</span> {selectedRef.urgency}</p>
                <p><span className="font-medium">Referred by:</span> {selectedRef.referred_by || 'ASHA Worker'}</p>
              </div>
              <Input label="Clinical Observations" value={observations}
                onChange={e => setObservations(e.target.value)}
                placeholder="Enter your clinical observations and findings..." />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Recommended Action</label>
                <textarea className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-h-[80px] resize-none"
                  value={action} onChange={e => setAction(e.target.value)}
                  placeholder="Recommended next steps for the patient..." />
              </div>
              <Button loading={submitting} onClick={() => handleReview(selectedRef.id)} className="w-full">
                <CheckCircle2 size={16} /> Submit Clinical Review
              </Button>
            </div>
          )}

          {/* Completed list */}
          {completed.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2">Recently Reviewed</p>
              {completed.slice(0, 3).map((r, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 text-xs text-slate-500">
                  <span>{r.patient_name}</span>
                  <Badge className={STATUS_COLOR['completed']}>Reviewed</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

