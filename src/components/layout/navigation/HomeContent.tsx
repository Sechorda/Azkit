import React, { useEffect, useState } from 'react'
import { useMsal } from '@azure/msal-react'
import { Text } from '@fluentui/react-components'
import { psStatus } from '../../../lib/psBackend'
import PanelLayout from '../PanelLayout'

const HomeContent = () => {
  const { accounts } = useMsal()
  const account = accounts[0]

  const [graphCtx, setGraphCtx] = useState<any | null>(null)
  const [graphError, setGraphError] = useState<string | null>(null)
  const [loadingGraph, setLoadingGraph] = useState(false)

  useEffect(() => {
    let ignore = false
    setLoadingGraph(true)
    ;(async () => {
      try {
        const st = await psStatus()
        if (ignore) return
        if (st.ok && st.connected && st.context) {
          setGraphCtx(st.context)
        } else {
          setGraphCtx(null)
        }
      } catch (e: any) {
        if (!ignore) setGraphError(e?.message || 'Graph status failed')
      } finally {
        if (!ignore) setLoadingGraph(false)
      }
    })()
    return () => { ignore = true }
  }, [])

  return (
    <PanelLayout title="Azure Identity Summary">
      {account && (
        <>
          <div>
            <Text weight="semibold" as="span">Name: </Text>
            <Text as="span">{account.name}</Text>
          </div>
            <div>
            <Text weight="semibold" as="span">Username: </Text>
            <Text as="span">{account.username}</Text>
          </div>
          <div>
            <Text weight="semibold" as="span">Tenant ID: </Text>
            <Text as="span">{account.tenantId}</Text>
          </div>
          <div>
            <Text weight="semibold" as="span">Environment: </Text>
            <Text as="span">{account.environment}</Text>
          </div>
        </>
      )}
      <div style={{ marginTop: '1rem' }}>
        <Text weight="semibold">Microsoft Graph Connection</Text>
        <div style={{ fontSize: '12px', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
          {loadingGraph && 'Loading Graph status...'}
          {!loadingGraph && graphError && <span style={{ color: '#ff6b6b' }}>{graphError}</span>}
          {!loadingGraph && !graphError && !graphCtx && 'Not connected.'}
          {!loadingGraph && graphCtx && (
            <>
              Account: {graphCtx.Account || 'N/A'}{'\n'}
              TenantId: {graphCtx.TenantId || 'N/A'}{'\n'}
              AppName: {graphCtx.AppName || 'N/A'}{'\n'}
              Scopes:{Array.isArray(graphCtx.Scopes) && graphCtx.Scopes.length
                ? '\n - ' + graphCtx.Scopes.join('\n - ')
                : ' N/A'}
            </>
          )}
        </div>
      </div>
    </PanelLayout>
  )
}

export default HomeContent
