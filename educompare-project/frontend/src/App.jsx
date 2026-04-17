import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminLoginPage from './pages/AdminLoginPage'
import CompareProgramsPage from './pages/CompareProgramsPage'
import CostCalculatorPage from './pages/CostCalculatorPage'
import HomePage from './pages/HomePage'
import LegalGuardrailPage from './pages/LegalGuardrailPage'
import NotFoundPage from './pages/NotFoundPage'
import ProgramDetailPage from './pages/ProgramDetailPage'
import RecommendationPage from './pages/RecommendationPage'
import RedFlagGuidePage from './pages/RedFlagGuidePage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/recommend" element={<RecommendationPage />} />
        <Route path="/programs/:programId" element={<ProgramDetailPage />} />
        <Route path="/compare" element={<CompareProgramsPage />} />
        <Route path="/cost-calculator" element={<CostCalculatorPage />} />
        <Route path="/legal" element={<LegalGuardrailPage />} />
        <Route path="/red-flags" element={<RedFlagGuidePage />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
