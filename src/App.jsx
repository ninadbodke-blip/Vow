import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/PageTransition'
import { LanguageProvider } from './LanguageContext'
import { supabase } from './supabaseClient'
import { Capacitor } from '@capacitor/core'
import { SocialLogin } from '@capgo/capacitor-social-login'
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
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'

// ===== Marketing (public, indexed by Google) =====
import MarketingHome from './marketing/Home'
import MarketingAbout from './marketing/About'
import MarketingHowItWorks from './marketing/HowItWorks'
import MarketingPricing from './marketing/Pricing'
import MarketingFaq from './marketing/Faq'
import MarketingContact from './marketing/Contact'

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
import ReclaimOverview from './screens/vowPath/ReclaimOverview'
import ReclaimDay from './screens/vowPath/ReclaimDay'

// ===== Motivation =====
import MotivationHome from './screens/motivation/MotivationHome'
import MotivationArticle from './screens/motivation/MotivationArticle'

// ===== Mirror =====
import MirrorScreen from './screens/mirror/MirrorScreen'

// =====================================================================
// VOW PATH ACCESS GATE
// =====================================================================
// Vow Path is the paid guided journey. While we are still pre-paywall and
// actively showing the product to reviewers / investors / early testers,
// the gate is intentionally a simple session check: any signed-in user can
// walk the full journey.
//
// When billing ships, restrictions go back inside vowGate() below — either
// an entitlements check ("user has purchased Vow Path"), an allowlist, or
// both. The 17 route call sites do not need to change.
function vowGate(session, element) {
  if (!session) return <Navigate to="/app/welcome" replace />
  return element
}

function AppRoutes() {
  const location = useLocation()
  const [session, setSession] = useState(undefined)
  const [hasOnboardingProgress, setHasOnboardingProgress] = useState(undefined)

  // 1. Session listener
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

  // 2. Native Google sign-in init (runs once on mount, native platforms only)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SocialLogin.initialize({
        google: { webClientId: '751166391094-ghsv1o97d9jj2pp6dc4g897auh414lli.apps.googleusercontent.com' },
      })
    }
  }, [])

  // 3. Onboarding progress check
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
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
      {/* ===== PUBLIC ROUTES (no auth, no /app prefix) ===== */}
      <Route path="/a/:token" element={<AnchorPublic />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />

      {/* ===== MARKETING (root, public, indexed) ===== */}
      {/* Native Capacitor APK skips marketing and goes straight to the app entry. */}
      <Route
        path="/"
        element={Capacitor.isNativePlatform() ? <Navigate to="/app" replace /> : <MarketingHome />}
      />
      <Route path="/about" element={<MarketingAbout />} />
      <Route path="/how-it-works" element={<MarketingHowItWorks />} />
      <Route path="/pricing" element={<MarketingPricing />} />
      <Route path="/faq" element={<MarketingFaq />} />
      <Route path="/contact" element={<MarketingContact />} />

      {/* ===== APP ENTRY (auth-aware redirect) ===== */}
      <Route
        path="/app"
        element={
          !session ? <Navigate to="/app/welcome" /> :
          hasOnboardingProgress ? <Navigate to="/app/home" /> :
          <Navigate to="/app/onboarding/addiction" />
        }
      />

      <Route
        path="/app/welcome"
        element={
          session ? <Navigate to="/app/home" /> :
          <Welcome />
        }
      />

      <Route
        path="/app/signup"
        element={
          session
            ? (hasOnboardingProgress ? <Navigate to="/app/home" /> : <Navigate to="/app/onboarding/addiction" />)
            : <SignUp />
        }
      />

      {/* ===== ONBOARDING ===== */}
      <Route
        path="/app/onboarding/addiction"
        element={session ? <AddictionPicker /> : <Navigate to="/app/signup" />}
      />
      <Route
        path="/app/onboarding/state-picker"
        element={session ? <StatePicker /> : <Navigate to="/app/signup" />}
      />
      <Route
        path="/app/onboarding/setup"
        element={session ? <TrackerSetup /> : <Navigate to="/app/signup" />}
      />

      {/* ===== HOME ===== */}
      <Route
        path="/app/home"
        element={session ? <HomeRouter /> : <Navigate to="/app/welcome" />}
      />

      {/* ===== USER-FACING TOOLS ===== */}
      <Route path="/app/profile" element={session ? <Profile /> : <Navigate to="/app/welcome" />} />
      <Route path="/app/slip/:trackerId" element={session ? <SlipFlow /> : <Navigate to="/app/welcome" />} />
      <Route path="/app/urge/:trackerId" element={session ? <UrgeFlow /> : <Navigate to="/app/welcome" />} />
      <Route path="/app/milestones/:trackerId" element={session ? <Milestones /> : <Navigate to="/app/welcome" />} />
      <Route path="/app/slips" element={session ? <SlipHistory /> : <Navigate to="/app/welcome" />} />
      <Route path="/app/urges" element={session ? <UrgeLog /> : <Navigate to="/app/welcome" />} />
      <Route path="/app/anchors" element={session ? <Anchors /> : <Navigate to="/app/welcome" />} />

      {/* ===== VOW PATH ===== */}
      <Route path="/app/vow-path" element={vowGate(session, <VowPathIntro />)} />
      <Route path="/app/vow-path/substance" element={vowGate(session, <SubstancePicker />)} />
      <Route path="/app/vow-path/check" element={vowGate(session, <StageCheck />)} />
      <Route path="/app/vow-path/result/:stageSlug" element={vowGate(session, <StageReveal />)} />

      <Route path="/app/vow-path/reflect" element={vowGate(session, <ReflectOverview />)} />
      <Route path="/app/vow-path/reflect/day/:dayNumber" element={vowGate(session, <ReflectV2Day />)} />

      <Route path="/app/vow-path/notice" element={vowGate(session, <NoticeOverview />)} />
      <Route path="/app/vow-path/notice/day/:dayNumber" element={vowGate(session, <NoticeDay />)} />

      <Route path="/app/vow-path/commit" element={vowGate(session, <CommitOverview />)} />
      <Route path="/app/vow-path/commit/day/:dayNumber" element={vowGate(session, <CommitDay />)} />

      <Route path="/app/vow-path/endure" element={vowGate(session, <EndureOverview />)} />
      <Route path="/app/vow-path/endure/day/:dayNumber" element={vowGate(session, <EndureDay />)} />

      <Route path="/app/vow-path/build" element={vowGate(session, <BuildOverview />)} />
      <Route path="/app/vow-path/build/day/:dayNumber" element={vowGate(session, <BuildDay />)} />

      <Route path="/app/vow-path/reclaim" element={vowGate(session, <ReclaimOverview />)} />
      <Route path="/app/vow-path/reclaim/day/:dayNumber" element={vowGate(session, <ReclaimDay />)} />

      <Route path="/app/vow-path/transition/:fromStage/to/:toStage" element={vowGate(session, <StageTransition />)} />

      {/* ===== LIBRARY ===== */}
      <Route path="/app/library" element={session ? <LibraryHome /> : <Navigate to="/app/welcome" />} />
      <Route path="/app/library/:stage" element={session ? <LibraryStageHome /> : <Navigate to="/app/welcome" />} />
      <Route path="/app/library/:stage/day/:dayNumber" element={session ? <LibraryDeepRead /> : <Navigate to="/app/welcome" />} />

      {/* ===== MOTIVATION ===== */}
      <Route path="/app/motivation" element={session ? <MotivationHome /> : <Navigate to="/app/welcome" />} />
      <Route path="/app/motivation/article/:slug" element={session ? <MotivationArticle /> : <Navigate to="/app/welcome" />} />

      {/* ===== MIRROR ===== */}
      <Route path="/app/mirror" element={session ? <MirrorScreen /> : <Navigate to="/app/welcome" />} />
    </Routes>
      </PageTransition>
    </AnimatePresence>
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