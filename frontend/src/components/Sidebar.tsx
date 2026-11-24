import { useState } from 'react'
import { clearSession, getUser } from '../lib/auth'
import {
  Home, Users, Stethoscope, Pill, BarChart3, Settings,
  LogOut, Menu, X, Bell, ChevronRight, Activity, ShieldCheck,
  MapPin, MessageSquare, FlaskConical, TestTube2
} from 'lucide-react'
import { LivePing } from './ui'

const NAV: Record<string, { icon: React.ReactElement; label: string; id: string }[]> = {
  patient: [
    { id: 'home', label: 'Dashboard', icon: <Home size={18} /> },
    { id: 'appointments', label: 'Appointments', icon: <Activity size={18} /> },
    { id: 'verify', label: 'Verify Medicine', icon: <ShieldCheck size={18} /> },
    { id: 'navigate', label: 'Hospital Map', icon: <MapPin size={18} /> },
    { id: 'queue', label: 'My Queue Token', icon: <TestTube2 size={18} /> },
    { id: 'assistant', label: 'Health Assistant', icon: <MessageSquare size={18} /> },
  ],
  asha_worker: [
    { id: 'home', label: 'Dashboard', icon: <Home size={18} /> },
    { id: 'register', label: 'Register Patient', icon: <Users size={18} /> },
    { id: 'case', label: 'Submit Clinical Case', icon: <Stethoscope size={18} /> },
    { id: 'triage', label: 'AI Triage Review', icon: <Activity size={18} /> },
    { id: 'referrals', label: 'Referrals', icon: <FlaskConical size={18} /> },
    { id: 'assistant', label: 'Health Assistant', icon: <MessageSquare size={18} /> },
  ],
  specialist: [
    { id: 'home', label: 'Dashboard', icon: <Home size={18} /> },
    { id: 'cases', label: 'Assigned Cases', icon: <Stethoscope size={18} /> },
    { id: 'pending', label: 'Pending Reviews', icon: <Activity size={18} /> },
    { id: 'reviewed', label: 'Reviewed', icon: <ShieldCheck size={18} /> },
  ],
  pharmacist: [
    { id: 'home', label: 'Dashboard', icon: <Home size={18} /> },
    { id: 'inventory', label: 'Inventory', icon: <Pill size={18} /> },
    { id: 'verify', label: 'QR Verification', icon: <ShieldCheck size={18} /> },
    { id: 'alerts', label: 'Suspicious Alerts', icon: <Bell size={18} /> },
  ],
  admin: [
    { id: 'home', label: 'Dashboard', icon: <Home size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'users', label: 'User Management', icon: <Users size={18} /> },
    { id: 'audit', label: 'Audit Logs', icon: <Settings size={18} /> },
  ],
}

const ROLE_COLOR: Record<string, string> = {
  patient: 'bg-blue-600',
  asha_worker: 'bg-purple-600',
  specialist: 'bg-teal-600',
  pharmacist: 'bg-orange-600',
  admin: 'bg-slate-800',
}

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [open, setOpen] = useState(false)
  const user = getUser()
  if (!user) return null

  const navItems = NAV[user.role] || []

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">CB</div>
          <div>
            <p className="font-bold text-sm text-slate-800">CareBridge AI</p>
            <p className="text-[10px] text-slate-400">Healthcare Platform</p>
          </div>
        </div>
      </div>

      {/* User pill */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className={`rounded-xl px-3 py-2.5 text-white ${ROLE_COLOR[user.role]}`}>
          <p className="text-xs opacity-80 capitalize">{user.role.replace('_', ' ')}</p>
          <p className="font-semibold text-sm truncate">{user.full_name}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => { onNavigate(item.id); setOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentPage === item.id
                ? 'bg-teal-50 text-teal-700 border border-teal-100'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {item.icon}
            {item.label}
            {currentPage === item.id && <ChevronRight size={14} className="ml-auto text-teal-500" />}
          </button>
        ))}
      </nav>

      {/* Live status */}
      <div className="px-4 py-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <LivePing />
          <span>System Online</span>
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          onClick={() => { clearSession(); window.location.reload() }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-teal-600 text-white p-2 rounded-xl shadow-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">{content}</div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-slate-100 fixed left-0 top-0 z-30">
        {content}
      </div>
    </>
  )
}
