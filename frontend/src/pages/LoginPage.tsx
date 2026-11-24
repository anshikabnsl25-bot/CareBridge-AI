import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { setSession } from '../lib/auth'
import { Button, Card, Input, Spinner, DisclaimerBanner } from '../components/ui'
import { Heart, Shield, MapPin, Zap } from 'lucide-react'

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [demoAccounts, setDemoAccounts] = useState<any[]>([])
  const [loadingDemo, setLoadingDemo] = useState(true)

  useEffect(() => {
    api.demoAccounts().then(setDemoAccounts).finally(() => setLoadingDemo(false))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.login(email, password)
      setSession(res.access_token, res.user)
      onLogin()
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  function loginAs(acc: any) {
    setEmail(acc.email); setPassword('CareBridge@2026')
    setError('')
  }

  const ROLE_COLORS: Record<string, string> = {
    patient: 'bg-blue-50 border-blue-200 text-blue-700',
    asha_worker: 'bg-purple-50 border-purple-200 text-purple-700',
    specialist: 'bg-teal-50 border-teal-200 text-teal-700',
    pharmacist: 'bg-orange-50 border-orange-200 text-orange-700',
    admin: 'bg-slate-50 border-slate-200 text-slate-700',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-blue-50 flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-700 to-blue-800 text-white py-14 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-2xl">CB</div>
            <h1 className="text-4xl font-black tracking-tight">CareBridge <span className="text-teal-300">AI</span></h1>
          </div>
          <p className="text-xl text-teal-100 font-medium">Intelligent Healthcare Access & Assistance Platform</p>
          <p className="text-sm text-teal-200 mt-2 max-w-2xl mx-auto">
            Bridging the rural healthcare gap — specialist tele-referrals, medicine verification, and smart hospital navigation for underserved communities in India.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg mx-auto text-sm">
            {[
              { icon: <Heart size={18} />, label: 'Rural Specialist Access' },
              { icon: <Shield size={18} />, label: 'Medicine Verification' },
              { icon: <MapPin size={18} />, label: 'Hospital Navigation' },
            ].map((f, i) => (
              <div key={i} className="bg-white/10 rounded-xl py-2.5 px-3 flex flex-col items-center gap-1">
                {f.icon}
                <span className="text-xs text-teal-100">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8">
          {/* Login form */}
          <Card className="h-fit">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Sign In</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input label="Email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@carebridge.org" required />
              <Input label="Password" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password" required />
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700">{error}</div>
              )}
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Sign In to CareBridge
              </Button>
            </form>
            <DisclaimerBanner text="HACKATHON DEMO: Use synthetic fictional patient data only. No real medical records." />
          </Card>

          {/* Demo accounts */}
          <div>
            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Zap size={16} className="text-teal-600" /> Demo Accounts — One Click Login
            </h3>
            {loadingDemo ? <Spinner /> : (
              <div className="space-y-3">
                {demoAccounts.map((acc, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    onClick={() => loginAs(acc)}
                    className={`w-full text-left border rounded-2xl p-4 transition-all hover:shadow-md hover:scale-[1.01] ${ROLE_COLORS[acc.role]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{acc.name}</p>
                        <p className="text-xs opacity-75 mt-0.5">{acc.email}</p>
                        <p className="text-xs mt-1.5 opacity-80">{acc.description}</p>
                      </div>
                      <span className="text-xs font-bold opacity-60 capitalize">{acc.role.replace('_', ' ')}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-3 text-center">Password for all accounts: <code className="bg-slate-100 px-1.5 py-0.5 rounded">CareBridge@2026</code></p>
          </div>
        </div>
      </div>
    </div>
  )
}

