import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ContentTrackerProvider } from './context/ContentTrackerProvider'
import { StrategyLibraryProvider } from './context/StrategyLibraryProvider'
import { ContentTrackerPage } from './pages/ContentTrackerPage'
import { DashboardPage } from './pages/DashboardPage'
import { InfluencersPage } from './pages/InfluencersPage'
import { OutreachPage } from './pages/OutreachPage'
import { SettingsPage } from './pages/SettingsPage'
import { StrategyLibraryPage } from './pages/StrategyLibraryPage'

export default function App() {
  return (
    <BrowserRouter>
      <ContentTrackerProvider>
        <StrategyLibraryProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="influencers" element={<InfluencersPage />} />
              <Route path="outreach" element={<OutreachPage />} />
              <Route path="content" element={<ContentTrackerPage />} />
              <Route path="strategy" element={<StrategyLibraryPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </StrategyLibraryProvider>
      </ContentTrackerProvider>
    </BrowserRouter>
  )
}
