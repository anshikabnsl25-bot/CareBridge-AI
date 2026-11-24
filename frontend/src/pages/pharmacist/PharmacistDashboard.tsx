import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Pill, ShieldCheck, AlertTriangle, Bell, Package,
  QrCode, TrendingUp, ChevronRight, Plus
} from 'lucide-react'
import { api } from '../../lib/api'
import { getUser } from '../../lib/auth'
import { Card, Badge, Button, Spinner, Input } from '../../components/ui'
import { STATUS_COLOR, formatDate } from '../../lib/utils'

export function PharmacistDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const user = getUser()
  const [batches, setBatches] = useState<any[]>([])
  const [suspicious, setSuspicious] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showRegister, setShowRegister] = useState(false)
  const [form, setForm] = useState({
    medicine_name: '', generic_name: '', category: 'Antibiotic',
    dosage_form: 'Tablet', strength: '', manufacturer: '',
    regulatory_reg_no: '', batch_number: '', mfg_date: '', expiry_date: '', quantity: '500'
  })
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState<any>(null)

  useEffect(() => {
    Promise.all([api.medicineBatches(), api.suspiciousReports()])
      .then(([b, s]) => { setBatches(b); setSuspicious(s) })
      .finally(() => setLoading(false))
  }, [])

  const expiredBatches = batches.filter(b => b.status === 'expired')
  const activeBatches = batches.filter(b => b.status === 'active')

  async function handleRegister() {
    setRegistering(true)
    try {
      const res = await api.registerBatch({ ...form, quantity: parseInt(form.quantity) })
      setRegistered(res)
      const updated = await api.medicineBatches()
      setBatches(updated)
    } finally { setRegistering(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-80"><Spinner size="lg" /></div>

  const stats = [
    { label: 'Active Batches', value: activeBatches.length, icon: <Package size={20} />, color: 'text-teal-600 bg-teal-50' },
    { label: 'Expired Batches', value: expiredBatches.length, icon: <AlertTriangle size={20} />, color: 'text-red-600 bg-red-50' },
    { label: 'Suspicious Alerts', value: suspicious.length, icon: <Bell size={20} />, color: 'text-orange-600 bg-orange-50' },
    { label: 'Verifications Today', value: '142', icon: <ShieldCheck size={20} />, color: 'text-green-600 bg-green-50' },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-6 text-white">
        <p className="text-sm opacity-80">Pharmacist · Jan Aushadhi Kendra</p>
        <h1 className="text-2xl font-bold">{user?.full_name}</h1>
        <p className="text-sm opacity-70 mt-1">AIIMS District Hub · Gorakhpur</p>
        <div className="flex gap-2 mt-4">
          <Button size="sm" className="bg-white text-orange-700 hover:bg-orange-50" onClick={() => setShowRegister(true)}>
            <Plus size={14} /> Register Batch
          </Button>
          <Button size="sm" className="bg-orange-500/30 text-white hover:bg-orange-500/50 border border-white/30" onClick={() => onNavigate('verify')}>
            <QrCode size={14} /> Scan QR
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

      {/* Register batch modal */}
      {showRegister && (
        <Card className="border-2 border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Register New Medicine Batch</h3>
            <Button size="sm" variant="ghost" onClick={() => { setShowRegister(false); setRegistered(null) }}>✕</Button>
          </div>
          {registered ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="font-semibold text-green-700 flex items-center gap-2"><ShieldCheck size={16} /> Batch Registered Successfully</p>
                <p className="text-sm text-green-600 mt-1">Batch: {registered.batch_number}</p>
                <p className="text-sm text-green-600">Serial: {registered.serial_number}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 font-mono break-all">{registered.qr_payload}</div>
              <Button variant="outline" onClick={() => setRegistered(null)}>Register Another Batch</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'medicine_name', label: 'Medicine Name' },
                { key: 'generic_name', label: 'Generic Name' },
                { key: 'manufacturer', label: 'Manufacturer' },
                { key: 'regulatory_reg_no', label: 'Regulatory Reg No.' },
                { key: 'strength', label: 'Strength (e.g. 500mg)' },
                { key: 'batch_number', label: 'Batch Number' },
                { key: 'mfg_date', label: 'Mfg Date (YYYY-MM-DD)' },
                { key: 'expiry_date', label: 'Expiry Date (YYYY-MM-DD)' },
                { key: 'quantity', label: 'Quantity' },
              ].map(f => (
                <Input key={f.key} label={f.label} value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
              ))}
              <Button loading={registering} onClick={handleRegister} className="col-span-2">
                <Pill size={16} /> Register & Generate QR
              </Button>
            </div>
          )}
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Expiry alerts */}
        {expiredBatches.length > 0 && (
          <Card>
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-red-500" /> Expiry Alerts ({expiredBatches.length})
            </h3>
            <div className="space-y-2">
              {expiredBatches.map((b, i) => (
                <div key={i} className="border border-red-100 bg-red-50 rounded-xl p-3 flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-red-800">{b.medicine_name}</p>
                    <p className="text-xs text-red-500">{b.batch_number} · Expired: {b.expiry_date}</p>
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-red-200">Expired</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Suspicious reports */}
        <Card>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Bell size={16} className="text-orange-500" /> Suspicious Scan Reports ({suspicious.length})
          </h3>
          <div className="space-y-2">
            {suspicious.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">No suspicious scans flagged</p>}
            {suspicious.map((s, i) => (
              <div key={i} className="border border-orange-100 bg-orange-50 rounded-xl p-3">
                <p className="text-sm font-medium text-orange-800">{s.medicine_name}</p>
                <p className="text-xs text-orange-500">Batch: {s.batch_number} · Scans: {s.scan_count}</p>
                <p className="text-xs text-orange-400 mt-1">{s.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Inventory table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <TrendingUp size={16} className="text-teal-600" /> Medicine Inventory ({batches.length} batches)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100">
                <th className="text-left pb-2 font-semibold">Medicine</th>
                <th className="text-left pb-2 font-semibold">Batch</th>
                <th className="text-left pb-2 font-semibold">Expiry</th>
                <th className="text-left pb-2 font-semibold">Qty</th>
                <th className="text-left pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.slice(0, 10).map((b, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2.5 max-w-[160px] truncate">{b.medicine_name}</td>
                  <td className="py-2.5 font-mono text-xs">{b.batch_number}</td>
                  <td className="py-2.5 text-xs">{b.expiry_date}</td>
                  <td className="py-2.5">{b.quantity}</td>
                  <td className="py-2.5">
                    <Badge className={STATUS_COLOR[b.status] || 'bg-gray-100 text-gray-600 border-gray-200'}>
                      {b.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

