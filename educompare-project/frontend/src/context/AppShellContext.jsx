import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from '../i18n/translations'

const THEME_STORAGE_KEY = 'unimatch-theme'
const LANGUAGE_STORAGE_KEY = 'unimatch-language'

const AppShellContext = createContext(null)

function readStoredValue(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback
  }

  return window.localStorage.getItem(key) ?? fallback
}

function getTranslationValue(language, key) {
  const dictionary = translations[language] ?? translations.en

  return key.split('.').reduce((value, currentKey) => value?.[currentKey], dictionary)
}

export function AppShellProvider({ children }) {
  const [theme, setTheme] = useState(() => readStoredValue(THEME_STORAGE_KEY, 'light'))
  const [language, setLanguage] = useState(() => readStoredValue(LANGUAGE_STORAGE_KEY, 'en'))
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
      language,
      setLanguage,
      cycleLanguage: () =>
        setLanguage((current) => {
          if (current === 'en') return 'th'
          if (current === 'th') return 'zh'
          return 'en'
        }),
      isSidebarOpen,
      closeSidebar: () => setIsSidebarOpen(false),
      toggleSidebar: () => setIsSidebarOpen((current) => !current),
      t: (key, fallback = key) => getTranslationValue(language, key) ?? fallback,
    }),
    [theme, language, isSidebarOpen],
  )

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
}

export function useAppShell() {
  const context = useContext(AppShellContext)

  if (!context) {
    throw new Error('useAppShell must be used within AppShellProvider.')
  }

  return context
}
