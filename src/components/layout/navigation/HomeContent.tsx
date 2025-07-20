import React from 'react'
import { useMsal } from '@azure/msal-react'
import { Text } from '@fluentui/react-components'
import PanelLayout from '../PanelLayout'

const HomeContent = () => {
  const { accounts } = useMsal()
  const account = accounts[0]

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
    </PanelLayout>
  )
}

export default HomeContent
