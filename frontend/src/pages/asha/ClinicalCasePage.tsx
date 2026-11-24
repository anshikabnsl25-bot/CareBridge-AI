import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Stethoscope, AlertTriangle, CheckCircle, Clock, FileText, ChevronRight } from 'lucide-react'
import { api } from '../../lib/api'
import { getUser } from '../../lib/auth'
import { Card, Badge, Button, Spinner, Input, Select, DisclaimerBanner } from '../../components/ui'
import { PRIORITY_COLOR } from '../../lib/utils'

type View = 'list' | 'case_form' | 'triage_result'

export function ClinicalCasePage() {
  const user = getUser()
  const [view, setView] = useState<View>('list')
  const [patients, setPatients] = useState<any[]>([])
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [triageResult, setTriageResult] = useState<any>(null)
  const [form, setForm] = useState({
    patient_id: '',
    recorded_by: user?.full_name || 'ASHA Worker',
    symptoms: '',
    symptom_duration_days: '1',
    medical_history: '',
    temperature_f: '98.6',
    systolic_bp: '120',
    diastolic_bp: '80',
    heart_rate_bpm: '72',
    oxygen_saturation_pct: '98',
    additional_observations: '',
    consent_given: true,
  })

  useEffect(() => {
    Promise.all([api.patients(), api.cases()])
      .then(([p, c]) => { setPatients(p); setCases(c) })
      .finally(() => setLoading(false))
  }, [])

  const ptOptions = [
    { value: '', label: 'Select patient...' },
    ...patients.map(p => ({ value: p.id, label: `${p.full_name} (${p.patient_id_number})` }))
  ]

  async function handleSubmitCase() {
    if (!form.patient_id || !form.symptoms.trim()) return
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        symptom_duration_days: parseInt(form.symptom_duration_days),
        temperature_f: parseFloat(form.temperature_f),
        systolic_bp: parseInt(form.systolic_bp),
        diastolic_bp: parseInt(form.diastolic_bp),
        heart_rate_bpm: parseInt(form.heart_rate_bpm),
        oxygen_saturation_pct: parseFloat(form.oxygen_saturation_pct),
      }
      const result = await api.submitCase(payload)
      setTriageResult(result)
      setView('triage_result')
      const updated = await api.cases()
      setCases(updated)
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  if (view === 'triage_result' && triageResult) {
    const t = triageResult.triage_details
    return (
      <div className="space-y-5 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="text-sm text-teal-600 hover:underline">← Back to Cases</button>
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`border-2 ${t.priority_level === 'Urgent review' ? 'border-red-300' : t.priority_level === 'Priority review' ? 'border-orange-300' : 'border-green-300'}`}>
            {t.emergency_warning && (
              <div className="bg-red-600 text-white rounded-xl p-3 mb-4 flex items-center gap-2 font-semibold">
                🚨 EMERGENCY: Patient shows potential emergency symptoms. Seek immediate medical attention — do NOT wait for further AI analysis.
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className={`text-3xl font-black px-4 py-2 rounded-xl ${PRIORITY_COLOR[t.priority_level]}`}>
                {t.priority_level}
              </div>
              <div>
                <p className="text-sm text-slate-500">Risk Score</p>
                <p className="text-2xl font-bold text-slate-700">{(t.risk_score * 100).toFixed(0)}%</p>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-700 mb-2">Recommended Specialty: <span className="text-teal-700">{t.recommended_specialty}</span></p>

            <div className="space-y-2 mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase">Contributing Factors</p>
              {t.contributing_factors.map((f: any, i: number) => (
                <div key={i} className="flex items-start gap-2 bg-slate-50 rounded-xl p-2.5">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${f.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : f.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{f.severity}</span>
                  <span className="text-sm text-slate-600 flex-1">{f.factor}</span>
                  <span className="text-xs text-teal-600 font-mono">{f.weight}</span>
                </div>
              ))}
            </div>

            {t.missing_information?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
                <p className="font-semibold mb-1">Missing Information:</p>
                {t.missing_information.map((m: string, i: number) => <p key={i}>• {m}</p>)}
              </div>
            )}

            <DisclaimerBanner text={t.model_limitations} />
            <p className="text-xs text-slate-400 mt-3">{t.disclaimer}</p>
          </Card>
        </motion.div>
        <Button onClick={() => setView('list')}>← Back to All Cases</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Stethoscope size={22} className="text-teal-600" /> Clinical Cases</h2>
          <p className="text-sm text-slate-500">Submit patient vitals for AI-assisted triage review</p>
        </div>
        <Button onClick={() => setView(view === 'case_form' ? 'list' : 'case_form')}>
          {view === 'case_form' ? '← Cancel' : '+ New Case'}
        </Button>
      </div>

      <DisclaimerBanner text="PROTOTYPE: AI Triage is a research tool. All cases must be reviewed by a licensed physician. Emergency symptoms require immediate professional care." />

      {view === 'case_form' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h3 className="font-semibold text-slate-800 mb-4">New Clinical Case Submission</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Select label="Select Patient *" value={form.patient_id} options={ptOptions}
                  onChange={e => setForm(p => ({ ...p, patient_id: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Symptoms *</label>
                  <textarea className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-h-[80px] resize-none"
                    placeholder="Describe patient symptoms in detail..."
                    value={form.symptoms} onChange={e => setForm(p => ({ ...p, symptoms: e.target.value }))} />
                </div>
              </div>
              <Input label="Duration (days) *" type="number" value={form.symptom_duration_days}
                onChange={e => setForm(p => ({ ...p, symptom_duration_days: e.target.value }))} />
              <Input label="Temperature (°F) *" type="number" step="0.1" value={form.temperature_f}
                onChange={e => setForm(p => ({ ...p, temperature_f: e.target.value }))} />
              <Input label="Systolic BP (mmHg) *" type="number" value={form.systolic_bp}
                onChange={e => setForm(p => ({ ...p, systolic_bp: e.target.value }))} />
              <Input label="Diastolic BP (mmHg) *" type="number" value={form.diastolic_bp}
                onChange={e => setForm(p => ({ ...p, diastolic_bp: e.target.value }))} />
              <Input label="Heart Rate (bpm) *" type="number" value={form.heart_rate_bpm}
                onChange={e => setForm(p => ({ ...p, heart_rate_bpm: e.target.value }))} />
              <Input label="SpO2 (%) *" type="number" step="0.1" value={form.oxygen_saturation_pct}
                onChange={e => setForm(p => ({ ...p, oxygen_saturation_pct: e.target.value }))} />
              <div className="md:col-span-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Medical History</label>
                  <textarea className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-h-[64px] resize-none"
                    placeholder="Previous conditions, medications, allergies..."
                    value={form.medical_history} onChange={e => setForm(p => ({ ...p, medical_history: e.target.value }))} />
                </div>
              </div>
              <div className="md:col-span-2 flex items-center gap-2 text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <input type="checkbox" checked={form.consent_given} onChange={e => setForm(p => ({ ...p, consent_given: e.target.checked }))} />
                Patient has provided informed consent for clinical data collection and digital triage assistance under CareBridge AI protocols.
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button loading={submitting} onClick={handleSubmitCase} disabled={!form.patient_id || !form.symptoms}>
                <Stethoscope size={16} /> Submit Case & Evaluate Triage
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Cases list */}
      <Card>
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <FileText size={16} className="text-blue-600" /> All Cases ({cases.length})
        </h3>
        <div className="space-y-3">
          {cases.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No clinical cases submitted yet. Use the form above to submit one.</p>}
          {cases.map((c, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-700 text-sm">{c.patient_name}</p>
                    <span className="text-xs text-slate-400">{c.patient_id_number} · {c.patient_gender} · {c.patient_age}y</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.symptoms}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                    <span>🌡️ {c.vitals.temp}°F</span>
                    <span>💉 {c.vitals.bp} mmHg</span>
                    <span>❤️ {c.vitals.hr} bpm</span>
                    <span>🫁 {c.vitals.spo2}%</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <Badge className={PRIORITY_COLOR[c.priority_level] || 'bg-gray-100 text-gray-600 border-gray-200'}>
                    {c.priority_level?.split(' ')[0]}
                  </Badge>
                  <span className="text-xs text-slate-400">{c.recommended_specialty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

