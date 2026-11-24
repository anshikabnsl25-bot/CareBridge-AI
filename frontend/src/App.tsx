import React, { useState } from 'react'
import { getUser, isAuthenticated } from './lib/auth'
import { LoginPage } from './pages/LoginPage'
import { Sidebar } from './components/Sidebar'
import { PatientDashboard } from './pages/patient/PatientDashboard'
import { AshaWorkerDashboard } from './pages/asha/AshaWorkerDashboard'
import { SpecialistDashboard } from './pages/specialist/SpecialistDashboard'
import { PharmacistDashboard } from './pages/pharmacist/PharmacistDashboard'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { MedicineVerifyPage } from './pages/MedicineVerifyPage'
import { HospitalNavigatePage } from './pages/HospitalNavigatePage'
import { QueuePage } from './pages/QueuePage'
import { AssistantPage } from './pages/AssistantPage'
import { ClinicalCasePage } from './pages/asha/ClinicalCasePage'
import { RegisterPatientPage } from './pages/asha/RegisterPatientPage'
import { AppointmentsPage } from './pages/AppointmentsPage'

function AppContent() {
  const user = getUser()!
  const [currentPage, setCurrentPage] = useState('home')

  function renderPage() {
    const nav = (p: string) => setCurrentPage(p)

    const sharedPages: Record<string, React.ReactElement> = {
      verify: <MedicineVerifyPage />,
      navigate: <HospitalNavigatePage />,
      queue: <QueuePage />,
      assistant: <AssistantPage />,
      appointments: <AppointmentsPage />,
    }

    if (sharedPages[currentPage]) return sharedPages[currentPage]

    if (user.role === 'patient') {
      return <PatientDashboard onNavigate={nav} />
    }

    if (user.role === 'asha_worker') {
      const ashaPages: Record<string, React.ReactElement> = {
        home: <AshaWorkerDashboard onNavigate={nav} />,
        register: <RegisterPatientPage />,
        case: <ClinicalCasePage />,
        triage: <ClinicalCasePage />,
        referrals: <ClinicalCasePage />,
      }
      return ashaPages[currentPage] || <AshaWorkerDashboard onNavigate={nav} />
    }

    if (user.role === 'specialist') {
      return <SpecialistDashboard onNavigate={nav} />
    }

    if (user.role === 'pharmacist') {
      const pharmPages: Record<string, React.ReactElement> = {
        home: <PharmacistDashboard onNavigate={nav} />,
        inventory: <PharmacistDashboard onNavigate={nav} />,
        alerts: <PharmacistDashboard onNavigate={nav} />,
      }
      return pharmPages[currentPage] || <PharmacistDashboard onNavigate={nav} />
    }

    if (user.role === 'admin') {
      return <AdminDashboard />
    }

    return <div className="p-10 text-slate-500">Page not found</div>
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 md:ml-60 p-4 md:p-8 pb-20 max-w-6xl">
        {renderPage()}
      </main>
    </div>
  )
}

export function App() {
  const [authed, setAuthed] = useState(isAuthenticated())

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />
  }

  return <AppContent />
}

export default App
