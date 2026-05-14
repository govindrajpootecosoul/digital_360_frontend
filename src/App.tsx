import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth'
import { AppLayout } from './components/layout/AppLayout'
import { AuthProvider } from './context/AuthContext'
import { ContentTrackerProvider } from './context/ContentTrackerProvider'
import { StrategyLibraryProvider } from './context/StrategyLibraryProvider'
import { ContentTrackerPage } from './pages/ContentTrackerPage'
import { DashboardPage } from './pages/DashboardPage'
import { InfluencersPage } from './pages/InfluencersPage'
import { LoginPage } from './pages/LoginPage'
import { OutreachPage } from './pages/OutreachPage'
import { SettingsPage } from './pages/SettingsPage'
import { SignupPage } from './pages/SignupPage'
import { StrategyLibraryPage } from './pages/StrategyLibraryPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<RequireAuth />}>
            <Route
              element={
                <ContentTrackerProvider>
                  <StrategyLibraryProvider>
                    <AppLayout />
                  </StrategyLibraryProvider>
                </ContentTrackerProvider>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="influencers" element={<InfluencersPage />} />
              <Route path="outreach" element={<OutreachPage />} />
              <Route path="content" element={<ContentTrackerPage />} />
              <Route path="strategy" element={<StrategyLibraryPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
