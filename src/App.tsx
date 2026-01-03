import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth()
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

import SleepEntryForm from './components/SleepEntryForm'
import InstallInstructions from './components/InstallInstructions'
import { LogOut } from 'lucide-react'
import { supabase } from './lib/supabaseClient'

function Dashboard() {
  const { user } = useAuth()
  const handleLogout = () => supabase.auth.signOut()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur top-0 sticky z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Spanko Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500 hidden sm:inline">{user?.email}</span>
          <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="py-6">
        <SleepEntryForm />
      </div>
      <InstallInstructions />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
