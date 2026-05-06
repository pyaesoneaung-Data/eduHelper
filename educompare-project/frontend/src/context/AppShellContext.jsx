import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from '../i18n/translations'

const THEME_STORAGE_KEY = 'unimatch-theme'
const LANGUAGE_STORAGE_KEY = 'unimatch-language'
const CURRENCY_STORAGE_KEY = 'unimatch-currency'
const SIDEBAR_COLLAPSED_KEY = 'unimatch-sidebar-collapsed'
const IS_ADMIN_KEY = 'unimatch-is-admin'

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
  const [language, setLanguage] = useState(() => {
    const stored = readStoredValue(LANGUAGE_STORAGE_KEY, 'en')
    return stored === 'th' ? 'en' : stored
  })
  const [currency, setCurrency] = useState(() => readStoredValue(CURRENCY_STORAGE_KEY, 'USD'))
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => readStoredValue(SIDEBAR_COLLAPSED_KEY, 'false') === 'true',
  )
  const [isAdmin] = useState(
    () => readStoredValue(IS_ADMIN_KEY, 'false') === 'true',
  )

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
  }, [currency])

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
      language,
      setLanguage,
      currency,
      setCurrency,
      toggleCurrency: () => setCurrency((current) => (current === 'USD' ? 'native' : 'USD')),
      cycleLanguage: () =>
        setLanguage((current) => (current === 'en' ? 'zh' : 'en')),
      isSidebarOpen,
      closeSidebar: () => setIsSidebarOpen(false),
      toggleSidebar: () => setIsSidebarOpen((current) => !current),
      isSidebarCollapsed,
      toggleSidebarCollapsed: () => setIsSidebarCollapsed((current) => !current),
      isAdmin,
      t: (key, fallback = key) => getTranslationValue(language, key) ?? fallback,
    }),
    [theme, language, currency, isSidebarOpen, isSidebarCollapsed, isAdmin],
  )

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppShell() {
  const context = useContext(AppShellContext)

  if (!context) {
    throw new Error('useAppShell must be used within AppShellProvider.')
  }

  return context
}
