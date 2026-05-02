import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider, useLang } from './LanguageContext'
import { supabase } from './supabaseClient'
import LanguageSelector from './screens/onboarding/LanguageSelector'
import SignUp from './screens/onboarding/SignUp'
import AddictionPicker from './screens/onboarding/AddictionPicker'
import TrackerSetup from './screens/onboarding/TrackerSetup'
import SlipFlow from './screens/SlipFlow'
import UrgeFlow from './screens/UrgeFlow'
import Profile from './screens/Profile'
import Milestones from './screens/Milestones'
import Home from './screens/Home'

function AppRoutes() {
  const { lang } = useLang()
  const [session, setSession] = useState(undefined)
  const [hasTrackers, setHasTrackers] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setHasTrackers(undefined) // reset to recheck
    })

    return () => subscription.unsubscribe()
  }, [])

  // When session changes, check if user has trackers
  useEffect(() => {
    async function check() {
      if (!session) {
        setHasTrackers(null)
        return
      }
      const { count } = await supabase
        .from('trackers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_active', true)
      setHasTrackers(count > 0)
    }
    if (session) check()
  }, [session])

  // Loading states
  if (session === undefined || (session && hasTrackers === undefined)) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FAF7F1', color: '#9C8C78', fontFamily: 'Georgia, serif',
      }}>
        Loading...
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          !lang ? <LanguageSelector /> :
          !session ? <Navigate to="/signup" /> :
          hasTrackers ? <Navigate to="/home" /> :
          <Navigate to="/onboarding/addiction" />
        } 
      />
      <Route 
        path="/signup" 
        element={
          session 
            ? (hasTrackers ? <Navigate to="/home" /> : <Navigate to="/onboarding/addiction" />)
            : <SignUp />
        } 
      />
      <Route 
        path="/onboarding/addiction" 
        element={session ? <AddictionPicker /> : <Navigate to="/signup" />} 
      />
      <Route 
        path="/onboarding/setup" 
        element={session ? <TrackerSetup /> : <Navigate to="/signup" />} 
      />
      <Route 
        path="/home" 
        element={session ? <Home /> : <Navigate to="/signup" />} 
      />
      <Route 
  path="/profile" 
  element={session ? <Profile /> : <Navigate to="/signup" />} 
/>
<Route 
  path="/milestones/:trackerId" 
  element={session ? <Milestones /> : <Navigate to="/signup" />} 
/>
      <Route 
  path="/slip/:trackerId" 
  element={session ? <SlipFlow /> : <Navigate to="/signup" />} 
/>
<Route 
  path="/urge/:trackerId" 
  element={session ? <UrgeFlow /> : <Navigate to="/signup" />} 
/>
    </Routes>
  )
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App