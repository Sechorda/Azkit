import React, { useMemo, useState } from 'react'

/**
 * Single-file implementation for the Hard Link (on-prem → cloud) tool.
 * Kept intentionally compact per requirement: each tool => one file under /tools.
 *
 * NOTE: Backend calls are placeholders (TODO stubs). Replace with real fetch/Graph integration later.
 */

type EnvMode = 'server' | 'client'

interface ResolveResult {
  guid: string
  base64: string
}


/* =========================
   GUID Helpers (local only)
   ========================= */

const normalizeGuid = (input: string): string => {
  let g = input.trim()
  if (g.startsWith('{') && g.endsWith('}')) g = g.slice(1, -1)
  return g.toLowerCase()
}
const isValidGuid = (input: string): boolean =>
  /^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(normalizeGuid(input))

const guidToBase64 = (guidInput: string): string => {
  const guid = normalizeGuid(guidInput)
  if (!isValidGuid(guid)) throw new Error('Invalid GUID format')
  const [p1, p2, p3, p4, p5] = guid.split('-')
  const hexToBytes = (hex: string) => {
    const arr: number[] = []
    for (let i = 0; i < hex.length; i += 2) arr.push(parseInt(hex.substring(i, i + 2), 16))
    return arr
  }
  const rev = (a: number[]) => [...a].reverse()
  const all = [
    ...rev(hexToBytes(p1)),
    ...rev(hexToBytes(p2)),
    ...rev(hexToBytes(p3)),
    ...hexToBytes(p4),
    ...hexToBytes(p5)
  ]
  let bin = ''
  for (const b of all) bin += String.fromCharCode(b)
  return btoa(bin)
}

/* =========================
   Placeholder async calls
   ========================= */

const fakeDelay = (ms: number) => new Promise(r => setTimeout(r, ms))

const fetchOnPremGuid = async (upn: string): Promise<string> => {
  // TODO: Implement real on-prem AD query endpoint
  await fakeDelay(500)
  // Simulated GUID (stable hash-like) purely for UI demonstration
  return '11111111-2222-3333-4444-555555555555'
}


const updateCloudAnchor = async (upn: string, base64: string): Promise<void> => {
  // TODO: Graph Update-MgUser -OnPremisesImmutableId
  await fakeDelay(700)
}

const updateOnPremPassword = async (_upn: string, _pwd: string): Promise<void> => {
  // TODO: On-prem AD password update
  await fakeDelay(600)
}

/* =========================
   Component
   ========================= */

const HardLinkTool: React.FC = () => {
  const [mode, setMode] = useState<EnvMode>('client')

  // Shared state
  const [upn, setUpn] = useState('')
  const [objectGuidInput, setObjectGuidInput] = useState('')
  const [password, setPassword] = useState('')
  const [resolving, setResolving] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [resolved, setResolved] = useState<ResolveResult | null>(null)


  const base64FromManual = useMemo(() => {
    if (!objectGuidInput.trim()) return { base64: '', error: '' }
    try {
      return { base64: guidToBase64(objectGuidInput), error: '' }
    } catch (e: any) {
      return { base64: '', error: e?.message || 'Conversion failed' }
    }
  }, [objectGuidInput])

  /* Actions */

  const handleResolveServer = async () => {
    if (!upn.trim()) {
      return
    }
    setResolving(true)
    setResolved(null)
    try {
      const guid = await fetchOnPremGuid(upn.trim())
      const base64 = guidToBase64(guid)
      setResolved({ guid, base64 })
    } catch (e: any) {
    } finally {
      setResolving(false)
    }
  }


  const currentAnchor = useMemo(() => base64FromManual.base64, [base64FromManual.base64])

  const canUpdate = useMemo(() => {
    if (!upn.trim()) return false
    if (mode === 'client') return !!base64FromManual.base64
    return true
  }, [upn, mode, base64FromManual.base64])

  const handleUpdateAnchor = async () => {
    if (!canUpdate) return
    setUpdating(true)
    try {
      let anchor = ''
      if (mode === 'server') {
        const guid = await fetchOnPremGuid(upn.trim())
        anchor = guidToBase64(guid)
      } else {
        anchor = base64FromManual.base64
      }
      await updateCloudAnchor(upn.trim(), anchor)
      if (mode === 'server' && password.trim()) {
        try {
          await updateOnPremPassword(upn.trim(), password)
        } catch (e: any) {
        }
      }
    } catch (e: any) {
    } finally {
      setUpdating(false)
    }
  }

  /* Render helpers */
  const renderEnvSelector = () => (
    <div style={{ ...sectionStyle, textAlign: 'center' }}>
      <h3 style={h3Style}>Environment Mode</h3>
      <div style={{ ...inlineRow, justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => setMode('server')}
          style={modeButtonStyle(mode === 'server')}
          title="Server / Domain Controller: auto resolve ObjectGUID"
        >Server</button>
        <button
          type="button"
          onClick={() => setMode('client')}
          style={modeButtonStyle(mode === 'client')}
          title="Client workstation: manual ObjectGUID entry required"
        >Client</button>
      </div>
      <p style={mutedP}>
        Choose where you are running. Server mode can resolve the ObjectGUID automatically. Client mode requires manual entry.
      </p>
    </div>
  )

  const renderServerForm = () => (
    <div style={sectionStyle}>
      <div style={{ background: 'rgba(224,179,71,0.22)', border: '1px solid #e0b347', color: '#fff3cd', padding: '0.8rem 0.9rem', borderRadius: 8, fontSize: '0.85rem', lineHeight: 1.4, display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
        <span style={{ fontWeight: 900, color: '#e0b347', fontSize: '1rem', lineHeight: 1 }}>!</span>
        <span>
          <strong style={{ color: '#f8e3a1' }}>Password sync notice:</strong> Linking will set the user’s cloud password to the on‑prem password during sync and may sign the user out. Enter it in the optional field, otherwise it will use the current one set.
        </span>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <h4 style={{ ...h3Style, fontSize: '0.8rem' }}>Required</h4>
        <label style={labelStyle}>
          UPN
          <input
            style={inputStyle}
            placeholder="user@domain.com"
            value={upn}
            onChange={e => setUpn(e.target.value)}
          />
        </label>
      </div>

      <div>
        <h4 style={{ ...h3Style, fontSize: '0.8rem' }}>Optional</h4>
        <label style={labelStyle}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            New/Current Password
          </span>
          <input
            style={inputStyle}
            type="password"
            placeholder="Current 365 password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>
      </div>
    </div>
  )

  const renderClientForm = () => {
    const objectGuidCommand = 'Get-ADUser -Filter "UserPrincipalName -eq user@domain.com" -Properties ObjectGUID | Select -ExpandProperty ObjectGUID'
    const copyCommand = () => {
      navigator.clipboard.writeText(objectGuidCommand)
    }
    return (
      <div style={sectionStyle}>
        <div style={{ background: 'rgba(224,179,71,0.22)', border: '1px solid #e0b347', color: '#fff3cd', padding: '0.8rem 0.9rem', borderRadius: 8, fontSize: '0.85rem', lineHeight: 1.4, display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
          <span style={{ fontWeight: 900, color: '#e0b347', fontSize: '1rem', lineHeight: 1 }}>!</span>
          <span>
            <strong style={{ color: '#f8e3a1' }}>Password sync notice:</strong> Linking will set the user’s cloud password to the on‑prem password during sync and may sign the user out. Ensure the on‑prem password is current to avoid disruption.
          </span>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <h4 style={{ ...h3Style, fontSize: '0.8rem' }}>Required</h4>
          <label style={labelStyle}>
            UPN
            <input
              style={inputStyle}
              placeholder="user@domain.com"
              value={upn}
              onChange={e => setUpn(e.target.value)}
            />
          </label>
          <label style={labelStyle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              ObjectGUID
              <button
                type="button"
                onClick={copyCommand}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: '1px solid #e0b347',
                  background: '#e0b347',
                  color: '#000',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  lineHeight: 1
                }}
                title={`Run on a domain controller (Click to copy):\n\n${objectGuidCommand}`}
              >?</button>
            </span>
            <input
              style={inputStyle}
              placeholder="11111111-2222-3333-4444-555555555555"
              value={objectGuidInput}
              onChange={e => setObjectGuidInput(e.target.value)}
            />
          </label>
          {objectGuidInput && (
            <div style={previewBox}>
              {base64FromManual.error
                ? <div style={{ color: '#ff6b6b' }}>{base64FromManual.error}</div>
                : <div><strong>Base64 Anchor:</strong> <code>{base64FromManual.base64}</code></div>}
            </div>
          )}
        </div>


      </div>
    )
  }



  return (
    <div>
      <div style={introBox}>
        <p style={introP}>
          Set the cloud anchor (onPremisesImmutableId) to the base64-encoded AD ObjectGUID to join
          an existing on-prem account with its Azure AD counterpart. Choose environment mode, derive
          the anchor, and update via Microsoft Graph.
        </p>
      </div>

      {renderEnvSelector()}

      {mode === 'server' && renderServerForm()}
      {mode === 'client' && renderClientForm()}

      <div style={{ textAlign: 'center', margin: '0.75rem 0 0.5rem' }}>
        <button
          type="button"
          disabled={!canUpdate || updating}
          onClick={handleUpdateAnchor}
          style={primaryButtonStyle(!canUpdate || updating)}
        >
          {updating ? 'Syncing...' : 'Sync user'}
        </button>
      </div>
    </div>
  )
}

/* =========================
   Lightweight styling objects
   ========================= */

const introBox: React.CSSProperties = {
  background: 'rgba(20,20,20,0.85)',
  padding: '1rem 1.25rem',
  border: '1px solid rgba(100,149,237,0.25)',
  borderRadius: 8,
  marginBottom: '1rem'
}
const introHeading: React.CSSProperties = {
  margin: '0 0 0.5rem 0',
  fontSize: '1.15rem',
  color: 'rgba(255,255,255,0.95)'
}
const introP: React.CSSProperties = {
  margin: 0,
  fontSize: '0.85rem',
  lineHeight: 1.4,
  color: 'rgba(255,255,255,0.7)'
}
const sectionStyle: React.CSSProperties = {
  background: 'rgba(15,15,15,0.6)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '0.85rem 1rem 1rem',
  borderRadius: 8,
  marginBottom: '0.9rem'
}
const h3Style: React.CSSProperties = {
  margin: '0 0 0.5rem 0',
  fontSize: '0.95rem',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.88)'
}
const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'rgba(255,255,255,0.55)',
  marginBottom: '0.55rem'
}
const inputStyle: React.CSSProperties = {
  marginTop: 4,
  background: '#121212',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'rgba(255,255,255,0.9)',
  borderRadius: 6,
  padding: '0.5rem 0.6rem',
  fontSize: '0.8rem',
  outline: 'none'
}
const inlineRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flexWrap: 'wrap',
  marginTop: '0.25rem',
  marginBottom: '0.25rem'
}
const baseBtn: React.CSSProperties = {
  border: '1px solid rgba(100,149,237,0.4)',
  background: 'rgba(100,149,237,0.15)',
  color: 'white',
  padding: '0.45rem 0.8rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  borderRadius: 6,
  cursor: 'pointer',
  backdropFilter: 'blur(4px)'
}
const disabledBtn: React.CSSProperties = {
  opacity: 0.4,
  cursor: 'not-allowed'
}
const primaryButtonStyle = (disabled: boolean): React.CSSProperties => ({
  ...baseBtn,
  background: 'linear-gradient(90deg, rgba(100,149,237,0.5), rgba(100,149,237,0.25))',
  borderColor: 'rgba(100,149,237,0.6)',
  ...(disabled ? disabledBtn : {})
})
const secondaryButtonStyle = (disabled: boolean): React.CSSProperties => ({
  ...baseBtn,
  background: 'rgba(100,149,237,0.15)',
  ...(disabled ? disabledBtn : {})
})
const modeButtonStyle = (active: boolean): React.CSSProperties => ({
  ...baseBtn,
  background: active ? 'rgba(100,149,237,0.4)' : 'rgba(100,149,237,0.15)',
  borderColor: active ? 'rgba(100,149,237,0.8)' : 'rgba(100,149,237,0.35)'
})
const previewBox: React.CSSProperties = {
  background: 'rgba(10,10,10,0.55)',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '0.5rem 0.6rem',
  borderRadius: 6,
  fontSize: '0.7rem',
  lineHeight: 1.3,
  marginTop: '0.5rem',
  wordBreak: 'break-all',
  color: 'rgba(255,255,255,0.85)'
}
const codeInline: React.CSSProperties = {
  background: '#141414',
  padding: '0.15rem 0.35rem',
  borderRadius: 4,
  fontSize: '0.65rem'
}
const codeBlock: React.CSSProperties = {
  display: 'block',
  marginTop: '0.4rem',
  whiteSpace: 'pre',
  background: '#141414',
  padding: '0.6rem 0.7rem',
  fontSize: '0.6rem',
  borderRadius: 6,
  lineHeight: 1.3,
  overflowX: 'auto'
}
const mutedP: React.CSSProperties = {
  fontSize: '0.65rem',
  margin: '0.25rem 0 0.5rem',
  lineHeight: 1.3,
  color: 'rgba(255,255,255,0.55)'
}

export default HardLinkTool
