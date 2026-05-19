import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider, useLang } from './LanguageContext'
import { supabase } from './supabaseClient'
import LanguageSelector from './screens/onboarding/LanguageSelector'
import SignUp from './screens/onboarding/SignUp'
import AddictionPicker from './screens/onboarding/AddictionPicker'
import StatePicker from './screens/onboarding/StatePicker'
import TrackerSetup from './screens/onboarding/TrackerSetup'
import Welcome from './screens/onboarding/Welcome'
import SlipFlow from './screens/SlipFlow'
import UrgeFlow from './screens/UrgeFlow'
import Profile from './screens/Profile'
import Milestones from './screens/Milestones'
import SlipHistory from './screens/SlipHistory'
import UrgeLog from './screens/UrgeLog'
import Anchors from './screens/Anchors'
import AnchorPublic from './screens/AnchorPublic'

// ===== Home (free tier router) =====
import HomeRouter from './screens/freeHome/HomeRouter'

// ===== Vow Path =====
import VowPathIntro from './screens/vowPath/VowPathIntro'
import StageCheck from './screens/vowPath/StageCheck'
import StageReveal from './screens/vowPath/StageReveal'
import ReflectV2Day from './screens/vowPath/ReflectV2Day'
import ReflectOverview from './screens/vowPath/ReflectOverview'
import SubstancePicker from './screens/vowPath/SubstancePicker'
import LibraryHome from './screens/vowPath/LibraryHome'
import LibraryStageHome from './screens/vowPath/LibraryStageHome'
import LibraryDeepRead from './screens/vowPath/LibraryDeepRead'
import NoticeOverview from './screens/vowPath/NoticeOverview'
import NoticeDay from './screens/vowPath/NoticeDay'
import CommitOverview from './screens/vowPath/CommitOverview'
import CommitDay from './screens/vowPath/CommitDay'
import EndureOverview from './screens/vowPath/EndureOverview'
import EndureDay from './screens/vowPath/EndureDay'
import StageTransition from './screens/vowPath/StageTransition'
import BuildOverview from './screens/vowPath/BuildOverview'
import BuildDay from './screens/vowPath/BuildDay'

// ===== Motivation =====
import MotivationHome from './screens/motivation/MotivationHome'
import MotivationArticle from './screens/motivation/MotivationArticle'

// ===== Mirror =====
import MirrorScreen from './screens/mirror/MirrorScreen'

function AppRoutes() {
  const { lang } = useLang()
  const [session, setSession] = useState(undefined)
  const [hasOnboardingProgress, setHasOnboardingProgress] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setHasOnboardingProgress(undefined)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function check() {
      if (!session) {
        setHasOnboardingProgress(null)
        return
      }

      const { data: progress } = await supabase
        .from('vow_path_progress')
        .select('primary_substance, free_state')
        .eq('user_id', session.user.id)
        .maybeSingle()

      setHasOnboardingProgress(!!progress?.primary_substance)
    }
    if (session) check()
  }, [session])

  if (session === undefined || (session && hasOnboardingProgress === undefined)) {
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

      {/* ===== ROOT REDIRECT ===== */}
      <Route
        path="/"
        element={
          !lang ? <LanguageSelector /> :
          !session ? <Navigate to="/welcome" /> :
          hasOnboardingProgress ? <Navigate to="/home" /> :
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
            ? (hasOnboardingProgress ? <Navigate to="/home" /> : <Navigate to="/onboarding/addiction" />)
            : <SignUp />
        }
      />

      {/* ===== ONBOARDING ===== */}
      <Route
        path="/onboarding/addiction"
        element={session ? <AddictionPicker /> : <Navigate to="/signup" />}
      />
      <Route
        path="/onboarding/state-picker"
        element={session ? <StatePicker /> : <Navigate to="/signup" />}
      />
      <Route
        path="/onboarding/setup"
        element={session ? <TrackerSetup /> : <Navigate to="/signup" />}
      />

      {/* ===== HOME ===== */}
      <Route
        path="/home"
        element={session ? <HomeRouter /> : <Navigate to="/welcome" />}
      />

      {/* ===== USER-FACING TOOLS ===== */}
      <Route path="/profile" element={session ? <Profile /> : <Navigate to="/welcome" />} />
      <Route path="/slip/:trackerId" element={session ? <SlipFlow /> : <Navigate to="/welcome" />} />
      <Route path="/urge/:trackerId" element={session ? <UrgeFlow /> : <Navigate to="/welcome" />} />
      <Route path="/milestones/:trackerId" element={session ? <Milestones /> : <Navigate to="/welcome" />} />
      <Route path="/slips" element={session ? <SlipHistory /> : <Navigate to="/welcome" />} />
      <Route path="/urges" element={session ? <UrgeLog /> : <Navigate to="/welcome" />} />
      <Route path="/anchors" element={session ? <Anchors /> : <Navigate to="/welcome" />} />

      {/* ===== VOW PATH ===== */}
      <Route path="/vow-path" element={session ? <VowPathIntro /> : <Navigate to="/welcome" />} />
      <Route path="/vow-path/substance" element={session ? <SubstancePicker /> : <Navigate to="/welcome" />} />
      <Route path="/vow-path/check" element={session ? <StageCheck /> : <Navigate to="/welcome" />} />
      <Route path="/vow-path/result/:stageSlug" element={session ? <StageReveal /> : <Navigate to="/welcome" />} />

      <Route path="/vow-path/reflect" element={session ? <ReflectOverview /> : <Navigate to="/welcome" />} />
      <Route path="/vow-path/reflect/day/:dayNumber" element={session ? <ReflectV2Day /> : <Navigate to="/welcome" />} />

      <Route path="/vow-path/notice" element={session ? <NoticeOverview /> : <Navigate to="/welcome" />} />
      <Route path="/vow-path/notice/day/:dayNumber" element={session ? <NoticeDay /> : <Navigate to="/welcome" />} />

      <Route path="/vow-path/commit" element={session ? <CommitOverview /> : <Navigate to="/welcome" />} />
      <Route path="/vow-path/commit/day/:dayNumber" element={session ? <CommitDay /> : <Navigate to="/welcome" />} />

      <Route path="/vow-path/endure" element={session ? <EndureOverview /> : <Navigate to="/welcome" />} />
      <Route path="/vow-path/endure/day/:dayNumber" element={session ? <EndureDay /> : <Navigate to="/welcome" />} />

      <Route path="/vow-path/build" element={session ? <BuildOverview /> : <Navigate to="/welcome" />} />
      <Route path="/vow-path/build/day/:dayNumber" element={session ? <BuildDay /> : <Navigate to="/welcome" />} />

      <Route path="/vow-path/transition/:fromStage/to/:toStage" element={session ? <StageTransition /> : <Navigate to="/welcome" />} />

      {/* ===== LIBRARY ===== */}
      <Route path="/library" element={session ? <LibraryHome /> : <Navigate to="/welcome" />} />
      <Route path="/library/:stage" element={session ? <LibraryStageHome /> : <Navigate to="/welcome" />} />
      <Route path="/library/:stage/day/:dayNumber" element={session ? <LibraryDeepRead /> : <Navigate to="/welcome" />} />

      {/* ===== MOTIVATION ===== */}
      <Route path="/motivation" element={session ? <MotivationHome /> : <Navigate to="/welcome" />} />
      <Route path="/motivation/article/:slug" element={session ? <MotivationArticle /> : <Navigate to="/welcome" />} />

      {/* ===== MIRROR ===== */}
      <Route path="/mirror" element={session ? <MirrorScreen /> : <Navigate to="/welcome" />} />
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