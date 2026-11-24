import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Stethoscope, CheckCircle } from 'lucide-react'
import { api } from '../lib/api'
import { Card, Button, Select, Input, Badge, Spinner } from '../components/ui'
import { STATUS_COLOR, formatDate } from '../lib/utils'

export function AppointmentsPage() {
  const [specialists, setSpecialists] = useState<any[]>([])
  const [depts, setDepts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [booked, setBooked] = useState(false)
  const [form, setForm] = useState({
    specialist_id: '', department_id: 'DEPT-CARDIO',
    appointment_date: '2026-11-25', time_slot: '09:00 AM', reason: ''
  })

  const TIME_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM']

  useEffect(() => {
    Promise.all([api.specialists(), api.queueDepartments()]).then(([s, q]) => {
      setSpecialists(s)
      if (s.length) setForm(p => ({ ...p, specialist_id: s[0].id }))
      setDepts(q)
    }).finally(() => setLoading(false))
  }, [])

  const demoAppts = [
    { specialist_name: 'Dr. Rajesh K. Sharma', department: 'Cardiology', date: '2026-11-25', time: '09:00 AM', status: 'confirmed' },
    { specialist_name: 'Dr. Aarti Sundaram', department: 'Pediatrics', date: '2026-11-28', time: '11:00 AM', status: 'confirmed' },
  ]

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  const specOptions = specialists.map(s => ({ value: s.id, label: `${s.name} · ${s.department}` }))
  const slotOptions = TIME_SLOTS.map(t => ({ value: t, label: t }))

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Calendar size={22} className="text-teal-600" /> Appointments</h2>
          <p className="text-sm text-slate-500">Book specialist consultations</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Calendar size={16} /> {showForm ? 'Cancel' : 'Book Appointment'}
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h3 className="font-semibold text-slate-800 mb-4">Book New Appointment</h3>
            {booked ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-slate-700">Appointment Confirmed!</p>
                <p className="text-sm text-slate-500 mt-1">Your appointment has been booked successfully.</p>
                <Button size="sm" variant="outline" className="mt-4" onClick={() => { setBooked(false); setShowForm(false) }}>Done</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Select label="Choose Specialist" value={form.specialist_id} options={specOptions}
                    onChange={e => setForm(p => ({ ...p, specialist_id: e.target.value }))} />
                </div>
                <Input label="Appointment Date" type="date" value={form.appointment_date}
                  onChange={e => setForm(p => ({ ...p, appointment_date: e.target.value }))} />
                <Select label="Time Slot" value={form.time_slot} options={slotOptions}
                  onChange={e => setForm(p => ({ ...p, time_slot: e.target.value }))} />
                <div className="col-span-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Reason for Consultation</label>
                    <textarea className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-h-[70px] resize-none"
                      value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                      placeholder="Briefly describe your symptoms or consultation reason..." />
                  </div>
                </div>
                <Button loading={submitting} className="col-span-2"
                  onClick={async () => { setSubmitting(true); await new Promise(r => setTimeout(r, 1200)); setSubmitting(false); setBooked(true) }}>
                  <Calendar size={16} /> Confirm Appointment
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Your Appointments</h3>
        <div className="space-y-3">
          {demoAppts.map((a, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Stethoscope size={18} className="text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700 text-sm">{a.specialist_name}</p>
                  <p className="text-xs text-slate-400">{a.department}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Calendar size={11} /> {formatDate(a.date)} · <Clock size={11} /> {a.time}</p>
                </div>
              </div>
              <Badge className={STATUS_COLOR[a.status] || ''}>{a.status}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Available Specialists */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User size={16} className="text-blue-600" /> Specialist Directory ({specialists.length})
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {specialists.map((s, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-3">
              <p className="font-semibold text-sm text-slate-700">{s.name}</p>
              <p className="text-xs text-teal-600">{s.department}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-400">{s.languages}</span>
                <Badge className={s.availability === 'Available' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}>
                  {s.availability}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

