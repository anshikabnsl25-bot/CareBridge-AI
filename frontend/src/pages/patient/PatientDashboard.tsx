import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Calendar, ShieldCheck, MapPin, Clock, ChevronRight,
  Heart, CheckCircle2, UserCheck, Volume2, Globe, Wifi, WifiOff,
  Stethoscope, Pill, AlertTriangle
} from 'lucide-react'
import { api } from '../../lib/api'
import { getUser } from '../../lib/auth'
import { Card, Badge, Button, Spinner, DisclaimerBanner } from '../../components/ui'
import { STATUS_COLOR, speak } from '../../lib/utils'

export function PatientDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const user = getUser()
  const [referrals, setReferrals] = useState<any[]>([])
  const [queue, setQueue] = useState<any[]>([])
  const [journey, setJourney] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<'hi' | 'en'>('hi')
  const [textSize, setTextSize] = useState<'normal' | 'large'>('large')
  const [lowBw, setLowBw] = useState(false)

  useEffect(() => {
    Promise.all([
      api.referrals(),
      api.queueDepartments(),
      api.patientJourney('P-0001'), // Sushila Devi's primary journey record
    ]).then(([r, q, j]) => {
      setReferrals(r)
      setQueue(q.slice(0, 4))
      setJourney(j)
    }).finally(() => setLoading(false))
  }, [])

  function playJourneyAudio() {
    const speech = lang === 'hi'
      ? "सुशीला देवी जी, आपकी स्वास्थ्य यात्रा में 7 चरण पूरे हो चुके हैं। आपका कार्डियोलॉजी परामर्श एवं जन औषधि दवा सत्यापन पूर्ण हो चुका है।"
      : "Sushila Devi, your 7-step integrated healthcare journey has completed. Your cardiology consultation and Jan Aushadhi medicine verification are verified."
    speak(speech, lang)
  }

  if (loading) return <div className="flex items-center justify-center h-80"><Spinner size="lg" /></div>

  const isHindi = lang === 'hi'

  const stats = [
    {
      label: isHindi ? 'रेफरल स्थिति' : 'Active Referrals',
      value: isHindi ? 'स्वीकृत (Cardio)' : 'Accepted (Cardio)',
      icon: <Activity size={20} />,
      color: 'text-teal-600 bg-teal-50'
    },
    {
      label: isHindi ? 'टोकन संख्या' : 'Queue Token',
      value: 'CARDIO-014',
      icon: <Clock size={20} />,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      label: isHindi ? 'सत्यापित दवाइयाँ' : 'Medicines Verified',
      value: isHindi ? '2 बैच प्रमाणित' : '2 Batches Valid',
      icon: <ShieldCheck size={20} />,
      color: 'text-green-600 bg-green-50'
    },
    {
      label: isHindi ? 'अस्पताल' : 'Demonstration Hub',
      value: 'AIIMS Gorakhpur',
      icon: <MapPin size={20} />,
      color: 'text-blue-600 bg-blue-50'
    },
  ]

  return (
    <div className={`space-y-6 ${textSize === 'large' ? 'text-base' : 'text-sm'}`}>
      {/* Build for Bharat accessibility bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-teal-600" />
          <span className="text-xs font-semibold text-slate-600">{isHindi ? 'भाषा (Language):' : 'Language:'}</span>
          <button
            onClick={() => setLang('hi')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${isHindi ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'}`}
          >
            हिंदी (Hindi)
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${!isHindi ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'}`}
          >
            English
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>{isHindi ? 'अक्षर आकार:' : 'Text Size:'}</span>
            <button
              onClick={() => setTextSize(textSize === 'large' ? 'normal' : 'large')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-xs"
            >
              {textSize === 'large' ? 'A (बड़ा / Large)' : 'A (सामान्य / Normal)'}
            </button>
          </div>

          <button
            onClick={() => setLowBw(!lowBw)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${lowBw ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}
          >
            {lowBw ? <WifiOff size={14} /> : <Wifi size={14} />}
            <span>{lowBw ? (isHindi ? 'धीमा नेटवर्क मोड' : '2G / Low-Bandwidth Mode') : (isHindi ? 'सामान्य मोड' : 'Standard Mode')}</span>
          </button>

          <Button size="sm" variant="outline" onClick={playJourneyAudio} className="text-xs py-1 px-3">
            <Volume2 size={14} />
            <span>{isHindi ? 'बोलकर सुनाएं' : 'Listen'}</span>
          </Button>
        </div>
      </div>

      {/* Patient Welcome Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-700 via-teal-800 to-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-md"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-medium mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isHindi ? 'सक्रिय एकीकृत स्वास्थ्य यात्रा (Active Integrated Journey)' : 'Active Integrated Patient Journey'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black">
              {isHindi ? 'सुशीला देवी (Sushila Devi)' : 'Sushila Devi'}
            </h1>
            <p className="text-sm opacity-90 mt-1">
              {isHindi
                ? 'उम्र: 58 वर्ष · ग्राम मधुबन, मथुरा (उ.प्र.) · Patient ID: PAT-2026-0001'
                : 'Age: 58 · Gram Madhuban, Mathura (UP) · Patient ID: PAT-2026-0001'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button size="md" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold" onClick={() => onNavigate('verify')}>
              <ShieldCheck size={18} /> {isHindi ? 'दवा क्यूआर जांचें (MediTrust)' : 'Verify Medicine QR'}
            </Button>
            <Button size="md" className="bg-white text-teal-800 hover:bg-teal-50 font-bold" onClick={() => onNavigate('navigate')}>
              <MapPin size={18} /> {isHindi ? 'अस्पताल नक्शा (CareNav)' : 'Hospital Map'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="flex items-center gap-3 border-slate-200">
              <div className={`p-3 rounded-2xl ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-lg md:text-xl font-black text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <DisclaimerBanner text={isHindi
        ? "अनुसंधान प्रोटोटाइप: केयरब्रिज एआई ग्रामीण स्वास्थ्य सुगमता हेतु एक सहायक निर्णय प्रणाली है। यह चिकित्सक के प्रत्यक्ष परामर्श का विकल्प नहीं है।"
        : "RESEARCH PROTOTYPE: CareBridge AI is an assistive decision-support ecosystem for rural healthcare connectivity. Always consult licensed medical staff."} />

      {/* Unified 3-Module Patient Journey Timeline */}
      <Card className="border-teal-100 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserCheck size={20} className="text-teal-600" />
              <span>{isHindi ? 'सुशीला देवी की संपूर्ण स्वास्थ्य यात्रा (Unified Healthcare Journey)' : 'Sushila Devi’s Unified Healthcare Journey'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isHindi
                ? 'केयरकनेक्ट (PHC) ➔ केयरनैव (जिला अस्पताल नेविगेशन) ➔ मेडिट्रस्ट (दवा सत्यापन)'
                : 'CareConnect (Rural Tele-Referral) ➔ CareNav (Hospital Navigation) ➔ MediTrust (Medicine Traceability)'}
            </p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-xs py-1 px-3">
            {isHindi ? '7/7 चरण पूर्ण' : '7/7 Steps Completed'}
          </Badge>
        </div>

        {journey && journey.steps ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-200">
            {journey.steps.map((st: any, i: number) => {
              const isDone = st.completed
              const modColor = st.module === 'CareConnect'
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : st.module === 'CareNav'
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-emerald-100 text-emerald-700 border-emerald-200'

              return (
                <div key={i} className="relative group">
                  <div className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                    isDone ? 'bg-teal-600 text-white ring-4 ring-teal-50' : 'bg-slate-300 text-slate-600'
                  }`}>
                    {isDone ? <CheckCircle2 size={14} /> : st.step}
                  </div>

                  <div className="bg-slate-50 hover:bg-slate-100/80 transition-all rounded-2xl p-4 border border-slate-200/80">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{st.department}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${modColor}`}>
                          {st.module}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                        {st.timestamp}
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                      {st.action}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
      </Card>

      {/* Interconnected Details: Referrals & MediTrust */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* CareConnect: Active Referral */}
        <Card className="border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Stethoscope size={18} className="text-purple-600" />
              <span>{isHindi ? 'केयरकनेक्ट: टेली-रेफरल विवरण' : 'CareConnect: Tele-Referral Record'}</span>
            </h3>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
              {isHindi ? 'विशेषज्ञ द्वारा स्वीकृत' : 'Specialist Accepted'}
            </Badge>
          </div>

          <div className="space-y-2.5 text-xs md:text-sm bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
            <div>
              <span className="text-slate-500">{isHindi ? 'रेफर करने वाली स्वास्थ्य कार्यकर्ता:' : 'Referred By:'}</span>
              <p className="font-bold text-slate-800">पूजा वर्मा (ASHA Lead, Barhaj)</p>
            </div>
            <div>
              <span className="text-slate-500">{isHindi ? 'नियुक्त विशेषज्ञ डॉक्टर:' : 'Assigned Specialist:'}</span>
              <p className="font-bold text-purple-900">Dr. Rajesh K. Sharma, MD (Cardiology)</p>
            </div>
            <div>
              <span className="text-slate-500">{isHindi ? 'डॉक्टर की समीक्षा व निर्देश:' : 'Specialist Clinical Note:'}</span>
              <p className="text-slate-700 italic bg-white p-2.5 rounded-xl border border-purple-100 mt-1">
                "Severe exertional breathlessness & BP 165/102. Advised urgent hospital workup, 12-lead ECG and Telmisartan-Amlodipine initiation."
              </p>
            </div>
          </div>
        </Card>

        {/* MediTrust: Prescribed & Verified Medicines */}
        <Card className="border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Pill size={18} className="text-emerald-600" />
              <span>{isHindi ? 'मेडिट्रस्ट: दवा सत्यापन स्थिति' : 'MediTrust: Medicine Verification'}</span>
            </h3>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('verify')}>
              {isHindi ? 'स्कैन करें' : 'Scan'} <ChevronRight size={14} />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="border border-emerald-200 bg-emerald-50/60 rounded-2xl p-3.5 flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-sm text-slate-800">Amoxicillin & Clavulanate (625mg)</p>
                <p className="text-xs text-slate-500 font-mono">BAT-100-2025-1000 · Cipla Lifesciences</p>
                <p className="text-[11px] text-emerald-800 font-semibold mt-1">✓ CDSCO Jan Aushadhi Verified · Exp: 2027</p>
              </div>
              <Badge className="bg-emerald-600 text-white border-transparent text-[11px]">
                {isHindi ? 'प्रमाणित' : 'Authentic'}
              </Badge>
            </div>

            <div className="border border-emerald-200 bg-emerald-50/60 rounded-2xl p-3.5 flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-sm text-slate-800">Telma-AM (Telmisartan 40mg + Amlodipine 5mg)</p>
                <p className="text-xs text-slate-500 font-mono">BAT-104-2025-1004 · Glenmark Pharma</p>
                <p className="text-[11px] text-emerald-800 font-semibold mt-1">✓ Blockchain-style SHA256 Trail Validated</p>
              </div>
              <Badge className="bg-emerald-600 text-white border-transparent text-[11px]">
                {isHindi ? 'प्रमाणित' : 'Authentic'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Bharat Large Touch-Friendly Navigation Action Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        {[
          { label: isHindi ? 'दवा क्यूआर जांचें' : 'Verify Medicine', sub: 'MediTrust', icon: <ShieldCheck size={24} />, page: 'verify', color: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200' },
          { label: isHindi ? 'अस्पताल नक्शा' : 'Hospital Map', sub: 'CareNav', icon: <MapPin size={24} />, page: 'navigate', color: 'bg-teal-50 text-teal-800 hover:bg-teal-100 border-teal-200' },
          { label: isHindi ? 'टोकन व कतार' : 'Queue Token', sub: 'CARDIO-014', icon: <Clock size={24} />, page: 'queue', color: 'bg-orange-50 text-orange-800 hover:bg-orange-100 border-orange-200' },
          { label: isHindi ? 'स्वास्थ्य सहायक' : 'Health Assistant', sub: 'हिंदी / English', icon: <AlertTriangle size={24} />, page: 'assistant', color: 'bg-purple-50 text-purple-800 hover:bg-purple-100 border-purple-200' },
        ].map((a, i) => (
          <button
            key={i}
            onClick={() => onNavigate(a.page)}
            className={`flex flex-col items-center justify-center text-center gap-1.5 p-5 rounded-2xl font-bold transition-all border shadow-xs hover:scale-[1.02] cursor-pointer ${a.color}`}
          >
            {a.icon}
            <span className="text-sm font-black">{a.label}</span>
            <span className="text-[11px] opacity-75 font-medium">{a.sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
