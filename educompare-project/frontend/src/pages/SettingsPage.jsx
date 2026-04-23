import { Link } from 'react-router-dom'
import { useAppShell } from '../context/AppShellContext'
import InfoCard from '../components/InfoCard'
import PageHeader from '../components/PageHeader'

function SettingsPage() {
  const { language, setLanguage, theme, setTheme, currency, setCurrency, t } = useAppShell()

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={t('nav.settings', 'Settings')}
        title={t('settings.title', 'Settings')}
        description={t(
          'settings.description',
          'Adjust how the platform looks and displays information for you.',
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

      <InfoCard title="Display currency">
        <div className="option-group">
          <button
            className={currency === 'native' ? 'option-button option-button-active' : 'option-button'}
            type="button"
            onClick={() => setCurrency('native')}
          >
            Local
          </button>
          <button
            className={currency === 'USD' ? 'option-button option-button-active' : 'option-button'}
            type="button"
            onClick={() => setCurrency('USD')}
          >
            USD
          </button>
        </div>
        <p className="muted-text">
          Local shows each country's costs in its own currency — Taiwan in TWD, Thailand in THB, Singapore in SGD. USD converts all costs to US dollars, useful if you want to compare across countries or prefer thinking in a global currency.
        </p>
      </InfoCard>

      <InfoCard title="Account">
        <p className="muted-text">You are signed in. Sign out when you're done using the platform.</p>
        <Link to="/logout" className="danger-text-button">Sign out</Link>
      </InfoCard>
    </div>
  )
}

export default SettingsPage
