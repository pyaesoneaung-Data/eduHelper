import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AnalyticsLayoutPage from './pages/AnalyticsLayoutPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AnalyticsPlaceholderPage from './pages/AnalyticsPlaceholderPage'
import AdmissionAnalyticsPage from './pages/AdmissionAnalyticsPage'
import CompareProgramsPage from './pages/CompareProgramsPage'
import CostCalculatorPage from './pages/CostCalculatorPage'
import DecisionHubLayoutPage from './pages/DecisionHubLayoutPage'
import HomePage from './pages/HomePage'
import LegalGuardrailPage from './pages/LegalGuardrailPage'
import LogoutPage from './pages/LogoutPage'
import NotFoundPage from './pages/NotFoundPage'
import ProgramDetailPage from './pages/ProgramDetailPage'
import RecommendationPage from './pages/RecommendationPage'
import RedFlagGuidePage from './pages/RedFlagGuidePage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/decision-hub" element={<DecisionHubLayoutPage />}>
          <Route index element={<Navigate to="recommendation" replace />} />
          <Route path="recommendation" element={<RecommendationPage />} />
          <Route path="compare" element={<CompareProgramsPage />} />
          <Route path="cost-calculator" element={<CostCalculatorPage />} />
        </Route>

        <Route path="/recommend" element={<Navigate to="/decision-hub/recommendation" replace />} />
        <Route path="/compare" element={<Navigate to="/decision-hub/compare" replace />} />
        <Route path="/cost-calculator" element={<Navigate to="/decision-hub/cost-calculator" replace />} />

        <Route path="/programs/:programId" element={<ProgramDetailPage />} />

        <Route path="/analytics" element={<AnalyticsLayoutPage />}>
          <Route index element={<AnalyticsPage />} />
          <Route path="admission" element={<AdmissionAnalyticsPage />} />
          <Route
            path="deadlines"
            element={
              <AnalyticsPlaceholderPage
                title="Deadline insights are reserved for a later backend summary."
                description="The analytics layout keeps this slot ready for deadline monitoring once a dedicated summary endpoint is added."
              />
            }
          />
          <Route
            path="ranking"
            element={
              <AnalyticsPlaceholderPage
                title="Ranking insights are withheld until ranking data is standardized."
                description="No ranking chart is shown here because mixed or incomplete ranking sources would create a misleading comparison."
              />
            }
          />
        </Route>
        <Route path="/legal" element={<LegalGuardrailPage />} />
        <Route path="/red-flags" element={<RedFlagGuidePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
