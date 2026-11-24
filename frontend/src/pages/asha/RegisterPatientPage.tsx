import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, PlusCircle } from 'lucide-react'
import { api } from '../../lib/api'
import { Card, Button, Input, Select, Spinner, Badge, DisclaimerBanner } from '../../components/ui'

export function RegisterPatientPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<any>(null)
  const [form, setForm] = useState({
    full_name: '', age: '', gender: 'Female',
    contact_number: '', village: '', district: 'Gorakhpur', emergency_contact: '',
  })

  useEffect(() => {
    api.patients().then(setPatients).finally(() => setLoading(false))
  }, [])

  async function handleRegister() {
    setSubmitting(true)
    try {
      const res = await api.registerPatient({ ...form, age: parseInt(form.age), consent_confirmed: true })
      setSuccess(res)
      const updated = await api.patients()
      setPatients(updated)
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users size={22} className="text-teal-600" /> Patient Registry</h2>
          <p className="text-sm text-slate-500">{patients.length} patients registered</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setSuccess(null) }}>
          <PlusCircle size={16} /> {showForm ? 'Cancel' : 'Register Patient'}
        </Button>
      </div>

      <DisclaimerBanner text="Only collect information with explicit informed patient consent. All data is used solely for clinical support within CareBridge AI." />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h3 className="font-semibold text-slate-800 mb-4">Register New Patient</h3>
            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="font-semibold text-green-700">✓ Patient Registered</p>
                <p className="text-sm text-green-600 mt-1">ID: {success.patient_id_number} · {success.full_name}</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => { setSuccess(null); setForm({ full_name: '', age: '', gender: 'Female', contact_number: '', village: '', district: 'Gorakhpur', emergency_contact: '' }) }}>Register Another</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name *" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Ramesh Kumar" />
                <Input label="Age *" type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} />
                <Select label="Gender" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} options={[{ value: 'Female', label: 'Female' }, { value: 'Male', label: 'Male' }, { value: 'Other', label: 'Other' }]} />
                <Input label="Contact Number" value={form.contact_number} onChange={e => setForm(p => ({ ...p, contact_number: e.target.value }))} placeholder="+91-9XXXXXXXXX" />
                <Input label="Village / Area" value={form.village} onChange={e => setForm(p => ({ ...p, village: e.target.value }))} />
                <Input label="District" value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} />
                <div className="col-span-2">
                  <Input label="Emergency Contact" value={form.emergency_contact} onChange={e => setForm(p => ({ ...p, emergency_contact: e.target.value }))} placeholder="+91-9XXXXXXXXX" />
                </div>
                <div className="col-span-2">
                  <Button loading={submitting} onClick={handleRegister} disabled={!form.full_name || !form.age} className="w-full">
                    <Users size={16} /> Register Patient
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Registered Patients</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100">
                <th className="text-left pb-2 font-semibold">Patient ID</th>
                <th className="text-left pb-2 font-semibold">Name</th>
                <th className="text-left pb-2 font-semibold">Age / Gender</th>
                <th className="text-left pb-2 font-semibold">Village</th>
              </tr>
            </thead>
            <tbody>
              {patients.slice(0, 15).map((p, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2.5 font-mono text-xs text-teal-700">{p.patient_id_number}</td>
                  <td className="py-2.5 font-medium">{p.full_name}</td>
                  <td className="py-2.5 text-slate-500">{p.age}y · {p.gender}</td>
                  <td className="py-2.5 text-slate-500">{p.village || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

