import { Link } from 'react-router-dom'
import { useAppShell } from '../context/AppShellContext'

function toggle(active) {
  return active ? 'settings-toggle-btn settings-toggle-btn-active' : 'settings-toggle-btn'
}

function SettingsPage() {
  const { language, setLanguage, theme, setTheme, currency, setCurrency, isAdmin, t } = useAppShell()

  return (
    <div className="page-stack">
      <div className="settings-group">
        <p className="settings-group-label">Appearance</p>
        <div className="settings-panel">
          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">{t('ui.theme', 'Theme')}</span>
            </div>
            <div className="settings-toggle">
              <button className={toggle(theme === 'light')} type="button" onClick={() => setTheme('light')}>
                {t('ui.lightMode', 'Light mode')}
              </button>
              <button className={toggle(theme === 'dark')} type="button" onClick={() => setTheme('dark')}>
                {t('ui.darkMode', 'Dark mode')}
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">{t('ui.language', 'Language')}</span>
              <p className="settings-row-note">Most content still remains in English at this stage.</p>
            </div>
            <div className="settings-toggle">
              <button className={toggle(language === 'en')} type="button" onClick={() => setLanguage('en')}>
                {t('language.english', 'English')}
              </button>
              <button className={toggle(language === 'zh')} type="button" onClick={() => setLanguage('zh')}>
                中文
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-group">
        <p className="settings-group-label">Data</p>
        <div className="settings-panel">
          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Display Currency</span>
              <p className="settings-row-note">
                Local shows costs in each country's own currency — TWD, THB, SGD. USD converts everything for cross-country comparison.
              </p>
            </div>
            <div className="settings-toggle">
              <button className={toggle(currency === 'native')} type="button" onClick={() => setCurrency('native')}>
                Local
              </button>
              <button className={toggle(currency === 'USD')} type="button" onClick={() => setCurrency('USD')}>
                USD
              </button>
            </div>
          </div>
        </div>
      </div>

      {isAdmin ? (
        <div className="settings-group">
          <p className="settings-group-label">Admin</p>
          <div className="settings-panel">
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Session</span>
                <p className="settings-row-note">You are signed in as an admin.</p>
              </div>
              <Link to="/logout" className="danger-text-button">Sign out</Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default SettingsPage
