import { StrictMode, ReactNode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MsalClientProvider from './components/providers/MsalClientProvider'
import LoadingOverlay from './components/layout/loading/LoadingOverlay'
import SideBar from './components/layout/navigation/SideBar'
import NavBar from './components/layout/navigation/NavBar'
import SignInScreen from './components/layout/login/SignInScreen'
import HomeContent from './components/layout/navigation/HomeContent'
import Tool1Content from './components/layout/navigation/Tool1Content'
import Tool2Content from './components/layout/navigation/Tool2Content'
import Tool3Content from './components/layout/navigation/Tool3Content'
import Tool4Content from './components/layout/navigation/Tool4Content'
import './styles/globals.css'
import './styles/layout.css'

export const APP_NAME = "Azkit";

function App({ children }: { children?: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <LoadingOverlay />;
  }

  return (
    <BrowserRouter>
      <MsalClientProvider>
        <>
          {!sessionStorage.getItem('devMode') && <SignInScreen />}
          <div className="app-shell">
            <div className="toolbar">
              <NavBar />
            </div>
            <div className="main-container">
              <div className="side-panel">
                <SideBar />
              </div>
              <div className="content-container">
                <div className="content">
                  <Routes>
                    <Route path="/" element={<HomeContent />} />
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
                    <Route path="/tool1" element={<Tool1Content />} />
                    <Route path="/tool2" element={<Tool2Content />} />
                    <Route path="/tool3" element={<Tool3Content />} />
                    <Route path="/tool4" element={<Tool4Content />} />
                    {children}
                  </Routes>
                </div>
              </div>
            </div>
          </div>
        </>
      </MsalClientProvider>
    </BrowserRouter>
  );
}

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
