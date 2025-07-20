import { StrictMode, ReactNode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MsalClientProvider from './components/providers/MsalClientProvider'
import LoadingOverlay from './components/layout/loading/LoadingOverlay'
import SideBar from './components/layout/navigation/SideBar'
import NavBar from './components/layout/navigation/NavBar'
import SignInScreen from './components/layout/login/SignInScreen'
import HomeContent from './components/layout/navigation/HomeContent'
import './styles/globals.css'
import './styles/layout.css'

export const APP_NAME = "Azkit";

function App({ children }: { children: ReactNode }) {
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
                {children}
              </Routes>
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
