import React from 'react'
import { useMsal } from '@azure/msal-react'
import { Card, Text, makeStyles } from '@fluentui/react-components'

const useStyles = makeStyles({
  container: {
    padding: '1rem',
    backgroundColor: '#0a0a0a',
    minHeight: 'calc(100vh - 2rem)'
  },
  card: {
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    backdropFilter: 'blur(20px)',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 0 10px 2px rgba(100, 149, 237, 0.1)'
  },
  property: {
    marginBottom: '0.5rem'
  },
  label: {
    fontWeight: '600',
    marginRight: '0.5rem',
    color: 'rgba(255, 255, 255, 0.9)'
  },
  value: {
    color: 'rgba(255, 255, 255, 0.8)'
  },
  title: {
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '1.5rem'
  }
})

const HomeContent = () => {
  const styles = useStyles()
  const { accounts } = useMsal()
  const account = accounts[0]

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Text size={600} as="h2" block className={styles.title}>
          Azure Identity Summary
        </Text>
        
        {account && (
          <>
            <div className={styles.property}>
              <Text className={styles.label}>Name:</Text>
              <Text className={styles.value}>{account.name}</Text>
            </div>
            <div className={styles.property}>
              <Text className={styles.label}>Username:</Text>
              <Text className={styles.value}>{account.username}</Text>
            </div>
            <div className={styles.property}>
              <Text className={styles.label}>Tenant ID:</Text>
              <Text className={styles.value}>{account.tenantId}</Text>
            </div>
            <div className={styles.property}>
              <Text className={styles.label}>Environment:</Text>
              <Text className={styles.value}>{account.environment}</Text>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default HomeContent
