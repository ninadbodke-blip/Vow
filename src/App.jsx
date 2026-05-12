import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider, useLang } from './LanguageContext'
import { supabase } from './supabaseClient'
import LanguageSelector from './screens/onboarding/LanguageSelector'
import SignUp from './screens/onboarding/SignUp'
import AddictionPicker from './screens/onboarding/AddictionPicker'
import TrackerSetup from './screens/onboarding/TrackerSetup'
import Welcome from './screens/onboarding/Welcome'
import SlipFlow from './screens/SlipFlow'
import UrgeFlow from './screens/UrgeFlow'
import Profile from './screens/Profile'
import Milestones from './screens/Milestones'
import Home from './screens/Home'
import SlipHistory from './screens/SlipHistory'
import UrgeLog from './screens/UrgeLog'
import Anchors from './screens/Anchors'
import AnchorPublic from './screens/AnchorPublic'

// ===== Vow Path =====
import VowPathIntro from './screens/vowPath/VowPathIntro'
import StageCheck from './screens/vowPath/StageCheck'
import StageReveal from './screens/vowPath/StageReveal'
import ReflectV2Day from './screens/vowPath/ReflectV2Day'
import ReflectOverview from './screens/vowPath/ReflectOverview'
import SubstancePicker from './screens/vowPath/SubstancePicker'
import LibraryHome from './screens/vowPath/LibraryHome'
import LibraryDeepRead from './screens/vowPath/LibraryDeepRead'
import NoticeOverview from './screens/vowPath/NoticeOverview'
import NoticeDay from './screens/vowPath/NoticeDay'
import CommitOverview from './screens/vowPath/CommitOverview'
import CommitDay from './screens/vowPath/CommitDay'

function AppRoutes() {
  const { lang } = useLang()
  const [session, setSession] = useState(undefined)
  const [hasTrackers, setHasTrackers] = useState(undefined)
  const [onboardingDone, setOnboardingDone] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setHasTrackers(undefined)
      setOnboardingDone(undefined)
    })

    return () => subscription.unsubscribe()
  }, [])

  // When session changes, check trackers + onboarding status
  useEffect(() => {
    async function check() {
      if (!session) {
        setHasTrackers(null)
        setOnboardingDone(null)
        return
      }
      const { count } = await supabase
        .from('trackers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_active', true)
      setHasTrackers(count > 0)

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()
      setOnboardingDone(!!profile?.onboarding_completed)
    }
    if (session) check()
  }, [session])

  // Loading
  if (session === undefined || (session && (hasTrackers === undefined || onboardingDone === undefined))) {
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
      <Route path="/a/:token" element={<AnchorPublic />} />
      <Route 
        path="/" 
        element={
          !lang ? <LanguageSelector /> :
          !session ? <Navigate to="/welcome" /> :
          hasTrackers ? <Navigate to="/home" /> :
          <Navigate to="/onboarding/addiction" />
        } 
      />
      <Route 
        path="/welcome" 
        element={
          !lang ? <Navigate to="/" /> :
          session ? <Navigate to="/home" /> :
          <Welcome />
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
        element={session ? <AddictionPicker onboardingDone={onboardingDone} /> : <Navigate to="/signup" />} 
      />
      <Route 
        path="/onboarding/setup" 
        element={session ? <TrackerSetup /> : <Navigate to="/signup" />} 
      />
      <Route 
        path="/home" 
        element={session ? <Home /> : <Navigate to="/welcome" />} 
      />
      <Route 
        path="/profile" 
        element={session ? <Profile /> : <Navigate to="/welcome" />} 
      />
      <Route 
        path="/slip/:trackerId" 
        element={session ? <SlipFlow /> : <Navigate to="/welcome" />} 
      />
      <Route 
        path="/urge/:trackerId" 
        element={session ? <UrgeFlow /> : <Navigate to="/welcome" />} 
      />
      <Route 
        path="/milestones/:trackerId" 
        element={session ? <Milestones /> : <Navigate to="/welcome" />} 
      />
      <Route 
        path="/slips" 
        element={session ? <SlipHistory /> : <Navigate to="/welcome" />} 
      />
      <Route 
        path="/urges" 
        element={session ? <UrgeLog /> : <Navigate to="/welcome" />} 
      />
      <Route 
        path="/anchors" 
        element={session ? <Anchors /> : <Navigate to="/welcome" />} 
      />

      {/* ===== VOW PATH ===== */}
      <Route
        path="/vow-path"
        element={session ? <VowPathIntro /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/vow-path/substance"
        element={session ? <SubstancePicker /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/vow-path/check"
        element={session ? <StageCheck /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/vow-path/result/:stageSlug"
        element={session ? <StageReveal /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/vow-path/reflect"
        element={session ? <ReflectOverview /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/vow-path/reflect/day/:dayNumber"
        element={session ? <ReflectV2Day /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/vow-path/notice"
        element={session ? <NoticeOverview /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/vow-path/notice/day/:dayNumber"
        element={session ? <NoticeDay /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/vow-path/commit"
        element={session ? <CommitOverview /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/vow-path/commit/day/:dayNumber"
        element={session ? <CommitDay /> : <Navigate to="/welcome" />}
      />

      {/* ===== LIBRARY ===== */}
      <Route
        path="/library/reflect"
        element={session ? <LibraryHome /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/library/reflect/day/:dayNumber"
        element={session ? <LibraryDeepRead /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/library/notice"
        element={session ? <LibraryHome /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/library/notice/day/:dayNumber"
        element={session ? <LibraryDeepRead /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/library/commit"
        element={session ? <LibraryHome /> : <Navigate to="/welcome" />}
      />
      <Route
        path="/library/commit/day/:dayNumber"
        element={session ? <LibraryDeepRead /> : <Navigate to="/welcome" />}
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