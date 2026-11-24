import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Camera, Search, CheckCircle, AlertTriangle, XCircle, ChevronRight, Package, Truck } from 'lucide-react'
import { api } from '../lib/api'
import { Card, Button, Input, Badge, Spinner, DisclaimerBanner } from '../components/ui'
import { STATUS_COLOR } from '../lib/utils'
import QRCode from 'qrcode'

const STATUS_ICON: Record<string, React.ReactElement> = {
  matched: <CheckCircle className="text-green-600" size={22} />,
  expired: <AlertTriangle className="text-red-600" size={22} />,
  suspicious: <AlertTriangle className="text-orange-500" size={22} />,
  not_found: <XCircle className="text-gray-500" size={22} />,
}

export function MedicineVerifyPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [demoQR, setDemoQR] = useState('')
  const [demoQRExpired, setDemoQRExpired] = useState('')
  const [demoSerial, setDemoSerial] = useState('')
  const demoPayload = `{"app":"CareBridgeAI","ver":"1.0","sn":"CB-MED-MED-100-BAT-100-2025-1000-SN10000","batch":"BAT-100-2025-1000","med":"Amoxicillin & Potassium Clavulanate","mfr":"Cipla Lifesciences Ltd","exp":"2027-01-10","reg":"DCGI-2023-AMX-910"}`
  const demoExpiredPayload = `{"app":"CareBridgeAI","ver":"1.0","sn":"CB-MED-MED-100-BAT-100-2024-1005-SN10050","batch":"BAT-100-2024-1005","med":"Paracetamol IP","mfr":"GlaxoSmithKline Pharma","exp":"2024-01-14","reg":"DCGI-2022-PCM-114"}`

  useEffect(() => {
    QRCode.toDataURL(demoPayload, { width: 180, margin: 1 }).then(url => setDemoQR(url))
    QRCode.toDataURL(demoExpiredPayload, { width: 180, margin: 1 }).then(url => setDemoQRExpired(url))
    setDemoSerial('CB-MED-MED-100-BAT-100-2025-1000-SN10000')
  }, [])

  async function handleVerify() {
    if (!query.trim()) { setError('Please enter a serial number, batch number or QR payload.'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const r = await api.verifyMedicine(query, 'pharmacist')
      setResult(r)
    } catch (e: any) {
      setError(e.message || 'Verification failed')
    } finally { setLoading(false) }
  }

  function loadDemo(payload: string) {
    setQuery(payload)
    setResult(null)
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><QrCode size={22} className="text-teal-600" /> Medicine Verification</h2>
        <p className="text-sm text-slate-500 mt-1">Scan or enter medicine QR code to verify authenticity, batch details and supply chain.</p>
      </div>

      <DisclaimerBanner text="SIMULATED: This verifies against CareBridge demonstration records. Genuine medicine verification requires manufacturer integration with CDSCO systems." />

      {/* Input area */}
      <Card>
        <h3 className="font-semibold text-slate-700 mb-3">Enter Serial / Batch Number or QR Payload</h3>
        <div className="flex gap-2">
          <Input className="flex-1" placeholder="e.g. CB-MED-MED-100-BAT-100-2025-1000-SN10000" value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleVerify()} />
          <Button onClick={handleVerify} loading={loading}><Search size={16} /> Verify</Button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          <Button size="sm" variant="ghost" onClick={() => loadDemo(demoPayload)}>
            <Package size={14} /> Load Valid Demo QR
          </Button>
          <Button size="sm" variant="ghost" onClick={() => loadDemo(demoExpiredPayload)}>
            <AlertTriangle size={14} /> Load Expired Demo QR
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setQuery('CB-MED-MED-107-BAT-107-2025-1007-SN10070')}>
            <XCircle size={14} /> Load Suspicious Demo
          </Button>
        </div>
      </Card>

      {/* Demo QR codes */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { qr: demoQR, label: 'Valid Medicine (Demo)', sub: 'Amoxicillin 625mg · Cipla · Exp: 2027', status: 'valid' },
          { qr: demoQRExpired, label: 'Expired Medicine (Demo)', sub: 'Paracetamol 500mg · GSK · Exp: 2024-01-14', status: 'expired' },
        ].map((d, i) => (
          <Card key={i} className="flex flex-col items-center gap-3 text-center">
            {d.qr ? <img src={d.qr} alt="QR Code" className="w-36 h-36 rounded-lg border border-slate-100" /> : <div className="w-36 h-36 bg-slate-100 rounded-lg animate-pulse" />}
            <div>
              <p className="font-semibold text-sm text-slate-700">{d.label}</p>
              <p className="text-xs text-slate-400">{d.sub}</p>
            </div>
            <Badge className={d.status === 'valid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}>
              {d.status === 'valid' ? '✓ Demo Valid' : '⚠ Demo Expired'}
            </Badge>
          </Card>
        ))}
      </div>

      {/* Verification result */}
      {loading && <div className="flex justify-center py-8"><Spinner size="lg" /></div>}
      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`border-2 ${
            result.status === 'matched' ? 'border-green-200' :
            result.status === 'expired' ? 'border-red-200' :
            result.status === 'suspicious' ? 'border-orange-200' : 'border-gray-200'
          }`}>
            {/* Status header */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              {STATUS_ICON[result.status] || <XCircle size={22} className="text-gray-400" />}
              <div>
                <p className="font-bold text-lg text-slate-800">
                  {result.status === 'matched' ? '✓ Verification Successful' :
                   result.status === 'expired' ? '⚠ Expired Medicine Detected' :
                   result.status === 'suspicious' ? '🚨 Suspicious Serial Flagged' : '✕ Record Not Found'}
                </p>
                <p className="text-sm text-slate-500">{result.message}</p>
              </div>
            </div>

            {/* Medicine details */}
            {result.medicine && (
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Medicine Details</p>
                  <div className="space-y-1.5 text-sm">
                    {[
                      ['Name', result.medicine.name],
                      ['Generic', result.medicine.generic_name],
                      ['Manufacturer', result.medicine.manufacturer],
                      ['Category', result.medicine.category],
                      ['Form', result.medicine.dosage_form],
                      ['Strength', result.medicine.strength],
                      ['Reg. No.', result.medicine.regulatory_reg_no],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-slate-400 w-24 shrink-0">{k}:</span>
                        <span className="text-slate-700 font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {result.batch && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Batch Information</p>
                    <div className="space-y-1.5 text-sm">
                      {[
                        ['Batch No.', result.batch.batch_number],
                        ['Mfg Date', result.batch.mfg_date],
                        ['Expiry', result.batch.expiry_date],
                        ['Quantity', result.batch.current_quantity],
                        ['Status', result.batch.status],
                        ['Serial', result.serial?.serial_number?.slice(0, 28) + '…'],
                        ['Scan Count', result.serial?.scan_count],
                      ].map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-slate-400 w-24 shrink-0">{k}:</span>
                          <span className="text-slate-700 font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Supply chain trail */}
            {result.supply_chain_trail?.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold mb-3 flex items-center gap-2">
                  <Truck size={12} /> Supply Chain Audit Trail (Append-only Log)
                </p>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-100">
                  {result.supply_chain_trail.map((ev: any, i: number) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-4 top-0.5 w-3 h-3 rounded-full border-2 border-teal-500 bg-white" />
                      <div className="bg-slate-50 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-teal-700">{ev.stage}</span>
                          <span className="text-xs text-slate-400">{ev.timestamp?.slice(0, 10)}</span>
                        </div>
                        <p className="text-xs text-slate-500">{ev.location}</p>
                        <p className="text-xs text-slate-400 mt-1 font-mono">Hash: {ev.event_hash}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
              <p><strong>Source:</strong> {result.source}</p>
              <p className="mt-1">{result.disclaimer}</p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
