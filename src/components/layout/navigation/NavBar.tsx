import React, { useEffect, useState } from 'react'
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import SignInButton from '../login/SignInButton'
import SignOutButton from '../login/SignOutButton'
import { APP_NAME } from '../../../App'
import { psEnv, psStatus } from '../../../lib/psBackend'
import '../../../styles/navbar.css'

const NavBar = () => {
  const [envMode, setEnvMode] = useState<'Server' | 'Client' | 'Unknown'>('Unknown')
  const [detecting, setDetecting] = useState(true)
  const [mgConnected, setMgConnected] = useState(false)
  const [mgAccount, setMgAccount] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const res = await psEnv()
        if (ignore) return
        if (res.ok && res.mode) setEnvMode(res.mode)
        else setEnvMode('Client')
      } catch {
        setEnvMode('Client')
      } finally {
        if (!ignore) setDetecting(false)
      }
    })()
    return () => { ignore = true }
  }, [])

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const s = await psStatus()
        if (ignore) return
        setMgConnected(!!s.connected)
        setMgAccount((s as any)?.context?.Account ?? null)
      } catch {
        setMgConnected(false)
        setMgAccount(null)
      }
    })()
    return () => { ignore = true }
  }, [])
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">{APP_NAME}</div>
        <div className="navbar-actions">
          <span className={`env-badge ${envMode.toLowerCase()}`}>
            {detecting ? 'Detecting…' : `Mode: ${envMode}`}
          </span>
          <span className="mggraph-status">
            MgGraph: {mgConnected ? `Connected as ${mgAccount ?? 'unknown'}` : 'Disconnected'}
          </span>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
