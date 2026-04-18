import { useAppShell } from '../context/AppShellContext'
import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function SettingsPage() {
  const { language, setLanguage, theme, setTheme, t } = useAppShell()

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={t('nav.settings', 'Settings')}
        title={t('settings.title', 'Settings')}
        description={t(
          'settings.description',
          'Control theme and language foundations for the future multi-language dashboard.',
        )}
      />

      <div className="two-column-grid">
        <InfoCard title={t('ui.theme', 'Theme')}>
          <div className="option-group">
            <button
              className={theme === 'light' ? 'option-button option-button-active' : 'option-button'}
              type="button"
              onClick={() => setTheme('light')}
            >
              {t('ui.lightMode', 'Light mode')}
            </button>
            <button
              className={theme === 'dark' ? 'option-button option-button-active' : 'option-button'}
              type="button"
              onClick={() => setTheme('dark')}
            >
              {t('ui.darkMode', 'Dark mode')}
            </button>
          </div>
        </InfoCard>

        <InfoCard title={t('ui.language', 'Language')}>
          <div className="option-group">
            <button
              className={language === 'en' ? 'option-button option-button-active' : 'option-button'}
              type="button"
              onClick={() => setLanguage('en')}
            >
              {t('language.english', 'English')}
            </button>
            <button
              className={language === 'th' ? 'option-button option-button-active' : 'option-button'}
              type="button"
              onClick={() => setLanguage('th')}
            >
              {t('language.thai', 'Thai')}
            </button>
            <button
              className={language === 'zh' ? 'option-button option-button-active' : 'option-button'}
              type="button"
              onClick={() => setLanguage('zh')}
            >
              {t('language.chinese', 'Chinese')}
            </button>
          </div>
          <p className="muted-text">
            The translation structure is prepared for future expansion. Most content still remains in English at this stage.
          </p>
        </InfoCard>
      </div>
    </div>
  )
}

export default SettingsPage
