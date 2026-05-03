import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const translations = {
  en: {
    appName: 'Vow',
    tagline: 'Keep the vow.',
    chooseLanguage: 'Choose your language',
    continue: 'Continue',
    signUp: 'Sign up',
    signIn: 'Sign in',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    pickAddictions: 'What are you quitting?',
    pickUpTo2: 'Choose up to 2 (Premium for more)',
    whenDidYouQuit: 'When did you quit',
    today: 'Today',
    yesterday: 'Yesterday',
    earlier: 'Earlier',
    dailyCost: 'How much did you spend per day?',
    custom: 'Custom Amount',
    next: 'Next',
    back: 'Back',
    finish: 'Finish Setup',
    logUrge: 'Urge Incoming',
    iSlipped: 'I Slipped',
    moneySaved: 'Money Saved',
    longestStreak: 'Longest Streak',
    youveStayed: "You've stayed",
    freeFor: 'free for',
    home: 'Home',
    community: 'Community',
    profile: 'Profile',
  },
  hi: {
    appName: 'Vow',
    tagline: 'अपना वादा निभाओ।',
    chooseLanguage: 'अपनी भाषा चुनें',
    continue: 'आगे बढ़ें',
    signUp: 'साइन अप करें',
    signIn: 'साइन इन करें',
    email: 'ईमेल',
    password: 'पासवर्ड',
    name: 'नाम',
    pickAddictions: 'आप क्या छोड़ रहे हैं?',
    pickUpTo2: '2 तक चुनें (और के लिए प्रीमियम)',
    whenDidYouQuit: 'कब छोड़ा',
    today: 'आज',
    yesterday: 'कल',
    earlier: 'पहले',
    dailyCost: 'रोज़ कितना खर्च होता था?',
    custom: 'अन्य राशि',
    next: 'आगे',
    back: 'पीछे',
    finish: 'तैयार',
    logUrge: 'मन कर रहा है',
    iSlipped: 'हो गई गलती',
    moneySaved: 'पैसे बचाए',
    longestStreak: 'सबसे लंबा स्ट्रीक',
    youveStayed: 'आप रहे हैं',
    freeFor: 'से दूर',
    home: 'होम',
    community: 'समुदाय',
    profile: 'प्रोफाइल',
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('vow_lang') || null)

  useEffect(() => {
    if (lang) localStorage.setItem('vow_lang', lang)
  }, [lang])

  const t = (key) => (translations[lang] || translations.en)[key] || key

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)